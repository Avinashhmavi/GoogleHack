"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateMultiLanguageAction } from "@/lib/actions";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ContentMap = { [key: string]: string };

export default function MultiLanguageContentPage() {
  const [prompt, setPrompt] = useState("");
  const [languages, setLanguages] = useState("en,es,fr");
  const [generatedContent, setGeneratedContent] = useState<ContentMap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt.trim() || !languages.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a prompt and at least one language code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedContent(null);

    const result = await generateMultiLanguageAction({ prompt, languages });

    if (result.success && result.data) {
      setGeneratedContent(result.data);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to generate content.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Multi-Language Content Creator</h1>
        <p className="text-muted-foreground">Generate content in multiple languages from a single prompt.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Content Prompt</CardTitle>
            <CardDescription>Enter your prompt and the desired languages.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Write a short story about a friendly robot exploring a new planet."
                  className="min-h-[150px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="languages">Languages</Label>
                <Input
                  id="languages"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="e.g., en,es,fr,de"
                />
                <p className="text-xs text-muted-foreground">Enter comma-separated ISO 639-1 language codes.</p>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                {isLoading ? "Generating..." : "Generate Content"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Generated Content</CardTitle>
            <CardDescription>The generated content will appear here in tabs for each language.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            {generatedContent && Object.keys(generatedContent).length > 0 && (
              <Tabs defaultValue={Object.keys(generatedContent)[0]} className="w-full h-full flex flex-col">
                <TabsList>
                  {Object.keys(generatedContent).map((lang) => (
                    <TabsTrigger key={lang} value={lang}>{lang.toUpperCase()}</TabsTrigger>
                  ))}
                </TabsList>
                {Object.entries(generatedContent).map(([lang, content]) => (
                  <TabsContent key={lang} value={lang} className="flex-grow mt-4">
                    <Textarea
                      readOnly
                      value={content}
                      className="w-full h-full min-h-[250px] resize-none bg-secondary/50"
                      aria-label={`Content in ${lang}`}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            )}
            {!isLoading && !generatedContent && (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>Your multi-language content will be displayed here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
