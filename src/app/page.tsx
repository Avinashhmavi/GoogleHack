import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart3, GraduationCap, Languages, QrCode, ScanLine } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: 'Photo to Worksheet',
    description: 'Convert textbook pages into interactive worksheets instantly.',
    href: '/photo-to-worksheet',
    icon: <ScanLine className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Multi-Language Content',
    description: 'Generate educational materials in a variety of languages.',
    href: '/multi-language-content',
    icon: <Languages className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Content Adaptation',
    description: 'Adjust text to be suitable for different grade levels.',
    href: '/content-adaptation',
    icon: <GraduationCap className="w-8 h-8 text-primary" />,
  },
  {
    title: 'QR Code Generator',
    description: 'Create QR codes for answer keys and other resources.',
    href: '/qr-code-generator',
    icon: <QrCode className="w-8 h-8 text-primary" />,
  },
  {
    title: 'Grade Tracking',
    description: 'Monitor student progress and generate reports.',
    href: '/grade-tracking',
    icon: <BarChart3 className="w-8 h-8 text-primary" />,
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline text-primary">
          Welcome to Sahayak AI
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your AI-powered assistant for creating engaging educational content.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center gap-4">
                {feature.icon}
                <CardTitle className="font-headline">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <p className="flex-grow text-muted-foreground">{feature.description}</p>
              <Link href={feature.href} className="mt-4">
                <Button variant="outline" className="w-full">
                  Go to feature <ArrowRight className="ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
