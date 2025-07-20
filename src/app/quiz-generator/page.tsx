
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateQuizAction, textToSpeechAction } from '@/lib/actions';
import { Loader2, Volume2, FileText, Wand2, Mic, MicOff } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import { useLanguage } from '@/context/language-context';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';

export default function QuizGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quiz, setQuiz] = useState<GenerateQuizOutput | null>(null);
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
        description: 'Please enter a topic for the quiz.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setQuiz(null);

    const result = await generateQuizAction({ topic, numQuestions });

    if (result.success && result.data) {
      setQuiz(result.data);
    } else {
      toast({
        title: 'Error Generating Quiz',
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Automated Quiz Generation</h1>
        <p className="text-muted-foreground">Create quizzes on any topic in seconds.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Wand2 /> Quiz Settings
            </CardTitle>
            <CardDescription>Define the topic and length of your quiz.</CardDescription>
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
                    placeholder="e.g., The Solar System"
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
              <div className="space-y-2">
                <Label htmlFor="numQuestions">Number of Questions</Label>
                <Input
                  id="numQuestions"
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  min="1"
                  max="20"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                {isLoading ? 'Generating Quiz...' : 'Generate Quiz'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <FileText /> Generated Quiz
            </CardTitle>
            <CardDescription>{quiz ? quiz.title : 'Your quiz will appear here.'}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            {quiz && (
              <div className="space-y-6">
                {quiz.questions.map((q, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{index + 1}. {q.question}</p>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handlePlayAudio(q.question, index)}
                        disabled={isAudioLoading !== null}
                      >
                        {isAudioLoading === index ? <Loader2 className="animate-spin" /> : <Volume2 />}
                        <span className="sr-only">Read question</span>
                      </Button>
                    </div>
                    <RadioGroup>
                      {q.options.map((option, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <RadioGroupItem value={String(i)} id={`q${index}-o${i}`} />
                          <Label htmlFor={`q${index}-o${i}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
                {audioSrc && <audio src={audioSrc} autoPlay onEnded={() => setAudioSrc(null)} />}
              </div>
            )}
            {!isLoading && !quiz && (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>Your generated quiz will be displayed here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
