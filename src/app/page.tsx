"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, GraduationCap, Languages, QrCode, ScanLine, FileQuestion, ClipboardCheck, Edit, Users, UserCog, BookText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";

const features = [
  {
    titleKey: 'photoToWorksheet',
    descriptionKey: 'photoToWorksheet',
    href: '/photo-to-worksheet',
    icon: <ScanLine className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'multiLanguageContent',
    descriptionKey: 'multiLanguageContent',
    href: '/multi-language-content',
    icon: <Languages className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'contentAdaptation',
    descriptionKey: 'contentAdaptation',
    href: '/content-adaptation',
    icon: <GraduationCap className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'qrCodeGenerator',
    descriptionKey: 'qrCodeGenerator',
    href: '/qr-code-generator',
    icon: <QrCode className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'gradeTracking',
    descriptionKey: 'gradeTracking',
    href: '/grade-tracking',
    icon: <BarChart3 className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'quizGenerator',
    descriptionKey: 'quizGenerator',
    href: '/quiz-generator',
    icon: <FileQuestion className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'rubricCreator',
    descriptionKey: 'rubricCreator',
    href: '/rubric-creator',
    icon: <ClipboardCheck className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'writingAssistant',
    descriptionKey: 'writingAssistant',
    href: '/writing-assistant',
    icon: <Edit className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'attendance',
    descriptionKey: 'attendance',
    href: '/attendance',
    icon: <Users className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'studentRoster',
    descriptionKey: 'studentRoster',
    href: '/student-roster',
    icon: <UserCog className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'lessonPlanner',
    descriptionKey: 'lessonPlanner',
    href: '/lesson-planner',
    icon: <BookText className="w-8 h-8 text-primary" />,
  }
];

export default function Home() {
  const { t } = useLanguage();

  const featureDescriptions: {[key: string]: string} = {
    photoToWorksheet: 'Convert textbook pages into interactive worksheets instantly.',
    multiLanguageContent: 'Generate educational materials in a variety of languages.',
    contentAdaptation: 'Adjust text to be suitable for different grade levels.',
    qrCodeGenerator: 'Create QR codes for answer keys and other resources.',
    gradeTracking: 'Monitor student progress and generate reports.',
    quizGenerator: 'Create quizzes on any topic in seconds with AI.',
    rubricCreator: 'Generate detailed grading rubrics for assignments.',
    writingAssistant: 'Get feedback on grammar, spelling, and style.',
    attendance: 'Use face recognition to take class attendance.',
    studentRoster: 'Manage student photos and names for the attendance system.',
    lessonPlanner: 'Automatically generate detailed lesson plans for any subject.',
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline text-primary">
          {t('welcomeMessage')}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {t('welcomeDescription')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.href} className="flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center gap-4">
                {feature.icon}
                <CardTitle className="font-headline">{t(feature.titleKey)}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <p className="flex-grow text-muted-foreground">{featureDescriptions[feature.descriptionKey]}</p>
              <Link href={feature.href}>
                <Button variant="outline" className="w-full">
                  {t('goToFeature')} <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
