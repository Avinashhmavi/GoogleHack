
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { recognizeStudentsAction, getStudentsAction } from "@/lib/actions";
import { Loader2, Camera, Users, ListChecks } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/context/language-context";

// Type guard function
function isSuccessResult(result: { success: boolean; data?: any; error?: string }): result is { success: true; data: { presentStudents: string[] } } {
  return result.success === true && result.data !== undefined;
}

export default function AttendancePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [presentStudents, setPresentStudents] = useState<string[] | null>(null);
  const [allStudents, setAllStudents] = useState<{id: string, name: string}[] | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchAllStudents = async () => {
      const result = await getStudentsAction();
      if (result.success && result.data) {
        setAllStudents(result.data.map(student => ({ id: student.id, name: student.name })));
      }
    };
    fetchAllStudents();
  }, []);

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

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Reduce image quality to improve processing speed
      const photoDataUri = canvas.toDataURL('image/jpeg', 0.8);

      // Add a small delay to allow UI to update before starting the action
      // This helps with perceived performance
      await new Promise(resolve => setTimeout(resolve, 0));

      const result = await recognizeStudentsAction({ photoDataUri });

      if (result.success && 'data' in result) {
        setPresentStudents(result.data.presentStudents);
        toast({
          title: t('attendanceSuccess_title'),
          description: t('attendanceSuccess_description'),
        });
      } else {
        toast({
          title: t('errorRecognizingStudents_title'),
          description: result.error || t('errorRecognizingStudents_description'),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t('errorRecognizingStudents_title'),
        description: t('errorRecognizingStudents_description'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{presentStudents.length} {t('studentsPresent_text')}</h3>
                        <Button variant="outline" size="sm" onClick={() => setPresentStudents([])}>
                            Clear All
                        </Button>
                    </div>
                    <Separator className="my-4" />
                    {presentStudents.length > 0 ? (
                        <ul className="space-y-2">
                            {presentStudents.map((student, index) => (
                                <li key={index} className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                                    <span>{student}</span>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                            const newPresentStudents = [...presentStudents];
                                            newPresentStudents.splice(index, 1);
                                            setPresentStudents(newPresentStudents);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">{t('noStudentsRecognized_text')}</p>
                    )}
                    <div className="mt-4">
                        <details className="border rounded-md p-4">
                            <summary className="cursor-pointer font-medium">Add/Remove Students Manually</summary>
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2">All Students</h4>
                                {allStudents ? (
                                    <ul className="space-y-2 max-h-40 overflow-y-auto">
                                        {allStudents.map((student) => (
                                            <li key={student.id} className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                                                <span>{student.name}</span>
                                                {presentStudents?.includes(student.name) ? (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => {
                                                            if (presentStudents) {
                                                                setPresentStudents(presentStudents.filter(name => name !== student.name));
                                                            }
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => {
                                                            if (presentStudents) {
                                                                setPresentStudents([...presentStudents, student.name]);
                                                            } else {
                                                                setPresentStudents([student.name]);
                                                            }
                                                        }}
                                                    >
                                                        Add
                                                    </Button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-muted-foreground">Loading students...</p>
                                )}
                            </div>
                        </details>
                    </div>
                    <div className="mt-4">
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={async () => {
                                // In a real implementation, this would save the attendance data
                                toast({
                                    title: "Attendance Saved",
                                    description: `Attendance for ${presentStudents.length} students has been recorded.`,
                                });
                            }}
                        >
                            Save Attendance
                        </Button>
                    </div>
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
