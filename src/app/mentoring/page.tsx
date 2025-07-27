
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createMentorshipPlanAction, getStudentsAction, getGradesAction } from "@/lib/actions";
import { Loader2, X, Plus, Wand2, User, Target, Activity, CheckCircle, HeartHandshake, FileText } from "lucide-react";
import type { CreateMentorshipPlanOutput } from "@/ai/flows/create-mentorship-plan.types";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Student } from "@/lib/firestore";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";

export default function MentoringPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [problems, setProblems] = useState<string[]>([]);
  const [newProblem, setNewProblem] = useState("");
  const [progress, setProgress] = useState("");
  
  const [mentorshipPlan, setMentorshipPlan] = useState<CreateMentorshipPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStudentListLoading, setIsStudentListLoading] = useState(true);
  const [gradeAnalysis, setGradeAnalysis] = useState<any>(null);
  const [isAnalyzingGrades, setIsAnalyzingGrades] = useState(false);
  const { toast } = useToast();
  const { authStatus, user } = useAuth();

  useEffect(() => {
    async function fetchStudents() {
      setIsStudentListLoading(true);
      if (!user) {
        toast({ title: "Error", description: "Could not load students.", variant: "destructive" });
        setIsStudentListLoading(false);
        return;
      }
      const token = await user.getIdToken();
      const result = await getStudentsAction(token);
      if (result.success && result.data) {
        setStudents(result.data);
      } else {
        toast({ title: "Error", description: "Could not load students.", variant: "destructive" });
      }
      setIsStudentListLoading(false);
    }
    if (authStatus === 'authenticated') {
        fetchStudents();
    }
  }, [authStatus, toast, user]);

  const handleAddProblem = () => {
    if (newProblem.trim()) {
      setProblems([...problems, newProblem.trim()]);
      setNewProblem("");
    }
  };

  const handleRemoveProblem = (index: number) => {
    setProblems(problems.filter((_, i) => i !== index));
  };

  const analyzeStudentGrades = async (studentName: string) => {
    setIsAnalyzingGrades(true);
    setGradeAnalysis(null);
    
    try {
      const token = await user?.getIdToken();
      const gradesResult = await getGradesAction(token);
      
      if (gradesResult.success && gradesResult.data) {
        const studentGrades = gradesResult.data.filter(grade => 
          grade.studentName.toLowerCase() === studentName.toLowerCase()
        );

        if (studentGrades.length > 0) {
          const totalGrade = studentGrades.reduce((sum, grade) => sum + grade.grade, 0);
          const averageGrade = Math.round(totalGrade / studentGrades.length);
          
          const subjectGrades = studentGrades.reduce((acc, grade) => {
            if (!acc[grade.subject]) {
              acc[grade.subject] = [];
            }
            acc[grade.subject].push(grade.grade);
            return acc;
          }, {} as Record<string, number[]>);

          const subjectAverages = Object.entries(subjectGrades).map(([subject, grades]) => ({
            subject,
            average: Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length)
          }));

          const strengths = subjectAverages.filter(s => s.average >= 80).map(s => s.subject);
          const weaknesses = subjectAverages.filter(s => s.average < 70).map(s => s.subject);

          const sortedGrades = studentGrades.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          const midPoint = Math.floor(sortedGrades.length / 2);
          const firstHalf = sortedGrades.slice(0, midPoint);
          const secondHalf = sortedGrades.slice(midPoint);
          
          let gradeTrend = "Stable";
          if (firstHalf.length > 0 && secondHalf.length > 0) {
            const firstHalfAvg = firstHalf.reduce((sum, grade) => sum + grade.grade, 0) / firstHalf.length;
            const secondHalfAvg = secondHalf.reduce((sum, grade) => sum + grade.grade, 0) / secondHalf.length;
            if (secondHalfAvg > firstHalfAvg + 5) gradeTrend = "Improving";
            else if (secondHalfAvg < firstHalfAvg - 5) gradeTrend = "Declining";
          }

          setGradeAnalysis({
            averageGrade,
            subjectStrengths: strengths,
            subjectWeaknesses: weaknesses,
            gradeTrend,
            totalGrades: studentGrades.length,
            subjectAverages
          });
        } else {
          setGradeAnalysis({
            averageGrade: 0,
            subjectStrengths: [],
            subjectWeaknesses: [],
            gradeTrend: "No data available",
            totalGrades: 0,
            subjectAverages: []
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze student grades.",
        variant: "destructive",
      });
    }
    
    setIsAnalyzingGrades(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const selectedStudent = students.find(s => s.id === selectedStudentId);

    if (!selectedStudent || problems.length === 0 || !progress.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a student and provide their challenges and recent progress.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setMentorshipPlan(null);

    try {
      // Fetch grade data for the selected student
      const token = await user?.getIdToken();
      const gradesResult = await getGradesAction(token);
      
      let gradeData: any[] = [];
      let gradeAnalysis = {
        averageGrade: 0,
        subjectStrengths: [] as string[],
        subjectWeaknesses: [] as string[],
        gradeTrend: "No data available",
        totalGrades: 0
      };

      if (gradesResult.success && gradesResult.data) {
        // Filter grades for the selected student
        const studentGrades = gradesResult.data.filter(grade => 
          grade.studentName.toLowerCase() === selectedStudent.name.toLowerCase()
        );

        if (studentGrades.length > 0) {
          // Prepare grade data
          gradeData = studentGrades.map(grade => ({
            subject: grade.subject,
            grade: grade.grade,
            date: new Date(grade.date).toLocaleDateString(),
            className: grade.className
          }));

          // Calculate grade analysis
          const totalGrade = studentGrades.reduce((sum, grade) => sum + grade.grade, 0);
          const averageGrade = Math.round(totalGrade / studentGrades.length);
          
          // Group by subject to find strengths and weaknesses
          const subjectGrades = studentGrades.reduce((acc, grade) => {
            if (!acc[grade.subject]) {
              acc[grade.subject] = [];
            }
            acc[grade.subject].push(grade.grade);
            return acc;
          }, {} as Record<string, number[]>);

          const subjectAverages = Object.entries(subjectGrades).map(([subject, grades]) => ({
            subject,
            average: Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length)
          }));

          // Determine strengths (subjects with average >= 80) and weaknesses (subjects with average < 70)
          const strengths = subjectAverages.filter(s => s.average >= 80).map(s => s.subject);
          const weaknesses = subjectAverages.filter(s => s.average < 70).map(s => s.subject);

          // Determine grade trend (simplified - compare first half vs second half of grades)
          const sortedGrades = studentGrades.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          const midPoint = Math.floor(sortedGrades.length / 2);
          const firstHalf = sortedGrades.slice(0, midPoint);
          const secondHalf = sortedGrades.slice(midPoint);
          
          let gradeTrend = "Stable";
          if (firstHalf.length > 0 && secondHalf.length > 0) {
            const firstHalfAvg = firstHalf.reduce((sum, grade) => sum + grade.grade, 0) / firstHalf.length;
            const secondHalfAvg = secondHalf.reduce((sum, grade) => sum + grade.grade, 0) / secondHalf.length;
            if (secondHalfAvg > firstHalfAvg + 5) gradeTrend = "Improving";
            else if (secondHalfAvg < firstHalfAvg - 5) gradeTrend = "Declining";
          }

          gradeAnalysis = {
            averageGrade,
            subjectStrengths: strengths,
            subjectWeaknesses: weaknesses,
            gradeTrend,
            totalGrades: studentGrades.length
          };
        }
      }

      const result = await createMentorshipPlanAction({
        studentName: selectedStudent.name,
        gradeLevel: 5, // This could be made dynamic based on student data
        problems,
        progress,
        gradeData,
        gradeAnalysis
      });

      if (result.success && result.data) {
        setMentorshipPlan(result.data);
      } else {
        toast({
          title: "Error Generating Plan",
          description: 'error' in result ? result.error : "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch student data or generate plan.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };
  
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Mentor Plan</h1>
        <p className="text-muted-foreground">Generate AI-powered mentorship plans for individual students.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Wand2 /> Plan Details</CardTitle>
            <CardDescription>Select a student and describe their situation.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="student-select">Student</Label>
                    <Select 
                        value={selectedStudentId} 
                        onValueChange={(value) => {
                            setSelectedStudentId(value);
                            const selectedStudent = students.find(s => s.id === value);
                            if (selectedStudent) {
                                analyzeStudentGrades(selectedStudent.name);
                            }
                        }} 
                        disabled={isStudentListLoading}
                    >
                        <SelectTrigger id="student-select">
                            <SelectValue placeholder={isStudentListLoading ? "Loading students..." : "Select a student"} />
                        </SelectTrigger>
                        <SelectContent>
                            {students.map(student => (
                                <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              
              <div className="space-y-4">
                <Label>Problems / Challenges</Label>
                <div className="space-y-2">
                  {problems.map((prob, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                      <span className="flex-grow text-sm">{prob}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveProblem(index)}>
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input value={newProblem} onChange={(e) => setNewProblem(e.target.value)} placeholder="Add a challenge..." onKeyDown={(e) => {if(e.key === 'Enter'){ e.preventDefault(); handleAddProblem();}}} />
                  <Button type="button" onClick={handleAddProblem} size="icon">
                    <Plus />
                  </Button>
                </div>
              </div>

                <div className="space-y-2">
                    <Label htmlFor="progress">Recent Progress / Strengths</Label>
                    <Textarea id="progress" value={progress} onChange={(e) => setProgress(e.target.value)} placeholder="Describe what the student is doing well or where they have shown improvement." />
                </div>

                {/* Grade Analysis Section */}
                {selectedStudentId && (
                  <div className="space-y-3">
                    <Label>Grade Performance Analysis</Label>
                    {isAnalyzingGrades ? (
                      <div className="flex items-center justify-center p-4 border rounded-lg">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Analyzing grades...
                      </div>
                    ) : gradeAnalysis ? (
                      <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Overall Average:</span>
                          <span className="text-lg font-bold text-primary">{gradeAnalysis.averageGrade}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total Grades:</span>
                          <span className="text-sm">{gradeAnalysis.totalGrades}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Trend:</span>
                          <span className={`text-sm px-2 py-1 rounded ${
                            gradeAnalysis.gradeTrend === 'Improving' ? 'bg-green-100 text-green-800' :
                            gradeAnalysis.gradeTrend === 'Declining' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {gradeAnalysis.gradeTrend}
                          </span>
                        </div>
                        {gradeAnalysis.subjectStrengths.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-green-700">Strengths:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {gradeAnalysis.subjectStrengths.map((subject: string) => (
                                <span key={subject} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {gradeAnalysis.subjectWeaknesses.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-red-700">Areas for Improvement:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {gradeAnalysis.subjectWeaknesses.map((subject: string) => (
                                <span key={subject} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 border rounded-lg bg-muted/30 text-center text-muted-foreground">
                        No grade data available for this student
                      </div>
                    )}
                  </div>
                )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                {isLoading ? "Generating Plan..." : "Generate Mentorship Plan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:sticky lg:top-8">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><FileText /> Generated Mentorship Plan</CardTitle>
            <CardDescription>{mentorshipPlan ? mentorshipPlan.planTitle : "Your plan will appear here."}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            {mentorshipPlan ? (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><Target /> Goals</h3>
                    <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
                        {mentorshipPlan.goals.map((goal, i) => <li key={i}>{goal}</li>)}
                    </ul>
                </div>
                <Separator />
                <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><Activity /> Suggested Activities</h3>
                     <div className="space-y-3">
                        {mentorshipPlan.suggestedActivities.map((activity, i) => (
                            <div key={i} className="p-3 border rounded-lg bg-secondary/30">
                                <h4 className="font-semibold text-sm">{activity.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <Separator />
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><CheckCircle /> Progress Check</h3>
                    <p className="text-sm text-muted-foreground">{mentorshipPlan.progressCheck}</p>
                </div>
              </div>
            ) : (
                <div className="flex items-center justify-center h-96 text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                    <p>Select a student and describe their situation to generate a mentorship plan.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
