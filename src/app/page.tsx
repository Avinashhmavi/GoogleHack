
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, GraduationCap, Languages, QrCode, ScanLine, FileQuestion, ClipboardCheck, Edit, Users, UserCog, BookText, MessageSquare, Brush, HelpCircle, Presentation } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";

const features = [
  {
    titleKey: 'askSahayak_title',
    descriptionKey: 'askSahayak_dashboard_desc',
    href: '/ask-sahayak',
    icon: <HelpCircle className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'photoToWorksheet',
    descriptionKey: 'photoToWorksheet_desc',
    href: '/photo-to-worksheet',
    icon: <ScanLine className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'contentCreator',
    descriptionKey: 'contentCreator_desc',
    href: '/content-creator',
    icon: <Languages className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'contentAdaptation',
    descriptionKey: 'contentAdaptation_desc',
    href: '/content-adaptation',
    icon: <GraduationCap className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'visualAidsGenerator',
    descriptionKey: 'visualAidsGenerator_desc',
    href: '/visual-aids-generator',
    icon: <Brush className="w-8 h-8 text-primary" />,
  },
   {
    titleKey: 'presentationCreator',
    descriptionKey: 'presentationCreator_desc',
    href: '/presentation-creator',
    icon: <Presentation className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'qrCodeGenerator',
    descriptionKey: 'qrCodeGenerator_desc',
    href: '/qr-code-generator',
    icon: <QrCode className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'gradeTracking',
    descriptionKey: 'gradeTracking_desc',
    href: '/grade-tracking',
    icon: <BarChart3 className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'quizGenerator',
    descriptionKey: 'quizGenerator_desc',
    href: '/quiz-generator',
    icon: <FileQuestion className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'rubricCreator',
    descriptionKey: 'rubricCreator_desc',
    href: '/rubric-creator',
    icon: <ClipboardCheck className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'writingAssistant',
    descriptionKey: 'writingAssistant_desc',
    href: '/writing-assistant',
    icon: <Edit className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'attendance',
    descriptionKey: 'attendance_desc',
    href: '/attendance',
    icon: <Users className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'studentRoster',
    descriptionKey: 'studentRoster_desc',
    href: '/student-roster',
    icon: <UserCog className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'lessonPlanner',
    descriptionKey: 'lessonPlanner_desc',
    href: '/lesson-planner',
    icon: <BookText className="w-8 h-8 text-primary" />,
  },
  {
    titleKey: 'discussionGenerator',
    descriptionKey: 'discussionGenerator_desc',
    href: '/discussion-generator',
    icon: <MessageSquare className="w-8 h-8 text-primary" />,
  }
];

export default function Home() {
  const { t } = useLanguage();

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
              <p className="flex-grow text-muted-foreground">{t(feature.descriptionKey)}</p>
              <Link href={feature.href}>
                <Button variant="outline" className="w-full mt-4">
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
