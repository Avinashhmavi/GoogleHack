
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { photoToWorksheetAction, textToSpeechAction } from "@/lib/actions";
import { Loader2, Upload, FileText, Volume2 } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";

type Question = {
  id: number;
  text: string;
};

export default function PhotoToWorksheetPage() {
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState<number | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!photoDataUri) {
      toast({
        title: "No photo selected",
        description: "Please upload a photo of a textbook page.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setQuestions([]);

    const result = await photoToWorksheetAction({ photoDataUri });

    if (result.success && result.data) {
      // Assuming the worksheet is a string with questions separated by newlines
      const generatedQuestions = result.data.worksheet
        .split('\n')
        .filter(q => q.trim().length > 0)
        .map((q, index) => ({ id: index, text: q }));
      setQuestions(generatedQuestions);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to generate worksheet.",
        variant: "destructive",
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
        <h1 className="text-3xl font-bold font-headline">{t('pageHeader_photoToWorksheet')}</h1>
        <p className="text-muted-foreground">{t('pageDescription_photoToWorksheet')}</p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">{t('uploadPhoto_title')}</CardTitle>
            <CardDescription>{t('uploadPhoto_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="photo-upload">{t('textbookPagePhoto_label')}</Label>
                <div className="flex items-center gap-2">
                  <Input id="photo-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <Button asChild variant="outline">
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <Upload className="mr-2" />
                      {t('chooseFile_button')}
                    </Label>
                  </Button>
                  {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
                </div>
              </div>

              {photoDataUri && (
                <div className="mt-4 border rounded-md p-2">
                  <Image src={photoDataUri} alt="Preview" width={400} height={300} className="w-full h-auto rounded-md object-contain max-h-64" data-ai-hint="textbook page" />
                </div>
              )}
              
              <Button type="submit" disabled={isLoading || !photoDataUri} className="w-full">
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                {isLoading ? t('generating_button') : t('generateWorksheet_button')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><FileText /> {t('generatedWorksheet_title')}</CardTitle>
            <CardDescription>{t('generatedWorksheet_description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            {questions.length > 0 && (
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <div key={q.id} className="p-3 border rounded-lg flex items-center justify-between">
                    <p className="flex-grow">{q.text}</p>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handlePlayAudio(q.text, index)}
                        disabled={isAudioLoading !== null}
                        aria-label="Read question aloud"
                      >
                        {isAudioLoading === index ? <Loader2 className="animate-spin" /> : <Volume2 />}
                      </Button>
                  </div>
                ))}
                {audioSrc && <audio src={audioSrc} autoPlay onEnded={() => setAudioSrc(null)} />}
              </div>
            )}
            {!isLoading && questions.length === 0 && (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>{t('worksheetPlaceholder')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
