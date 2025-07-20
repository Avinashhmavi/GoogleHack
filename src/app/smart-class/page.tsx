
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { videoData, type Video } from "@/lib/smart-class-data";
import { School, Filter, Book, BarChart2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/language-context";

export default function SmartClassPage() {
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
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <School /> {t('smartClass_title')}
        </h1>
        <p className="text-muted-foreground">{t('smartClass_description')}</p>
      </div>

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
