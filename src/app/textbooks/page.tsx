
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { textbookData, type Textbook } from "@/lib/textbook-data";
import { questionBankData, type QuestionBank } from "@/lib/question-bank-data";
import { Library, Filter, Book, BarChart2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/context/language-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function TextbookLibrary() {
  const [allTextbooks] = useState<Textbook[]>(textbookData);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const { t } = useLanguage();

  const grades = useMemo(() => {
    const gradeSet = new Set(allTextbooks.map(v => v.grade));
    return ["all", ...Array.from(gradeSet).sort((a,b) => parseInt(a) - parseInt(b))];
  }, [allTextbooks]);

  const subjects = useMemo(() => {
    let booksToShow = allTextbooks;
    if (selectedGrade !== 'all') {
        booksToShow = booksToShow.filter(v => v.grade === selectedGrade);
    }
    const subjectSet = new Set(booksToShow.map(v => v.subject));
    return ["all", ...Array.from(subjectSet).sort()];
  }, [allTextbooks, selectedGrade]);
  
  const filteredTextbooks = useMemo(() => {
    return allTextbooks
      .filter(book => selectedGrade === 'all' || book.grade === selectedGrade)
      .filter(book => selectedSubject === 'all' || book.subject === selectedSubject);
  }, [allTextbooks, selectedGrade, selectedSubject]);

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setSelectedSubject("all");
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Filter /> {t('filterTextbooks_title')}</CardTitle>
          <CardDescription>{t('filterTextbooks_description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="grade-filter" className="flex items-center gap-1"><BarChart2 className="w-4 h-4" />{t('grade_label')}</Label>
            <Select value={selectedGrade} onValueChange={handleGradeChange}>
              <SelectTrigger id="grade-filter-textbooks">
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
              <SelectTrigger id="subject-filter-textbooks">
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {filteredTextbooks.map(book => (
          <Link key={book.id} href={book.pdfUrl} target="_blank" rel="noopener noreferrer">
            <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="relative w-full aspect-[3/4]">
                    <Image 
                        src={book.coverImageUrl}
                        alt={`Cover of ${book.title}`}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="textbook cover"
                    />
                </div>
                <CardHeader className="p-3">
                    <CardTitle className="font-headline text-base truncate">{book.title}</CardTitle>
                    <CardDescription className="text-xs">
                        <span>{t('grade_prefix')}: {book.grade}</span> | <span>{book.subject}</span>
                    </CardDescription>
                </CardHeader>
            </Card>
          </Link>
        ))}

        {filteredTextbooks.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-16">
            <p>{t('noTextbooksFound_text')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionBankLibrary() {
  const [allQuestionBanks] = useState<QuestionBank[]>(questionBankData);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const { t } = useLanguage();

  const grades = useMemo(() => {
    const gradeSet = new Set(allQuestionBanks.map(v => v.grade));
    return ["all", ...Array.from(gradeSet).sort((a,b) => parseInt(a) - parseInt(b))];
  }, [allQuestionBanks]);

  const subjects = useMemo(() => {
    let banksToShow = allQuestionBanks;
    if (selectedGrade !== 'all') {
        banksToShow = banksToShow.filter(v => v.grade === selectedGrade);
    }
    const subjectSet = new Set(banksToShow.map(v => v.subject));
    return ["all", ...Array.from(subjectSet).sort()];
  }, [allQuestionBanks, selectedGrade]);
  
  const filteredQuestionBanks = useMemo(() => {
    return allQuestionBanks
      .filter(bank => selectedGrade === 'all' || bank.grade === selectedGrade)
      .filter(bank => selectedSubject === 'all' || bank.subject === selectedSubject);
  }, [allQuestionBanks, selectedGrade, selectedSubject]);

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setSelectedSubject("all");
  }

  return (
     <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Filter /> {t('filterQuestionBanks_title')}</CardTitle>
          <CardDescription>{t('filterQuestionBanks_description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="grade-filter-qb" className="flex items-center gap-1"><BarChart2 className="w-4 h-4" />{t('grade_label')}</Label>
            <Select value={selectedGrade} onValueChange={handleGradeChange}>
              <SelectTrigger id="grade-filter-qb">
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
            <Label htmlFor="subject-filter-qb" className="flex items-center gap-1"><Book className="w-4 h-4" />{t('subject_label')}</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger id="subject-filter-qb">
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {filteredQuestionBanks.map(bank => (
          <Link key={bank.id} href={bank.pdfUrl} target="_blank" rel="noopener noreferrer">
            <Card className="overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="relative w-full aspect-[3/4]">
                    <Image 
                        src={bank.coverImageUrl}
                        alt={`Cover of ${bank.title}`}
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="question bank document"
                    />
                </div>
                <CardHeader className="p-3">
                    <CardTitle className="font-headline text-base truncate">{bank.title}</CardTitle>
                    <CardDescription className="text-xs">
                        <span>{t('grade_prefix')}: {bank.grade}</span> | <span>{bank.subject}</span>
                    </CardDescription>
                </CardHeader>
            </Card>
          </Link>
        ))}

        {filteredQuestionBanks.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-16">
            <p>{t('noQuestionBanksFound_text')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TextbooksPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <Library /> {t('textbooks_title')}
        </h1>
        <p className="text-muted-foreground">{t('textbooks_page_description')}</p>
      </div>

       <Tabs defaultValue="textbooks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="textbooks">{t('textbooks_tab_title')}</TabsTrigger>
          <TabsTrigger value="question_banks">{t('questionBanks_tab_title')}</TabsTrigger>
        </TabsList>
        <TabsContent value="textbooks" className="mt-6">
          <TextbookLibrary />
        </TabsContent>
        <TabsContent value="question_banks" className="mt-6">
          <QuestionBankLibrary />
        </TabsContent>
      </Tabs>
    </div>
  );
}
