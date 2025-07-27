
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createRubricAction } from "@/lib/actions";
import { Loader2, X, Plus, Table as TableIcon, Wand2, Mic, MicOff } from "lucide-react";
import type { CreateRubricOutput } from "@/ai/flows/create-rubric";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/context/language-context";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

export default function RubricCreatorPage() {
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [criteria, setCriteria] = useState<string[]>(["Clarity", "Originality", "Grammar"]);
  const [newCriterion, setNewCriterion] = useState("");
  const [rubric, setRubric] = useState<CreateRubricOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  
  const descSpeech = useSpeechRecognition({ lang: language, onResult: setAssignmentDescription, onError: (e) => toast({variant: "destructive", title:"Speech Error", description: e}) });
  const critSpeech = useSpeechRecognition({ lang: language, onResult: setNewCriterion, onError: (e) => toast({variant: "destructive", title:"Speech Error", description: e}) });

  const handleAddCriterion = () => {
    if (critSpeech.isListening) critSpeech.stopListening();
    if (newCriterion.trim()) {
      setCriteria([...criteria, newCriterion.trim()]);
      setNewCriterion("");
    }
  };

  const handleRemoveCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (descSpeech.isListening) descSpeech.stopListening();
    if (critSpeech.isListening) critSpeech.stopListening();

    if (!assignmentDescription.trim() || criteria.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide an assignment description and at least one criterion.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setRubric(null);

    const result = await createRubricAction({ assignmentDescription, criteria });

    if (result.success && result.data) {
      setRubric(result.data);
    } else {
      toast({
        title: "Error Generating Rubric",
        description: 'error' in result ? result.error : "An unknown error occurred.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Marks Guide</h1>
        <p className="text-muted-foreground">Generate detailed grading rubrics for any assignment.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Wand2 /> Rubric Details</CardTitle>
            <CardDescription>Describe the assignment and criteria to generate a rubric.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="description">Assignment Description</Label>
                    {descSpeech.hasPermission && <Button type="button" size="icon" variant={descSpeech.isListening ? 'destructive' : 'outline'} onClick={() => descSpeech.isListening ? descSpeech.stopListening() : descSpeech.startListening()}><Mic /></Button>}
                </div>
                <Textarea
                  id="description"
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                  placeholder="e.g., Write a 500-word essay on the causes of World War II."
                  className="min-h-[150px]"
                />
              </div>
              <div className="space-y-4">
                <Label>Criteria</Label>
                <div className="space-y-2">
                  {criteria.map((c, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={c} readOnly className="bg-secondary/50" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCriterion(index)}
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={newCriterion}
                    onChange={(e) => setNewCriterion(e.target.value)}
                    placeholder="Add new criterion..."
                  />
                  {critSpeech.hasPermission && <Button type="button" size="icon" variant={critSpeech.isListening ? 'destructive' : 'outline'} onClick={() => critSpeech.isListening ? critSpeech.stopListening() : critSpeech.startListening()}><Mic /></Button>}
                  <Button type="button" onClick={handleAddCriterion} size="icon">
                    <Plus />
                  </Button>
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                {isLoading ? "Generating Rubric..." : "Generate Rubric"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><TableIcon /> Generated Rubric</CardTitle>
            <CardDescription>{rubric ? rubric.title : "Your rubric will appear here."}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            {rubric && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Criterion</TableHead>
                      {rubric.criteria[0]?.levels.map((level, i) => (
                        <TableHead key={i} className="font-bold">{level.level}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rubric.criteria.map((criterion, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-semibold">{criterion.name}</TableCell>
                        {criterion.levels.map((level, j) => (
                          <TableCell key={j}>{level.description}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {!isLoading && !rubric && (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>Your generated rubric will be displayed here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
