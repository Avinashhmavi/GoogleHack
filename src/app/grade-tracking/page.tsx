
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
import { Printer, UserPlus, Trash2, Loader2, TrendingUp, Users } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
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
import type { GradeEntry } from "@/lib/firestore";
import { useAuth } from "@/context/auth-context";

export default function GradeTrackingPage() {
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const { toast } = useToast();
  const { authStatus, user } = useAuth();

  useEffect(() => {
    async function fetchGrades() {
        if (authStatus !== 'authenticated' || !user) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const token = await user.getIdToken();
        const result = await getGradesAction(token);
        if(result.success && result.data) {
            setGrades(result.data);
        } else {
            toast({ title: "Error", description: "Could not fetch grades.", variant: "destructive" });
        }
        setIsLoading(false);
    }
    if (authStatus === 'authenticated') {
        fetchGrades();
    }
  }, [authStatus, toast, user]);


  const classes = useMemo(() => {
    const classSet = new Set(grades.map(grade => grade.className));
    return Array.from(classSet).sort();
  }, [grades]);

  // Filter grades by selected class
  const filteredGrades = useMemo(() => {
    if (!selectedClass) return grades;
    return grades.filter(grade => grade.className === selectedClass);
  }, [grades, selectedClass]);

  // Prepare data for performance tracking charts
  const performanceData = useMemo(() => {
    if (!grades.length) return [];

    // Filter grades by selected class if any
    const filteredGradesForChart = selectedClass 
      ? grades.filter(grade => grade.className === selectedClass)
      : grades;

    // Group grades by student and calculate performance over time
    const studentPerformance = filteredGradesForChart.reduce((acc, grade) => {
      if (!acc[grade.studentName]) {
        acc[grade.studentName] = [];
      }
      acc[grade.studentName].push({
        date: new Date(grade.date).toLocaleDateString(),
        grade: grade.grade,
        subject: grade.subject,
        className: grade.className,
        timestamp: new Date(grade.date).getTime()
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Convert to chart data format
    return Object.entries(studentPerformance).map(([studentName, data]) => ({
      studentName,
      data: data.sort((a, b) => a.timestamp - b.timestamp)
    }));
  }, [grades, selectedClass]);

  // Prepare data for class performance comparison
  const classPerformanceData = useMemo(() => {
    if (!grades.length) return [];

    // Filter grades by selected class if any
    const filteredGradesForChart = selectedClass 
      ? grades.filter(grade => grade.className === selectedClass)
      : grades;

    const classStats = filteredGradesForChart.reduce((acc, grade) => {
      if (!acc[grade.className]) {
        acc[grade.className] = { total: 0, count: 0, subjects: {} };
      }
      acc[grade.className].total += grade.grade;
      acc[grade.className].count += 1;
      
      if (!acc[grade.className].subjects[grade.subject]) {
        acc[grade.className].subjects[grade.subject] = { total: 0, count: 0 };
      }
      acc[grade.className].subjects[grade.subject].total += grade.grade;
      acc[grade.className].subjects[grade.subject].count += 1;
      
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(classStats).map(([className, stats]) => ({
      className,
      averageGrade: Math.round(stats.total / stats.count),
      totalStudents: stats.count,
      subjects: Object.entries(stats.subjects).map(([subject, subjectStats]: [string, any]) => ({
        subject,
        averageGrade: Math.round(subjectStats.total / subjectStats.count)
      }))
    }));
  }, [grades, selectedClass]);

  // Get top performing students
  const topStudents = useMemo(() => {
    if (!grades.length) return [];

    // Filter grades by selected class if any
    const filteredGradesForChart = selectedClass 
      ? grades.filter(grade => grade.className === selectedClass)
      : grades;

    const studentAverages = filteredGradesForChart.reduce((acc, grade) => {
      if (!acc[grade.studentName]) {
        acc[grade.studentName] = { total: 0, count: 0 };
      }
      acc[grade.studentName].total += grade.grade;
      acc[grade.studentName].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(studentAverages)
      .map(([studentName, stats]) => ({
        studentName,
        averageGrade: Math.round(stats.total / stats.count)
      }))
      .sort((a, b) => b.averageGrade - a.averageGrade)
      .slice(0, 5);
  }, [grades, selectedClass]);

  const handlePrint = () => {
    window.print();
  };
  
  const addGrade = async (entry: Omit<GradeEntry, 'id' | 'uid'>) => {
    if (!user) {
        toast({title: "Error", description: "User not authenticated.", variant: "destructive" });
        return;
    }
    const token = await user.getIdToken();
    const result = await addGradeAction(entry, token);
    if(result.success && result.data) {
        setGrades(result.data);
        setIsDialogOpen(false);
        toast({title: "Success", description: "Grade has been added."})
    } else {
        toast({title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const deleteGrade = async (id: string) => {
    if (!user) {
        toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
        return;
    }
    const originalGrades = [...grades];
    setGrades(prev => prev.filter(grade => grade.id !== id));
    
    const token = await user.getIdToken();
    const result = await deleteGradeAction(id, token);
    if(result.success && result.data) {
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
          <h1 className="text-3xl font-bold font-headline">Marks Record</h1>
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
      
      {/* Performance Tracking Section */}
      {!isLoading && grades.length > 0 && (
        <div className="space-y-6">
          {/* Student Performance Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Student Performance Tracking
              </CardTitle>
              <CardDescription>Track individual student performance over time across all subjects.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData.flatMap(student => student.data)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value: any, name: any) => [`${value}%`, name]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    {performanceData.map((student, index) => (
                      <Line
                        key={student.studentName}
                        type="monotone"
                        dataKey="grade"
                        data={student.data}
                        name={student.studentName}
                        stroke={`hsl(${index * 60}, 70%, 50%)`}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Class Performance Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Class Performance Comparison
                </CardTitle>
                <CardDescription>Average grades by class and subject.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="className" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value: any) => [`${value}%`, 'Average Grade']} />
                      <Legend />
                      <Bar dataKey="averageGrade" fill="#8884d8" name="Average Grade" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Students */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Students</CardTitle>
                <CardDescription>Students with the highest average grades.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topStudents.map((student, index) => (
                    <div key={student.studentName} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{student.studentName}</p>
                          <p className="text-sm text-muted-foreground">Average Grade</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{student.averageGrade}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
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
              <div className="space-y-4">
                {classes.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="class-select">Filter by Class:</Label>
                    <select
                      id="class-select"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="border rounded-md px-3 py-1"
                    >
                      <option value="">All Classes</option>
                      {classes.map(className => (
                        <option key={className} value={className}>{className}</option>
                      ))}
                    </select>
                  </div>
                )}
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Grade (%)</TableHead>
                        <TableHead className="w-[50px] no-print"></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredGrades.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.studentName}</TableCell>
                            <TableCell>{entry.subject}</TableCell>
                            <TableCell>{entry.date ? new Date(entry.date).toLocaleDateString() : 'N/A'}</TableCell>
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
              </div>
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


function AddGradeDialog({ onAddGrade, open, onOpenChange }: { onAddGrade: (entry: Omit<GradeEntry, 'id' | 'uid'>) => void; open: boolean; onOpenChange: (open: boolean) => void; }) {
    const [studentName, setStudentName] = useState("");
    const [subject, setSubject] = useState("");
    const [grade, setGrade] = useState("");
    const [className, setClassName] = useState("");
    const [date, setDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(studentName && subject && grade && className && date) {
            setIsSubmitting(true);
            await onAddGrade({ 
                studentName, 
                subject, 
                grade: Number(grade), 
                className, 
                date: new Date(date) 
            });
            setStudentName("");
            setSubject("");
            setGrade("");
            setClassName("");
            setDate("");
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
                            <Input 
                                id="studentName" 
                                value={studentName} 
                                onChange={(e) => {
                                    // Remove special characters except spaces and hyphens
                                    const cleanName = e.target.value.replace(/[^a-zA-Z\s-]/g, '');
                                    setStudentName(cleanName);
                                }} 
                                className="col-span-3" 
                                required 
                                placeholder="Enter student name (letters only)"
                            />
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
                            <Label htmlFor="date" className="text-right">Date</Label>
                            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="col-span-3" required />
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
