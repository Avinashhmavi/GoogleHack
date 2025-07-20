
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createLessonPlanAction } from "@/lib/actions";
import { Loader2, X, Plus, BookText, Clock, Check, List, DraftingCompass, PencilRuler, Mic, MicOff, Share2 } from "lucide-react";
import type { CreateLessonPlanOutput } from "@/ai/flows/create-lesson-plan.types";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/context/language-context";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

export default function LessonPlannerPage() {
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState(5);
  const [durationInMinutes, setDurationInMinutes] = useState(45);
  const [learningObjectives, setLearningObjectives] = useState<string[]>(["Understand the concept of photosynthesis."]);
  const [newObjective, setNewObjective] = useState("");
  
  const [lessonPlan, setLessonPlan] = useState<CreateLessonPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const topicSpeech = useSpeechRecognition({ lang: language, onResult: setTopic, onError: (e) => toast({variant: "destructive", title: "Speech Error", description: e}) });
  const objectiveSpeech = useSpeechRecognition({ lang: language, onResult: setNewObjective, onError: (e) => toast({variant: "destructive", title: "Speech Error", description: e}) });

  const handleAddObjective = () => {
    if (objectiveSpeech.isListening) objectiveSpeech.stopListening();
    if (newObjective.trim()) {
      setLearningObjectives([...learningObjectives, newObjective.trim()]);
      setNewObjective("");
    }
  };

  const handleRemoveObjective = (index: number) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (topicSpeech.isListening) topicSpeech.stopListening();
    if (objectiveSpeech.isListening) objectiveSpeech.stopListening();

    if (!topic.trim() || learningObjectives.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide a topic and at least one learning objective.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setLessonPlan(null);

    const result = await createLessonPlanAction({ topic, gradeLevel, durationInMinutes, learningObjectives });

    if (result.success && result.data) {
      setLessonPlan(result.data);
    } else {
      toast({
        title: "Error Generating Lesson Plan",
        description: result.error || "An unknown error occurred.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleShare = () => {
    if (!lessonPlan) return;
    const shareableLink = `${window.location.origin}/shared/lesson/${Date.now()}`;
    navigator.clipboard.writeText(shareableLink);
    toast({
      title: "Link Copied!",
      description: "A shareable link has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Automated Lesson Planner</h1>
        <p className="text-muted-foreground">Generate a detailed lesson plan for any topic and grade level.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><PencilRuler /> Lesson Details</CardTitle>
            <CardDescription>Provide the details for the lesson you want to plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <div className="flex items-center gap-2">
                    <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., The Water Cycle" required />
                    {topicSpeech.hasPermission && <Button type="button" size="icon" variant={topicSpeech.isListening ? "destructive" : "outline"} onClick={() => topicSpeech.isListening ? topicSpeech.stopListening() : topicSpeech.startListening()}><Mic/></Button>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Grade Level</Label>
                  <Input id="gradeLevel" type="number" value={gradeLevel} onChange={(e) => setGradeLevel(Number(e.target.value))} min="1" max="12" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" type="number" value={durationInMinutes} onChange={(e) => setDurationInMinutes(Number(e.target.value))} min="5" step="5" required />
                </div>
              </div>
              <div className="space-y-4">
                <Label>Learning Objectives</Label>
                <div className="space-y-2">
                  {learningObjectives.map((obj, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="flex-grow text-sm">{obj}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveObjective(index)}>
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input value={newObjective} onChange={(e) => setNewObjective(e.target.value)} placeholder="Add a new learning objective..." onKeyDown={(e) => {if(e.key === 'Enter'){ e.preventDefault(); handleAddObjective();}}} />
                  {objectiveSpeech.hasPermission && <Button type="button" size="icon" variant={objectiveSpeech.isListening ? 'destructive' : 'outline'} onClick={() => objectiveSpeech.isListening ? objectiveSpeech.stopListening() : objectiveSpeech.startListening()}><Mic /></Button>}
                  <Button type="button" onClick={handleAddObjective} size="icon">
                    <Plus />
                  </Button>
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                {isLoading ? "Generating Plan..." : "Generate Lesson Plan"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:sticky lg:top-8">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="font-headline flex items-center gap-2"><BookText /> Generated Lesson Plan</CardTitle>
                {lessonPlan && (
                    <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                )}
            </div>
            <CardDescription>{lessonPlan ? lessonPlan.title : "Your plan will appear here."}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            {lessonPlan ? (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><Check /> Learning Objectives</h3>
                    <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
                        {lessonPlan.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                    </ul>
                </div>
                <Separator />
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><DraftingCompass /> Materials</h3>
                    <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1">
                        {lessonPlan.materials.map((mat, i) => <li key={i}>{mat}</li>)}
                    </ul>
                </div>
                <Separator />
                <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><List /> Lesson Activities</h3>
                    <div className="space-y-4">
                        {lessonPlan.activities.map((activity, i) => (
                            <div key={i} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold">{i + 1}. {activity.name}</h4>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                                        <Clock className="w-3 h-3"/>
                                        <span>{activity.duration} min</span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">{activity.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            ) : (
                <div className="flex items-center justify-center h-96 text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                    <p>Your generated lesson plan will be displayed here.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
