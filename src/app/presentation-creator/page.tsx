
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createPresentationAction } from "@/lib/actions";
import { Loader2, Presentation, Wand2, Mic, List, Image as ImageIcon, MicOff, BookOpen, Info } from "lucide-react";
import type { CreatePresentationOutput } from "@/ai/flows/create-presentation.types";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useLanguage } from "@/context/language-context";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { Textarea } from "@/components/ui/textarea";

export default function PresentationCreatorPage() {
  const [topic, setTopic] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [numSlides, setNumSlides] = useState(5);
  const [presentation, setPresentation] = useState<CreatePresentationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const speechRecognition = useSpeechRecognition({
      lang: language,
      onResult: setTopic,
      onError: (error) => {
          toast({ title: "Speech Recognition Error", description: error, variant: "destructive" });
      }
  });

  const instructionsSpeechRecognition = useSpeechRecognition({
    lang: language,
    onResult: setAdditionalInstructions,
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
    if(instructionsSpeechRecognition.isListening) instructionsSpeechRecognition.stopListening();

    if (!topic.trim()) {
      toast({
        title: "Topic is missing",
        description: "Please enter a topic for the presentation.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setPresentation(null);

    const result = await createPresentationAction({ topic, numSlides, additionalInstructions });

    if (result.success && result.data) {
      setPresentation(result.data);
    } else {
      toast({
        title: "Error Generating Presentation",
        description: result.error || "An unknown error occurred.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };
  
  const handleSlideChange = (slideIndex: number, field: string, value: string | string[], pointIndex?: number) => {
    if (!presentation) return;

    const updatedSlides = [...presentation.slides];
    const slideToUpdate = { ...updatedSlides[slideIndex] };

    if (field === 'title') {
        slideToUpdate.title = value as string;
    } else if (field === 'speakerNotes') {
        slideToUpdate.speakerNotes = value as string;
    } else if (field === 'content' && pointIndex !== undefined) {
        const newContent = [...slideToUpdate.content];
        newContent[pointIndex] = value as string;
        slideToUpdate.content = newContent;
    }

    updatedSlides[slideIndex] = slideToUpdate;
    setPresentation({ ...presentation, slides: updatedSlides });
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Presentation Slides Creator</h1>
        <p className="text-muted-foreground">Automatically generate and edit presentation slides for any topic.</p>
      </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Wand2 /> Presentation Setup</CardTitle>
            <CardDescription>Provide the topic, instructions, and number of slides for your presentation.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="topic">Presentation Topic</Label>
                    <div className="flex items-center gap-2">
                        <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., The History of Ancient Rome" required className="flex-grow"/>
                        {speechRecognition.hasPermission && (
                            <Button type="button" size="icon" variant={speechRecognition.isListening ? "destructive" : "outline"} onClick={toggleListening}>
                                {speechRecognition.isListening ? <MicOff /> : <Mic />}
                                <span className="sr-only">{speechRecognition.isListening ? "Stop listening" : "Start listening"}</span>
                            </Button>
                        )}
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="numSlides">Number of Slides</Label>
                    <Input id="numSlides" type="number" value={numSlides} onChange={(e) => setNumSlides(Number(e.target.value))} min="3" max="15" required />
                </div>
              </div>
               <div className="space-y-2">
                    <Label htmlFor="instructions" className="flex items-center gap-2"><Info className="w-4 h-4" /> Additional Instructions (Optional)</Label>
                    <div className="flex items-center gap-2">
                        <Textarea id="instructions" value={additionalInstructions} onChange={(e) => setAdditionalInstructions(e.target.value)} placeholder="e.g., Focus on the daily life of citizens. Keep the language simple for 6th graders."/>
                        {instructionsSpeechRecognition.hasPermission && (
                            <Button type="button" size="icon" variant={instructionsSpeechRecognition.isListening ? "destructive" : "outline"} onClick={() => instructionsSpeechRecognition.isListening ? instructionsSpeechRecognition.stopListening() : instructionsSpeechRecognition.startListening()}>
                                {instructionsSpeechRecognition.isListening ? <MicOff /> : <Mic />}
                            </Button>
                        )}
                    </div>
                </div>

              <div className="flex justify-center">
                <Button type="submit" disabled={isLoading} size="lg">
                    {isLoading && <Loader2 className="mr-2 animate-spin" />}
                    {isLoading ? "Generating Slides..." : "Generate Presentation"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      {isLoading && (
        <div className="flex flex-col items-center justify-center pt-16 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold">Generating your presentation...</p>
            <p className="text-muted-foreground">This may take a moment, especially with image generation.</p>
        </div>
        )}

      {presentation && (
        <div className="space-y-4">
            <Input
              value={presentation.title}
              onChange={(e) => setPresentation({ ...presentation, title: e.target.value })}
              className="text-2xl font-bold text-center font-headline h-12"
            />
            <Carousel className="w-full" opts={{ loop: false }}>
                <CarouselContent>
                    {presentation.slides.map((slide, index) => (
                    <CarouselItem key={index}>
                        <div className="p-1">
                        <Card className="min-h-[550px] flex flex-col">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold">{index + 1}.</span>
                                  <Input 
                                      value={slide.title}
                                      onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                                      className="font-headline text-xl h-10 border-0 shadow-none focus-visible:ring-1"
                                      placeholder="Slide Title"
                                  />
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                                <div className="space-y-4 flex flex-col">
                                    <div className="relative w-full aspect-video bg-secondary rounded-md overflow-hidden flex-shrink-0">
                                       {slide.imageDataUri ? (
                                            <Image 
                                                src={slide.imageDataUri} 
                                                alt={`Visual for: ${slide.title}`} 
                                                layout="fill"
                                                objectFit="contain"
                                                data-ai-hint="presentation illustration"
                                            />
                                       ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <ImageIcon className="w-12 h-12" />
                                            </div>
                                       )}
                                    </div>
                                    <div className="space-y-2 flex-grow flex flex-col">
                                        <h3 className="font-semibold flex items-center gap-2"><Mic /> Speaker Notes</h3>
                                        <Textarea
                                            value={slide.speakerNotes}
                                            onChange={(e) => handleSlideChange(index, 'speakerNotes', e.target.value)}
                                            className="text-sm text-muted-foreground flex-grow resize-none"
                                            placeholder="Speaker notes..."
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4 md:border-l md:pl-6">
                                    <h3 className="font-semibold flex items-center gap-2"><List /> Content</h3>
                                    <div className="space-y-2">
                                        {slide.content.map((point, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <span className="pt-2">•</span>
                                                <Textarea
                                                    value={point}
                                                    onChange={(e) => handleSlideChange(index, 'content', e.target.value, i)}
                                                    className="flex-grow resize-none text-muted-foreground"
                                                    placeholder="Bullet point"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="ml-12" />
                <CarouselNext className="mr-12" />
            </Carousel>
        </div>
      )}
    </div>
  );
}
