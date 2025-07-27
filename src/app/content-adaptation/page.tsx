"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { adaptContentAction } from "@/lib/actions";
import { Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function ContentAdaptationPage() {
  const [content, setContent] = useState("");
  const [gradeLevel, setGradeLevel] = useState(5);
  const [adaptedContent, setAdaptedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim()) {
      toast({
        title: "Content is empty",
        description: "Please enter some content to adapt.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAdaptedContent(null);

    const result = await adaptContentAction({ content, gradeLevel });

    if (result.success && result.data) {
      setAdaptedContent(result.data.adaptedContent);
    } else {
      toast({
        title: "Error",
        description: 'error' in result ? result.error : "Failed to adapt content.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Easy Content</h1>
        <p className="text-muted-foreground">Adapt any text to be appropriate for a specific grade level.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Original Content</CardTitle>
            <CardDescription>Enter the text you want to adapt.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your original text here..."
              className="min-h-[200px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Target Grade Level: {gradeLevel}</CardTitle>
            <CardDescription>Select the target grade level for the adapted content.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">K</span>
              <Slider
                value={[gradeLevel]}
                onValueChange={(value) => setGradeLevel(value[0])}
                min={0}
                max={12}
                step={1}
                aria-label="Grade Level Slider"
              />
              <span className="text-sm font-medium">12</span>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-center">
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading && <Loader2 className="mr-2 animate-spin" />}
              {isLoading ? "Adapting..." : "Adapt Content"}
            </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center pt-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {adaptedContent && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Adapted Content</CardTitle>
              <CardDescription>Here is the content adapted for Grade {gradeLevel}.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                readOnly
                value={adaptedContent}
                className="min-h-[200px] resize-none bg-secondary/50"
                aria-label="Adapted Content"
              />
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
