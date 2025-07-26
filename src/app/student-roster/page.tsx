
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addStudentAction, getStudentsAction, deleteStudentAction } from '@/lib/actions';
import { Loader2, Trash2, UserPlus, Upload, Users } from 'lucide-react';
import type { Student } from '@/lib/firestore';
import { useAuth } from '@/context/auth-context';

export default function StudentRosterPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const { toast } = useToast();
  const { authStatus, user } = useAuth();

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPhoto, setNewStudentPhoto] = useState<string | null>(null);
  const [newStudentFileName, setNewStudentFileName] = useState('');

  // Fetch students on component mount with caching
  useEffect(() => {
    async function fetchStudents() {
      if (authStatus !== 'authenticated' || !user) {
          setIsLoading(false);
          return;
      }

      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTime;
      
      // If we have cached data and it's still fresh, use it
      if (students.length > 0 && timeSinceLastFetch < CACHE_DURATION) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const token = await user.getIdToken();
      const result = await getStudentsAction(token);
      if (result.success && result.data) {
        setStudents(result.data);
        setLastFetchTime(now);
      } else {
        toast({ title: "Error", description: result.error || "Could not load students.", variant: "destructive" });
      }
      setIsLoading(false);
    }
    fetchStudents();
  }, [authStatus, toast, user, lastFetchTime, students.length, CACHE_DURATION]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewStudentFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewStudentPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to refresh cache
  const refreshCache = () => {
    setLastFetchTime(0); // Reset cache time to force refresh
  };

  const handleAddStudent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newStudentName.trim() || !newStudentPhoto || !user) {
      toast({ title: "Missing Information", description: "Please provide a name, a photo, and be logged in.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const token = await user.getIdToken();
    const addResult = await addStudentAction({ name: newStudentName, photoDataUri: newStudentPhoto }, token);
    
    if (addResult.success && addResult.data) {
      setStudents(addResult.data);
      setLastFetchTime(Date.now()); // Update cache time
      setNewStudentName('');
      setNewStudentPhoto(null);
      setNewStudentFileName('');
      toast({ title: "Success", description: "Student added to the roster." });
    } else {
      toast({ title: "Error", description: addResult.error || "Failed to add student.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };
  
  const handleDeleteStudent = async (id: string) => {
    if (!user) return;
    const originalStudents = [...students];
    setStudents(students.filter(s => s.id !== id)); // Optimistic UI update
    
    const token = await user.getIdToken();
    const deleteResult = await deleteStudentAction(id, token);
    if(deleteResult.success && deleteResult.data) {
      toast({ title: "Success", description: "Student removed." });
      setStudents(deleteResult.data);
      setLastFetchTime(Date.now()); // Update cache time
    } else {
       toast({ title: "Error", description: deleteResult.error || "Failed to remove student.", variant: "destructive" });
       setStudents(originalStudents); // Revert on failure
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold font-headline">Student Roster Management</h1>
          <p className="text-muted-foreground">Add, view, and manage students for face recognition attendance.</p>
        </div>
        <Button 
          onClick={refreshCache} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 animate-spin h-4 w-4" /> : <Users className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 space-y-8 md:sticky md:top-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><UserPlus /> Add New Student</CardTitle>
                    <CardDescription>Enter the student's name and upload their photo.</CardDescription>
                </CardHeader>
                 <form onSubmit={handleAddStudent}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="student-name">Student Name</Label>
                        <Input id="student-name" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="e.g., Jane Doe" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="photo-upload">Student Photo</Label>
                        <div className="flex items-center gap-2">
                            <Input id="photo-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" required/>
                             <Button asChild variant="outline">
                                <Label htmlFor="photo-upload" className="cursor-pointer">
                                <Upload className="mr-2" />
                                Choose Photo
                                </Label>
                            </Button>
                        </div>
                        {newStudentFileName && <p className="text-xs text-muted-foreground">{newStudentFileName}</p>}
                    </div>

                    {newStudentPhoto && (
                        <div className="mt-4 border rounded-md p-2">
                            <Image src={newStudentPhoto} alt="New student preview" width={100} height={100} className="w-full h-auto rounded-md object-contain max-h-48" />
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <UserPlus className="mr-2" />}
                        {isSubmitting ? 'Adding...' : 'Add Student'}
                    </Button>
                </CardFooter>
                </form>
            </Card>
        </div>
        
        <div className="md:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Users /> Class Roster</CardTitle>
                    <CardDescription>
                        There are {students.length} students in the roster.
                        {lastFetchTime > 0 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                                (Last updated: {new Date(lastFetchTime).toLocaleTimeString()})
                            </span>
                        )}
                    </CardDescription>
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
                                <Card key={student.id} className="overflow-hidden group">
                                    <CardContent className="p-0">
                                        <div className="relative aspect-square w-full">
                                          <Image src={student.photoDataUri} alt={`Photo of ${student.name}`} layout="fill" objectFit="cover" data-ai-hint="student portrait" />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button size="icon" variant="destructive" onClick={() => handleDeleteStudent(student.id)}>
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete {student.name}</span>
                                            </Button>
                                          </div>
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
                                <p className="text-sm">Add a student using the form to get started.</p>
                            </div>
                        )
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
