"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { askSahayakAction, textToSpeechAction } from "@/lib/actions";
import { Loader2, HelpCircle, Sparkles, Volume2, Mic } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/context/language-context";

export default function AskSahayakPage() {
  const [question, setQuestion] = useState("");
  const [gradeLevel, setGradeLevel] = useState(5);
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const { toast } = useToast();
  const { language, t } = useLanguage();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim()) {
      toast({
        title: t('askSahayak_error_noQuestion_title'),
        description: t('askSahayak_error_noQuestion_desc'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnswer(null);
    setAudioSrc(null);

    const result = await askSahayakAction({ question, gradeLevel, language });

    if (result.success && result.data) {
      setAnswer(result.data.answer);
    } else {
      toast({
        title: t('error'),
        description: result.error || t('askSahayak_error_generic'),
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };
  
  const handlePlayAudio = async () => {
    if (!answer) return;
    setIsAudioLoading(true);
    setAudioSrc(null);
    try {
      const result = await textToSpeechAction({ text: answer });
      if (result.success && result.data) {
        setAudioSrc(result.data.audioDataUri);
      } else {
        toast({
          title: t('error'),
          description: result.error || t('askSahayak_error_audio'),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('askSahayak_error_audio'),
        variant: "destructive",
      });
    } finally {
      setIsAudioLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('askSahayak_title')}</h1>
        <p className="text-muted-foreground">{t('askSahayak_description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <HelpCircle /> {t('askSahayak_cardTitle')}
          </CardTitle>
          <CardDescription>{t('askSahayak_cardDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question">{t('askSahayak_question_label')}</Label>
              <Textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t('askSahayak_question_placeholder')}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="gradeLevel">{t('contentCreator_gradeLevel_label')}: {gradeLevel}</Label>
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
            <Button type="submit" disabled={isLoading} className="w-full" size="lg">
              {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
              {isLoading ? t('generating_button') : t('askSahayak_submit_button')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center pt-8">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      )}

      {answer && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="font-headline flex items-center gap-2">
                    <Mic /> {t('askSahayak_answer_title')}
                </CardTitle>
                <Button
                    onClick={handlePlayAudio}
                    disabled={isAudioLoading}
                    variant="outline"
                    size="icon"
                    aria-label="Read answer aloud"
                >
                    {isAudioLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
                </Button>
            </div>
            <CardDescription>{t('askSahayak_answer_description')}</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none text-foreground">
            {answer}
          </CardContent>
        </Card>
      )}
      
      {audioSrc && <audio src={audioSrc} autoPlay onEnded={() => setAudioSrc(null)} />}
    </div>
  );
}
