
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createPresentationAction } from "@/lib/actions";
import { Loader2, Presentation, Wand2, Lightbulb, Mic, List, Image as ImageIcon } from "lucide-react";
import type { CreatePresentationOutput } from "@/ai/flows/create-presentation.types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Separator } from "@/components/ui/separator";

export default function PresentationCreatorPage() {
  const [topic, setTopic] = useState("");
  const [numSlides, setNumSlides] = useState(5);
  const [presentation, setPresentation] = useState<CreatePresentationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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

    const result = await createPresentationAction({ topic, numSlides });

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Presentation Slides Creator</h1>
        <p className="text-muted-foreground">Automatically generate presentation slides for any topic.</p>
      </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Wand2 /> Presentation Setup</CardTitle>
            <CardDescription>Provide the topic and number of slides for your presentation.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 md:flex md:items-end md:gap-4 md:space-y-0">
              <div className="flex-grow space-y-2">
                <Label htmlFor="topic">Presentation Topic</Label>
                <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., The History of Ancient Rome" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numSlides">Number of Slides</Label>
                <Input id="numSlides" type="number" value={numSlides} onChange={(e) => setNumSlides(Number(e.target.value))} min="3" max="15" required />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                {isLoading ? "Generating Slides..." : "Generate Presentation"}
              </Button>
            </form>
          </CardContent>
        </Card>

      {isLoading && (
        <div className="flex flex-col items-center justify-center pt-16 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold">Generating your presentation...</p>
            <p className="text-muted-foreground">This may take a moment.</p>
        </div>
        )}

      {presentation && (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-center font-headline">{presentation.title}</h2>
            <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                    {presentation.slides.map((slide, index) => (
                    <CarouselItem key={index}>
                        <div className="p-1">
                        <Card className="min-h-[500px] flex flex-col">
                            <CardHeader>
                                <CardTitle className="font-headline">{index + 1}. {slide.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                                <div className="space-y-4">
                                    <h3 className="font-semibold flex items-center gap-2"><List /> Content</h3>
                                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                        {slide.content.map((point, i) => <li key={i}>{point}</li>)}
                                    </ul>
                                </div>
                                <div className="space-y-4 md:border-l md:pl-6">
                                    <div className="space-y-2">
                                        <h3 className="font-semibold flex items-center gap-2"><Mic /> Speaker Notes</h3>
                                        <p className="text-sm text-muted-foreground">{slide.speakerNotes}</p>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <h3 className="font-semibold flex items-center gap-2"><ImageIcon /> Visual Suggestion</h3>
                                        <p className="text-sm text-muted-foreground italic">{slide.visualSuggestion}</p>
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
