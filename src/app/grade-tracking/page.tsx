
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, UserPlus, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { addGradeAction, getGradesAction, deleteGradeAction } from "@/lib/actions";
import type { LocalGradeEntry } from "@/lib/local-data";
import { useAuth } from "@/context/auth-context";

export default function GradeTrackingPage() {
  const [grades, setGrades] = useState<LocalGradeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { authStatus } = useAuth();

  useEffect(() => {
    async function fetchGrades() {
        setIsLoading(true);
        const result = await getGradesAction();
        if(result.success) {
            setGrades(result.data);
        } else {
            toast({ title: "Error", description: "Could not fetch grades.", variant: "destructive" });
        }
        setIsLoading(false);
    }
    if (authStatus === 'authenticated') {
        fetchGrades();
    }
  }, [authStatus, toast]);


  const classes = useMemo(() => {
    const classSet = new Set(grades.map(grade => grade.className));
    return Array.from(classSet).sort();
  }, [grades]);

  const handlePrint = () => {
    window.print();
  };
  
  const addGrade = async (entry: Omit<LocalGradeEntry, 'id'>) => {
    const result = await addGradeAction(entry);
    if(result.success) {
        setGrades(result.data);
        setIsDialogOpen(false);
        toast({title: "Success", description: "Grade has been added."})
    } else {
        toast({title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const deleteGrade = async (id: string) => {
    const originalGrades = [...grades];
    setGrades(prev => prev.filter(grade => grade.id !== id));
    
    const result = await deleteGradeAction(id);
    if(result.success) {
        setGrades(result.data);
        toast({ title: "Success", description: "Grade has been removed." });
    } else {
        setGrades(originalGrades);
        toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Grade Tracking</h1>
          <p className="text-muted-foreground">Monitor student performance and generate reports class-wise.</p>
        </div>
        <div className="flex gap-2 no-print">
            <AddGradeDialog onAddGrade={addGrade} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
            <Button onClick={handlePrint} variant="outline">
                <Printer className="mr-2" />
                Print / Export
            </Button>
        </div>
      </div>
      
      <div className="printable-area">
        <Card>
            <CardHeader className="no-print">
                <CardTitle className="font-headline">Student Grades</CardTitle>
                <CardDescription>A summary of all recorded student grades, organized by class.</CardDescription>
            </CardHeader>
            <CardContent>
             {isLoading ? (
                <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin text-primary" /></div>
             ) : classes.length > 0 ? (
              <Tabs defaultValue={classes[0]} className="w-full">
                <TabsList className="no-print">
                  {classes.map(className => (
                    <TabsTrigger key={className} value={className}>{className}</TabsTrigger>
                  ))}
                </TabsList>
                {classes.map(className => (
                    <TabsContent key={className} value={className}>
                       <div className="print-class-header hidden pt-4 pb-2">
                          <h2 className="text-xl font-semibold">{className}</h2>
                       </div>
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead className="text-right">Grade (%)</TableHead>
                                <TableHead className="w-[50px] no-print"></TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {grades.filter(g => g.className === className).map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="font-medium">{entry.studentName}</TableCell>
                                    <TableCell>{entry.subject}</TableCell>
                                    <TableCell className="text-right">{entry.grade}</TableCell>
                                    <TableCell className="no-print">
                                        <Button variant="ghost" size="icon" onClick={() => deleteGrade(entry.id)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                            <span className="sr-only">Delete</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                ))}
              </Tabs>
              ) : (
                 <div className="flex items-center justify-center h-48 text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                    <p>No grades recorded yet. Add a grade to get started.</p>
                </div>
              )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}


function AddGradeDialog({ onAddGrade, open, onOpenChange }: { onAddGrade: (entry: Omit<LocalGradeEntry, 'id'>) => void; open: boolean; onOpenChange: (open: boolean) => void; }) {
    const [studentName, setStudentName] = useState("");
    const [subject, setSubject] = useState("");
    const [grade, setGrade] = useState("");
    const [className, setClassName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(studentName && subject && grade && className) {
            setIsSubmitting(true);
            await onAddGrade({ studentName, subject, grade: Number(grade), className });
            setStudentName("");
            setSubject("");
            setGrade("");
            setClassName("");
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2" />
                    Add Grade
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="font-headline">Add New Grade</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="studentName" className="text-right">Name</Label>
                            <Input id="studentName" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="className" className="text-right">Class</Label>
                            <Input id="className" value={className} onChange={(e) => setClassName(e.target.value)} className="col-span-3" placeholder="e.g., Grade 5" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subject" className="text-right">Subject</Label>
                            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="grade" className="text-right">Grade (%)</Label>
                            <Input id="grade" type="number" min="0" max="100" value={grade} onChange={(e) => setGrade(e.target.value)} className="col-span-3" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 animate-spin" />}
                            Add Grade
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
