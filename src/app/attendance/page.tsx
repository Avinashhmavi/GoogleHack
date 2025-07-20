"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { recognizeStudentsAction } from "@/lib/actions";
import { Loader2, Camera, Users, ListChecks } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/context/language-context";

export default function AttendancePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [presentStudents, setPresentStudents] = useState<string[] | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: t('cameraAccessDenied_title'),
          description: t('cameraAccessDenied_description'),
        });
      }
    };
    getCameraPermission();
  }, [toast, t]);

  const handleTakeAttendance = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsLoading(true);
    setPresentStudents(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoDataUri = canvas.toDataURL('image/jpeg');

    const result = await recognizeStudentsAction({ photoDataUri });

    if (result.success && result.data) {
      setPresentStudents(result.data.presentStudents);
    } else {
      toast({
        title: t('errorRecognizingStudents_title'),
        description: result.error || t('errorRecognizingStudents_description'),
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{t('pageHeader_attendance')}</h1>
        <p className="text-muted-foreground">{t('pageDescription_attendance')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Camera /> {t('cameraView_title')}</CardTitle>
            <CardDescription>{t('cameraView_description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative w-full aspect-video bg-secondary rounded-md overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                <canvas ref={canvasRef} className="hidden" />
            </div>
            
            {hasCameraPermission === false && (
                <Alert variant="destructive">
                  <AlertTitle>{t('cameraAccessRequired_title')}</AlertTitle>
                  <AlertDescription>
                    {t('cameraAccessRequired_description')}
                  </AlertDescription>
                </Alert>
            )}

            <Button
              onClick={handleTakeAttendance}
              disabled={isLoading || hasCameraPermission !== true}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 animate-spin" /> {t('analyzing_button')}</>
              ) : (
                <><Users className="mr-2" /> {t('takeAttendance_button')}</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><ListChecks /> {t('attendanceList_title')}</CardTitle>
            <CardDescription>{t('attendanceList_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            {presentStudents !== null && (
                <div>
                    <h3 className="font-semibold">{presentStudents.length} {t('studentsPresent_text')}</h3>
                    <Separator className="my-4" />
                    {presentStudents.length > 0 ? (
                        <ul className="space-y-2">
                            {presentStudents.map((student, index) => (
                                <li key={index} className="p-2 bg-secondary/50 rounded-md">{student}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">{t('noStudentsRecognized_text')}</p>
                    )}
                </div>
            )}
             {!isLoading && presentStudents === null && (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>{t('attendanceResultsPlaceholder')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
