
"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateVisualAidAction } from "@/lib/actions";
import { Loader2, Download, Wand2, Image as ImageIcon, Mic, MicOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/language-context";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

export default function VisualAidsGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
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
    if(speechRecognition.isListening) speechRecognition.stopListening();
    if (!prompt.trim()) {
      toast({
        title: "Prompt is empty",
        description: "Please describe the visual aid you want to create.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setImageDataUri(null);

    const result = await generateVisualAidAction({ prompt });

    if (result.success && result.data) {
      setImageDataUri(result.data.imageDataUri);
    } else {
      toast({
        title: "Error Generating Image",
        description: 'error' in result ? result.error : "An unknown error occurred.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleDownload = () => {
    if (imageDataUri) {
      const link = document.createElement("a");
      link.href = imageDataUri;
      // Extract file type from data URI, default to png
      const fileType = imageDataUri.match(/data:image\/(.+);/)?.[1] || 'png';
      link.download = `visual-aid-${Date.now()}.${fileType}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Picture Tools</h1>
        <p className="text-muted-foreground">Create blackboard-style illustrations for your lessons.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Wand2 /> Image Description</CardTitle>
            <CardDescription>Describe the illustration you want the AI to create.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="prompt">Prompt</Label>
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
                  placeholder="e.g., A simple diagram of the water cycle with labels for evaporation, condensation, and precipitation."
                  className="min-h-[150px]"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                {isLoading ? "Generating Image..." : "Generate Visual Aid"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center">
            <CardHeader className="text-center">
                <CardTitle className="font-headline flex items-center gap-2"><ImageIcon /> Generated Image</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-grow p-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p>Generating your image...</p>
                <p className="text-sm">This may take a moment.</p>
              </div>
            )}
            {imageDataUri && (
                <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-md border">
                        <Image src={imageDataUri} alt="Generated visual aid" width={400} height={400} className="rounded-md" />
                    </div>
                    <Button onClick={handleDownload} variant="secondary">
                        <Download className="mr-2" />
                        Download Image
                    </Button>
                </div>
            )}
            {!isLoading && !imageDataUri && (
              <div className="w-full h-64 flex items-center justify-center text-center text-muted-foreground bg-gray-100/50 border-2 border-dashed rounded-lg">
                <p>Your generated visual aid will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
