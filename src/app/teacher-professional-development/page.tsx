
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { professionalDevelopmentAction } from "@/lib/actions";
import { Loader2, Wand2, Mic, MicOff, Rocket, Lightbulb, Youtube } from "lucide-react";
import type { ProfessionalDevelopmentPlan } from "@/ai/flows/teacher-pd.types";
import { useLanguage } from "@/context/language-context";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { Separator } from "@/components/ui/separator";

export default function TeacherProfessionalDevelopmentPage() {
  const [learningGoal, setLearningGoal] = useState("");
  const [plan, setPlan] = useState<ProfessionalDevelopmentPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const speechRecognition = useSpeechRecognition({
      lang: language,
      onResult: setLearningGoal,
      onError: (error) => {
          toast({ title: t('error'), description: error, variant: "destructive" });
      }
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (speechRecognition.isListening) {
        speechRecognition.stopListening();
    }
    if (!learningGoal.trim()) {
      toast({
        title: t('pd_error_noGoal_title'),
        description: t('pd_error_noGoal_desc'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setPlan(null);

    const result = await professionalDevelopmentAction({ learningGoal });

    if (result.success && result.data) {
      setPlan(result.data);
    } else {
      toast({
        title: t('error'),
        description: 'error' in result ? result.error : t('pd_error_generic'),
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Teacher Growth</h1>
        <p className="text-muted-foreground">{t('teacherPD_description')}</p>
      </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Rocket /> {t('pd_cardTitle')}
            </CardTitle>
            <CardDescription>{t('pd_cardDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 md:flex md:items-end md:gap-4 md:space-y-0">
              <div className="flex-grow space-y-2">
                <Label htmlFor="learning-goal">{t('pd_goal_label')}</Label>
                <div className="flex items-center gap-2">
                    <Input
                        id="learning-goal"
                        value={learningGoal}
                        onChange={(e) => setLearningGoal(e.target.value)}
                        placeholder={t('pd_goal_placeholder')}
                        className="flex-grow"
                    />
                    {speechRecognition.hasPermission && (
                        <Button type="button" size="icon" variant={speechRecognition.isListening ? "destructive" : "outline"} onClick={() => speechRecognition.isListening ? speechRecognition.stopListening() : speechRecognition.startListening()}>
                            {speechRecognition.isListening ? <MicOff /> : <Mic />}
                            <span className="sr-only">{speechRecognition.isListening ? "Stop listening" : "Start listening"}</span>
                        </Button>
                    )}
                </div>
              </div>
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                {isLoading ? t('generating_button') : t('pd_submit_button')}
              </Button>
            </form>
          </CardContent>
        </Card>

      {isLoading && (
        <div className="flex flex-col items-center justify-center pt-16 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold">{t('pd_generating_plan')}</p>
            <p className="text-muted-foreground">{t('pd_generating_desc')}</p>
        </div>
      )}

      {plan && (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center font-headline">{plan.planTitle}</h2>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Lightbulb /> {t('pd_concepts_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        {plan.keyConcepts.map((concept, index) => <li key={index}>{concept}</li>)}
                    </ul>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plan.suggestedSteps.map((step, index) => (
                    <Card key={index} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="font-headline text-xl">{step.title}</CardTitle>
                            <CardDescription>{step.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-2">{t('pd_strategies_title')}</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                    {step.strategies.map((strategy, sIndex) => <li key={sIndex}>{strategy}</li>)}
                                </ul>
                            </div>
                            <Separator />
                            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(step.youtubeSearchQuery)}`} target="_blank" rel="noopener noreferrer">
                                <Button className="w-full">
                                    <Youtube className="mr-2" />
                                    {t('pd_watch_on_youtube')}
                                </Button>
                            </a>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}
