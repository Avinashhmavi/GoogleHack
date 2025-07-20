"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { enhanceWritingAction } from "@/lib/actions";
import { Loader2, Wand2, Lightbulb } from "lucide-react";
import type { EnhanceWritingOutput } from "@/ai/flows/enhance-writing";
import { Separator } from "@/components/ui/separator";

export default function WritingAssistantPage() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<EnhanceWritingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputText.trim()) {
      toast({
        title: "Text is empty",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    const actionResult = await enhanceWritingAction({ text: inputText });

    if (actionResult.success && actionResult.data) {
      setResult(actionResult.data);
    } else {
      toast({
        title: "Error",
        description: actionResult.error || "Failed to analyze text.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Writing Assistant</h1>
        <p className="text-muted-foreground">Improve your writing with AI-powered grammar, spelling, and style suggestions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Your Text</CardTitle>
                    <CardDescription>Enter the text you want to improve.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type or paste your text here..."
                        className="min-h-[250px]"
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 animate-spin" />}
                        {isLoading ? "Analyzing..." : "Enhance Writing"}
                    </Button>
                    </form>
                </CardContent>
            </Card>

            {isLoading && (
              <div className="flex items-center justify-center pt-8 lg:hidden">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            
            {result && (
            <Card>
                <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Wand2 /> Corrected Text</CardTitle>
                <CardDescription>Here is the corrected version of your text.</CardDescription>
                </CardHeader>
                <CardContent>
                <Textarea
                    readOnly
                    value={result.correctedText}
                    className="min-h-[250px] resize-none bg-secondary/50"
                    aria-label="Corrected Text"
                />
                </CardContent>
            </Card>
            )}
        </div>
        
        <Card className="lg:sticky lg:top-8">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Lightbulb /> Suggestions</CardTitle>
            <CardDescription>AI-powered tips to improve your writing style and clarity.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && !result && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {!isLoading && !result && (
              <div className="flex items-center justify-center h-64 text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>Improvement suggestions will appear here.</p>
              </div>
            )}

            {result && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {result.suggestions.length > 0 ? (
                  result.suggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-background">
                      <p className="text-xs text-muted-foreground italic">Original: "{suggestion.original}"</p>
                      <p className="font-semibold text-primary">Suggestion: "{suggestion.suggestion}"</p>
                      <p className="text-sm text-muted-foreground mt-1">{suggestion.explanation}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-64 text-center text-muted-foreground">
                    <p>No specific style suggestions. The text is grammatically correct!</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
