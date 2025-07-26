
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createMentorshipPlanAction, getStudentsAction } from "@/lib/actions";
import { Loader2, X, Plus, Wand2, User, Target, Activity, CheckCircle, HeartHandshake, FileText } from "lucide-react";
import type { CreateMentorshipPlanOutput } from "@/ai/flows/create-mentorship-plan.types";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Student } from "@/lib/firestore";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";

export default function MentoringPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [problems, setProblems] = useState<string[]>([]);
  const [newProblem, setNewProblem] = useState("");
  const [progress, setProgress] = useState("");
  
  const [mentorshipPlan, setMentorshipPlan] = useState<CreateMentorshipPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStudentListLoading, setIsStudentListLoading] = useState(true);
  const { toast } = useToast();
  const { authStatus } = useAuth();

  useEffect(() => {
    async function fetchStudents() {
      setIsStudentListLoading(true);
      const result = await getStudentsAction();
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
  }, [authStatus, toast]);

  const handleAddProblem = () => {
    if (newProblem.trim()) {
      setProblems([...problems, newProblem.trim()]);
      setNewProblem("");
    }
  };

  const handleRemoveProblem = (index: number) => {
    setProblems(problems.filter((_, i) => i !== index));
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
      // Add a small delay to allow UI to update before starting the action
      // This helps with perceived performance
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const result = await createMentorshipPlanAction({
          studentName: selectedStudent.name,
          // This is a mock, in a real app we'd have grade associated with student
          gradeLevel: 5,
          problems,
          progress
      });

      if (result.success) {
        setMentorshipPlan(result.data);
      } else {
        toast({
          title: "Error Generating Plan",
          description: result.error || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error Generating Plan",
        description: "An unexpected error occurred while generating the mentorship plan.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Student Mentorship Planner</h1>
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
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId} disabled={isStudentListLoading}>
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
