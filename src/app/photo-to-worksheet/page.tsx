"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { photoToWorksheetAction } from "@/lib/actions";
import { Loader2, Upload, FileText } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";

export default function PhotoToWorksheetPage() {
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [worksheet, setWorksheet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    setWorksheet(null);

    const result = await photoToWorksheetAction({ photoDataUri });

    if (result.success && result.data) {
      setWorksheet(result.data.worksheet);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to generate worksheet.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
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
            {worksheet && (
              <Textarea
                readOnly
                value={worksheet}
                className="w-full h-full min-h-[300px] resize-none bg-secondary/50"
                aria-label="Generated Worksheet"
              />
            )}
            {!isLoading && !worksheet && (
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
