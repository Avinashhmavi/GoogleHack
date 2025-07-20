
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { videoData, type Video } from "@/lib/smart-class-data";
import { School, Filter, Book, BarChart2, UploadCloud, Video as VideoIcon, Wand2, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/language-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { searchYoutubeVideosAction } from "@/lib/actions";
import type { YouTubeVideo } from "@/ai/flows/search-youtube-videos.types";

type UploadedVideo = {
  name: string;
  url: string;
};

function YouTubeLibrary() {
  const [allVideos] = useState<Video[]>(videoData);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
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
                    <div className="relative w-full aspect-video">
                        <iframe 
                            src={`https://www.youtube.com/embed/${video.youtubeId}`}
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
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      const newVideo: UploadedVideo = {
        name: selectedFile.name,
        url: URL.createObjectURL(selectedFile),
      };
      setUploadedVideos(prev => [...prev, newVideo]);
      setSelectedFile(null); // Reset file input
    }
  };

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
            <Input type="file" accept="video/*" onChange={handleFileChange} className="flex-grow"/>
            <Button onClick={handleUpload} disabled={!selectedFile}>
                Upload Video
            </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uploadedVideos.map((video, index) => (
          <Card key={index} className="overflow-hidden flex flex-col">
            <div className="relative w-full aspect-video bg-black">
                <video controls src={video.url} className="w-full h-full" />
            </div>
            <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center gap-2">
                    <VideoIcon /> {video.name}
                </CardTitle>
            </CardHeader>
          </Card>
        ))}
        {uploadedVideos.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 text-center text-muted-foreground py-16">
                <p>No class recordings uploaded yet. Use the form above to add your first video.</p>
            </div>
        )}
      </div>
    </div>
  );
}

function AIVideoSearch() {
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
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
    
    const actionResult = await searchYoutubeVideosAction({ grade, subject, topic });
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
