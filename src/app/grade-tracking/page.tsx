"use client";

import { useState } from "react";
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
import { Printer, UserPlus, Trash2 } from "lucide-react";
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

type GradeEntry = {
  id: number;
  studentName: string;
  subject: string;
  grade: number;
};

const initialGrades: GradeEntry[] = [
  { id: 1, studentName: "Alice Johnson", subject: "Mathematics", grade: 92 },
  { id: 2, studentName: "Bob Williams", subject: "Mathematics", grade: 85 },
  { id: 3, studentName: "Alice Johnson", subject: "History", grade: 88 },
  { id: 4, studentName: "Charlie Brown", subject: "Science", grade: 78 },
  { id: 5, studentName: "Bob Williams", subject: "Science", grade: 95 },
];

export default function GradeTrackingPage() {
  const [grades, setGrades] = useState<GradeEntry[]>(initialGrades);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };
  
  const addGrade = (entry: Omit<GradeEntry, 'id'>) => {
    setGrades(prev => [...prev, { ...entry, id: Date.now() }]);
    setIsDialogOpen(false);
  };

  const deleteGrade = (id: number) => {
    setGrades(prev => prev.filter(grade => grade.id !== id));
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Grade Tracking</h1>
          <p className="text-muted-foreground">Monitor student performance and generate reports.</p>
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
                <CardDescription>A summary of all recorded student grades.</CardDescription>
            </CardHeader>
            <CardContent>
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
                {grades.length > 0 ? (
                    grades.map((entry) => (
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
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No grades recorded yet.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}


function AddGradeDialog({ onAddGrade, open, onOpenChange }: { onAddGrade: (entry: Omit<GradeEntry, 'id'>) => void; open: boolean; onOpenChange: (open: boolean) => void; }) {
    const [studentName, setStudentName] = useState("");
    const [subject, setSubject] = useState("");
    const [grade, setGrade] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(studentName && subject && grade) {
            onAddGrade({ studentName, subject, grade: Number(grade) });
            setStudentName("");
            setSubject("");
            setGrade("");
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
                            <Label htmlFor="subject" className="text-right">Subject</Label>
                            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="grade" className="text-right">Grade</Label>
                            <Input id="grade" type="number" min="0" max="100" value={grade} onChange={(e) => setGrade(e.target.value)} className="col-span-3" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Add Grade</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
