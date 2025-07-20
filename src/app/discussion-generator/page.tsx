"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { generateDiscussionAction } from "@/lib/actions";
import { Loader2, MessageSquare, BookOpen, Lightbulb, Users, HelpCircle } from "lucide-react";
import type { GenerateDiscussionOutput } from "@/ai/flows/generate-discussion.types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

export default function DiscussionGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState(8);
  const [discussionMaterials, setDiscussionMaterials] = useState<GenerateDiscussionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!topic.trim()) {
      toast({
        title: "Topic is missing",
        description: "Please enter a topic to generate discussion materials.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setDiscussionMaterials(null);

    const result = await generateDiscussionAction({ topic, gradeLevel });

    if (result.success && result.data) {
      setDiscussionMaterials(result.data);
    } else {
      toast({
        title: "Error Generating Discussion",
        description: result.error || "An unknown error occurred.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Discussion & Activity Generator</h1>
        <p className="text-muted-foreground">Create engaging dialogic activities for your classroom.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><MessageSquare /> Discussion Setup</CardTitle>
            <CardDescription>Provide the topic and grade level for the discussion.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Discussion Topic</Label>
                <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., The ethics of AI" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Grade Level</Label>
                <Input id="gradeLevel" type="number" value={gradeLevel} onChange={(e) => setGradeLevel(Number(e.target.value))} min="1" max="12" required />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                {isLoading ? "Generating Materials..." : "Generate Discussion Materials"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:sticky lg:top-8">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><BookOpen /> Generated Activity Board</CardTitle>
            <CardDescription>Your discussion materials will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            {discussionMaterials ? (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><HelpCircle /> Discussion Questions</h3>
                     <ul className="list-decimal pl-6 text-muted-foreground text-sm space-y-2">
                        {discussionMaterials.discussionQuestions.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                </div>
                <Separator />
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><Lightbulb /> Key Vocabulary</h3>
                    <Accordion type="single" collapsible className="w-full">
                        {discussionMaterials.vocabulary.map((vocab, i) => (
                            <AccordionItem value={`item-${i}`} key={i}>
                                <AccordionTrigger>{vocab.word}</AccordionTrigger>
                                <AccordionContent>{vocab.definition}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
                <Separator />
                <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2"><Users /> Different Viewpoints</h3>
                    <div className="space-y-3">
                        {discussionMaterials.viewpoints.map((vp, i) => (
                            <div key={i} className="p-4 border rounded-lg bg-secondary/30">
                                <h4 className="font-semibold">{vp.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{vp.summary}</p>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            ) : (
                <div className="flex items-center justify-center h-96 text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                    <p>Enter a topic to generate your activity board.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
