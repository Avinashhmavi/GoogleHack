
"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getStudentsAction, clearAllCaches } from '@/lib/actions';
import { Loader2, Trash2, UserPlus, Upload, Users } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function StudentRosterPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { authStatus } = useAuth();

  // Fetch students on component mount
  const fetchStudents = useCallback(async () => {
    if (authStatus !== 'authenticated') {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    const result = await getStudentsAction();
    if (result.success && result.data) {
      setStudents(result.data);
    } else {
      toast({ title: "Error", description: result.error || "Could not load students.", variant: "destructive" });
    }
    setIsLoading(false);
  }, [authStatus, toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Add a function to refresh student data
  const handleRefresh = useCallback(async () => {
    // Clear cache and fetch fresh data
    clearAllCaches();
    const result = await getStudentsAction();
    if (result.success && result.data) {
      setStudents(result.data);
    } else {
      toast({ title: "Error", description: result.error || "Could not load students.", variant: "destructive" });
    }
  }, [toast]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Student Roster Management</h1>
        <p className="text-muted-foreground">Add, view, and manage students for face recognition attendance.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
         <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Users /> Class Roster</CardTitle>
                <CardDescription>There are {students.length} students in the roster.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="animate-spin text-primary w-8 h-8" />
                    </div>
                ) : (
                    students.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {students.map((student) => (
                            <Card key={student.id} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="relative aspect-square w-full">
                                      <Image 
                                        src={student.photoDataUri} 
                                        alt={`Photo of ${student.name}`} 
                                        layout="fill" 
                                        objectFit="cover" 
                                        data-ai-hint="student portrait"
                                        unoptimized={true} // Skip image optimization for data URIs
                                      />
                                    </div>
                                </CardContent>
                                <CardFooter className="p-2 flex-col items-start">
                                    <p className="font-semibold w-full truncate text-sm">{student.name}</p>
                                </CardFooter>
                            </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                            <p>No students in the roster.</p>
                        </div>
                    )
                )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Refresh Data
              </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
