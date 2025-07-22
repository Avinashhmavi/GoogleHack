
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { videoData, type Video } from "@/lib/smart-class-data";
import { School, Filter, Book, BarChart2, UploadCloud, Video as VideoIcon, Wand2, Loader2, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/language-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { searchYoutubeVideosAction, addRecordingAction, getRecordingsAction, deleteRecordingAction } from "@/lib/actions";
import type { YouTubeVideo } from "@/ai/flows/search-youtube-videos.types";
import type { ClassRecording } from "@/lib/firestore";
import { useAuth } from "@/context/auth-context";

function YouTubeLibrary() {
  const [allVideos] = useState<Video[]>(videoData);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const { t } = useLanguage();

  const grades = useMemo(() => {
    const gradeSet = new Set(allVideos.map(v => v.grade));
    return ["all", ...Array.from(gradeSet).sort((a,b) => parseInt(a) - parseInt(b))];
  }, [allVideos]);

  const subjects = useMemo(() => {
    let videosToShow = allVideos;
    if (selectedGrade !== 'all') {
        videosToShow = videosToShow.filter(v => v.grade === selectedGrade);
    }
    const subjectSet = new Set(videosToShow.map(v => v.subject));
    return ["all", ...Array.from(subjectSet).sort()];
  }, [allVideos, selectedGrade]);
  
  const filteredVideos = useMemo(() => {
    return allVideos
      .filter(video => selectedGrade === 'all' || video.grade === selectedGrade)
      .filter(video => selectedSubject === 'all' || video.subject === selectedSubject);
  }, [allVideos, selectedGrade, selectedSubject]);

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setSelectedSubject("all"); // Reset subject when grade changes
  }

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Filter /> {t('filterVideos_title')}</CardTitle>
            <CardDescription>{t('filterVideos_description')}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="grade-filter" className="flex items-center gap-1"><BarChart2 className="w-4 h-4" />{t('grade_label')}</Label>
                    <Select value={selectedGrade} onValueChange={handleGradeChange}>
                        <SelectTrigger id="grade-filter">
                            <SelectValue placeholder={t('selectGrade_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {grades.map(grade => (
                                <SelectItem key={grade} value={grade}>{grade === 'all' ? t('allGrades_option') : `${t('grade_prefix')} ${grade}`}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subject-filter" className="flex items-center gap-1"><Book className="w-4 h-4" />{t('subject_label')}</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger id="subject-filter">
                            <SelectValue placeholder={t('selectSubject_placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {subjects.map(subject => (
                                <SelectItem key={subject} value={subject}>{subject === 'all' ? t('allSubjects_option') : subject}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map(video => (
                <Card key={video.id} className="overflow-hidden flex flex-col">
                    <div className="relative w-full aspect-video bg-black">
                      {playingId === video.id ? (
                        <iframe 
                            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                            title={video.title}
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                        ></iframe>
                      ) : (
                        <button
                          className="absolute top-0 left-0 w-full h-full flex items-center justify-center group"
                          onClick={() => setPlayingId(video.id)}
                          aria-label={`Play ${video.title}`}
                        >
                          <img
                            src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:opacity-80 transition"
                          />
                          <span className="absolute text-white bg-black/70 rounded-full p-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25v13.5l13.5-6.75-13.5-6.75z" />
                            </svg>
                          </span>
                        </button>
                      )}
                    </div>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">{video.title}</CardTitle>
                        <CardDescription>
                            <span>{t('grade_prefix')}: {video.grade}</span> | <span>{t('subject_prefix')}: {video.subject}</span>
                        </CardDescription>
                    </CardHeader>
                </Card>
            ))}

            {filteredVideos.length === 0 && (
                <div className="md:col-span-2 lg:col-span-3 text-center text-muted-foreground py-16">
                    <p>{t('noVideosFound_text')}</p>
                </div>
            )}
        </div>
    </div>
  );
}

function ClassRecordings() {
  const [recordings, setRecordings] = useState<ClassRecording[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { authStatus } = useAuth();

  useEffect(() => {
    async function fetchRecordings() {
      setIsLoading(true);
      const result = await getRecordingsAction();
      if (result.success) {
        setRecordings(result.data);
      } else {
        toast({ title: "Error", description: "Could not fetch recordings.", variant: "destructive" });
      }
      setIsLoading(false);
    }
    if (authStatus === 'authenticated') {
        fetchRecordings();
    }
  }, [authStatus, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        const result = await addRecordingAction({
            name: selectedFile.name,
            dataUrl: dataUrl,
        });
        if (result.success) {
            setRecordings(result.data);
            setSelectedFile(null);
            toast({ title: "Success", description: "Recording uploaded." });
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
        setIsUploading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    const originalRecordings = [...recordings];
    setRecordings(prev => prev.filter(r => r.id !== id));

    const result = await deleteRecordingAction(id);
    if (result.success) {
      setRecordings(result.data);
      toast({ title: "Success", description: "Recording deleted." });
    } else {
      setRecordings(originalRecordings);
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <UploadCloud /> Upload New Recording
          </CardTitle>
          <CardDescription>Upload a video of your class session for students to review.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
            <Input type="file" accept="video/*" onChange={handleFileChange} className="flex-grow" key={selectedFile ? selectedFile.name : 'file-input'} />
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                {isUploading ? <Loader2 className="mr-2 animate-spin" /> : <UploadCloud className="mr-2" />}
                Upload Video
            </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary w-8 h-8"/></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recordings.map((video) => (
            <Card key={video.id} className="overflow-hidden flex flex-col group">
              <div className="relative w-full aspect-video bg-black">
                  <video controls src={video.dataUrl} className="w-full h-full" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-headline text-lg flex items-center gap-2">
                      <VideoIcon /> {video.name}
                  </CardTitle>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" onClick={() => handleDelete(video.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
              </CardHeader>
            </Card>
          ))}
          {recordings.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 text-center text-muted-foreground py-16">
                  <p>No class recordings uploaded yet. Use the form above to add your first video.</p>
              </div>
          )}
        </div>
      )}
    </div>
  );
}

function AIVideoSearch() {
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("English");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !grade || !subject) {
      toast({
        title: "Missing Information",
        description: "Please select a grade, subject, and enter a topic.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setResults([]);
    
    const actionResult = await searchYoutubeVideosAction({ grade, subject, topic, language });
    if(actionResult.success) {
      setResults(actionResult.data.videos);
    } else {
      toast({
        title: "AI Search Failed",
        description: actionResult.error,
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };
  
  const subjects = ['Math', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology'];
  const grades = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const languages = ["English", "Hindi", "Spanish", "French", "Bengali"];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Wand2 /> AI Video Search
          </CardTitle>
          <CardDescription>
            Let AI find the best educational videos on YouTube for your specific needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ai-grade">Grade</Label>
                <Select value={grade} onValueChange={setGrade}>
                  <SelectTrigger id="ai-grade">
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map(g => <SelectItem key={g} value={g}>Grade {g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-subject">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger id="ai-subject">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="ai-language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="ai-language">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-topic">Topic</Label>
                <Input id="ai-topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Photosynthesis" />
              </div>
            </div>
            <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
              Search with AI
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(video => (
            <Card key={video.id} className="overflow-hidden flex flex-col">
              <div className="relative w-full aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                ></iframe>
              </div>
              <CardHeader>
                <CardTitle className="font-headline text-lg">{video.title}</CardTitle>
                <CardDescription>
                  Published by {video.channelTitle}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
      
       {!isLoading && results.length === 0 && (
          <div className="text-center text-muted-foreground py-16">
              <p>AI search results will appear here.</p>
          </div>
      )}

    </div>
  );
}


export default function SmartClassPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <School /> {t('smartClass_title')}
        </h1>
        <p className="text-muted-foreground">{t('smartClass_description')}</p>
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library">YouTube Library</TabsTrigger>
          <TabsTrigger value="ai_search">AI Video Search</TabsTrigger>
          <TabsTrigger value="recordings">My Class Recordings</TabsTrigger>
        </TabsList>
        <TabsContent value="library" className="mt-6">
          <YouTubeLibrary />
        </TabsContent>
        <TabsContent value="ai_search" className="mt-6">
          <AIVideoSearch />
        </TabsContent>
        <TabsContent value="recordings" className="mt-6">
          <ClassRecordings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
