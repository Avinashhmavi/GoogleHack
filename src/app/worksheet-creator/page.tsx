
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { createWorksheetAction, textToSpeechAction } from '@/lib/actions';
import { Loader2, Volume2, FileText as WorksheetIcon, Wand2, Mic, MicOff, Check, XIcon } from 'lucide-react';
import type { CreateWorksheetOutput } from '@/ai/flows/create-worksheet.types';
import { useLanguage } from '@/context/language-context';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function WorksheetCreatorPage() {
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState(5);
  const [numQuestions, setNumQuestions] = useState(5);
  const [worksheet, setWorksheet] = useState<CreateWorksheetOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState<number | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  const speechRecognition = useSpeechRecognition({
      lang: language,
      onResult: setTopic,
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
    if (!topic.trim()) {
      toast({
        title: 'Topic is empty',
        description: 'Please enter a topic for the worksheet.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setWorksheet(null);

    const result = await createWorksheetAction({ topic, gradeLevel, numQuestions });

    if (result.success && result.data) {
      setWorksheet(result.data as CreateWorksheetOutput);
    } else {
      toast({
        title: 'Error Generating Worksheet',
        description: result.error || 'An unknown error occurred.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  const handlePlayAudio = async (text: string, index: number) => {
    setIsAudioLoading(index);
    setAudioSrc(null);
    try {
      const result = await textToSpeechAction({ text });
      if (result.success && result.data) {
        setAudioSrc(result.data.audioDataUri);
      } else {
        toast({
          title: 'Error Generating Audio',
          description: result.error || 'Could not generate audio.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while generating audio.',
        variant: 'destructive',
      });
    } finally {
      setIsAudioLoading(null);
    }
  };
  
  const renderQuestion = (q: any, index: number) => {
    switch (q.type) {
        case 'multiple-choice':
            return (
                <RadioGroup>
                  {q.options.map((option: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`q${index}-o${i}`} />
                      <Label htmlFor={`q${index}-o${i}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
            );
        case 'true-false':
            return (
                <RadioGroup className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="True" id={`q${index}-true`} />
                      <Label htmlFor={`q${index}-true`} className="flex items-center gap-2"><Check className="text-green-500"/>True</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="False" id={`q${index}-false`} />
                      <Label htmlFor={`q${index}-false`} className="flex items-center gap-2"><XIcon className="text-red-500"/>False</Label>
                    </div>
                </RadioGroup>
            );
        case 'short-answer':
        case 'fill-in-the-blank':
            return <Textarea placeholder="Type your answer here..." />;
        default:
            return null;
    }
  }


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI Worksheet Creator</h1>
        <p className="text-muted-foreground">Generate worksheets with varied question types for any topic.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Wand2 /> Worksheet Settings
            </CardTitle>
            <CardDescription>Provide a topic and settings to create your worksheet.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., The Water Cycle"
                    className="flex-grow"
                  />
                  {speechRecognition.hasPermission && (
                      <Button type="button" size="icon" variant={speechRecognition.isListening ? "destructive" : "outline"} onClick={toggleListening}>
                          {speechRecognition.isListening ? <MicOff /> : <Mic />}
                          <span className="sr-only">{speechRecognition.isListening ? "Stop listening" : "Start listening"}</span>
                      </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="gradeLevel">Grade Level</Label>
                    <Input
                        id="gradeLevel"
                        type="number"
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(Number(e.target.value))}
                        min="1"
                        max="12"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="numQuestions">Number of Questions</Label>
                    <Input
                    id="numQuestions"
                    type="number"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    min="3"
                    max="20"
                    />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                {isLoading ? 'Generating Worksheet...' : 'Generate Worksheet'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col lg:sticky lg:top-8">
          <CardHeader>
            <CardTitle className="font-headline flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <WorksheetIcon /> Generated Worksheet
                </div>
                {worksheet && <Badge>{worksheet.title}</Badge>}
            </CardTitle>
            <CardDescription>Your worksheet questions will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            {worksheet && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {worksheet.questions.map((q, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <p className="font-semibold flex-grow pr-2">{index + 1}. {q.question}</p>
                      <Badge variant="outline" className="text-xs">{q.type.replace('-', ' ')}</Badge>
                    </div>
                    <div>
                        {renderQuestion(q, index)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!isLoading && !worksheet && (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>Your generated worksheet will be displayed here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
