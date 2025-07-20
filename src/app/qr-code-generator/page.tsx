
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateQrCodeAction } from "@/lib/actions";
import { Loader2, Download, Mic, MicOff } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

export default function QrCodeGeneratorPage() {
  const [answerKey, setAnswerKey] = useState("");
  const [qrCodeDataUri, setQrCodeDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const speechRecognition = useSpeechRecognition({
      lang: language,
      onResult: setAnswerKey,
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
    if (speechRecognition.isListening) speechRecognition.stopListening();
    if (!answerKey.trim()) {
      toast({
        title: "Answer key is empty",
        description: "Please enter an answer key to generate a QR code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setQrCodeDataUri(null);

    const result = await generateQrCodeAction({ answerKey });

    if (result.success && result.data) {
      setQrCodeDataUri(result.data.qrCodeDataUri);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to generate QR code.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleDownload = () => {
    if (qrCodeDataUri) {
        const link = document.createElement('a');
        link.href = qrCodeDataUri;
        link.download = 'answer-key-qr-code.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">QR Code Generator for Answer Keys</h1>
        <p className="text-muted-foreground">Easily create and share QR codes for your answer keys.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Enter Answer Key</CardTitle>
            <CardDescription>The text you enter here will be encoded in the QR code.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="answer-key">Answer Key</Label>
                    {speechRecognition.hasPermission && (
                        <Button type="button" size="icon" variant={speechRecognition.isListening ? "destructive" : "outline"} onClick={toggleListening}>
                            {speechRecognition.isListening ? <MicOff /> : <Mic />}
                            <span className="sr-only">{speechRecognition.isListening ? "Stop listening" : "Start listening"}</span>
                        </Button>
                    )}
                </div>
                <Textarea
                  id="answer-key"
                  value={answerKey}
                  onChange={(e) => setAnswerKey(e.target.value)}
                  placeholder="e.g., 1. A, 2. C, 3. B..."
                  className="min-h-[200px]"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 animate-spin" />}
                {isLoading ? "Generating..." : "Generate QR Code"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center">
            <CardHeader className="text-center">
                <CardTitle className="font-headline">Generated QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-grow p-6">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            {qrCodeDataUri && (
                <div className="flex flex-col items-center gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <Image src={qrCodeDataUri} alt="Generated QR Code" width={200} height={200} />
                    </div>
                    <Button onClick={handleDownload} variant="secondary">
                        <Download className="mr-2" />
                        Download QR Code
                    </Button>
                </div>
            )}
            {!isLoading && !qrCodeDataUri && (
              <div className="w-48 h-48 flex items-center justify-center text-center text-muted-foreground bg-gray-100 border-2 border-dashed rounded-lg">
                <p>Your QR Code will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
