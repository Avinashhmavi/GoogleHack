
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateLocalizedContentAction } from "@/lib/actions";
import { Loader2, Languages, BookOpen, Wand2, Mic, MicOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";
import { useLanguage } from "@/context/language-context";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";


type ContentMap = { [key: string]: string };

const languageOptions: MultiSelectOption[] = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "hi", label: "Hindi" },
    { value: "bn", label: "Bengali" },
    { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
    { value: "kn", label: "Kannada" },
];

export default function ContentCreatorPage() {
  const [contentType, setContentType] = useState("story");
  const [prompt, setPrompt] = useState("");
  const [gradeLevel, setGradeLevel] = useState(5);
  const [selectedLanguages, setSelectedLanguages] = useState<MultiSelectOption[]>([
      { value: "en", label: "English" },
      { value: "hi", label: "Hindi" },
  ]);
  const [generatedContent, setGeneratedContent] = useState<ContentMap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const speechRecognition = useSpeechRecognition({
      lang: language,
      onResult: setPrompt,
      onError: (error) => {
          toast({ title: "Speech Recognition Error", description: error, variant: "destructive" });
      }
  });

  const toggleListening = () => {
      if (speechRecognition.isListening) {
          speechRecognition.stopListening();
      } else {
          speechRecognition.startListening();
      }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (speechRecognition.isListening) {
        speechRecognition.stopListening();
    }

    const languages = selectedLanguages.map(lang => lang.value).join(',');

    if (!prompt.trim() || !languages.trim() || !contentType.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a content type, prompt, grade level, and at least one language.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedContent(null);

    const result = await generateLocalizedContentAction({ prompt, languages, contentType, gradeLevel });

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
  
  const handleContentChange = (lang: string, newText: string) => {
    setGeneratedContent(prev => prev ? ({ ...prev, [lang]: newText }) : null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Localized Content Creator</h1>
        <p className="text-muted-foreground">Generate grade-appropriate educational content in multiple languages.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Wand2 /> Content Details</CardTitle>
            <CardDescription>Define what you want to create.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger id="content-type">
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="poem">Poem</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="explanation">Explanation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="prompt">Topic / Prompt</Label>
                    {speechRecognition.hasPermission && (
                        <Button type="button" size="icon" variant={speechRecognition.isListening ? "destructive" : "outline"} onClick={toggleListening}>
                            {speechRecognition.isListening ? <MicOff /> : <Mic />}
                            <span className="sr-only">{speechRecognition.isListening ? "Stop listening" : "Start listening"}</span>
                        </Button>
                    )}
                </div>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`e.g., A short story about the water cycle for 5th graders.`}
                  className="min-h-[150px]"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="gradeLevel">Target Grade Level: {gradeLevel}</Label>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">K</span>
                  <Slider
                    id="gradeLevel"
                    value={[gradeLevel]}
                    onValueChange={(value) => setGradeLevel(value[0])}
                    min={0}
                    max={12}
                    step={1}
                  />
                  <span className="text-sm font-medium">12</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="languages">Languages</Label>
                <MultiSelect 
                    options={languageOptions}
                    selected={selectedLanguages}
                    onChange={setSelectedLanguages}
                    placeholder="Select languages..."
                />
                <p className="text-xs text-muted-foreground">Select one or more languages for content generation.</p>
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
            <CardTitle className="font-headline flex items-center gap-2"><BookOpen /> Generated Content</CardTitle>
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
                    <TabsTrigger key={lang} value={lang}>{languageOptions.find(l => l.value === lang)?.label || lang.toUpperCase()}</TabsTrigger>
                  ))}
                </TabsList>
                {Object.entries(generatedContent).map(([lang, content]) => (
                  <TabsContent key={lang} value={lang} className="flex-grow mt-4">
                    <Textarea
                      value={content}
                      onChange={(e) => handleContentChange(lang, e.target.value)}
                      className="w-full h-full min-h-[300px] resize-y bg-secondary/50"
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
