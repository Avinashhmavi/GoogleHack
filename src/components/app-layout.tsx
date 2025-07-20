"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  GraduationCap,
  Languages,
  QrCode,
  ScanLine,
  LayoutDashboard,
  BarChart3,
  BookOpen,
  FileQuestion,
  ClipboardCheck,
  Edit,
  Users,
  UserCog,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { LanguageSelector } from './language-selector';

const menuItems = [
  { href: '/', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/photo-to-worksheet', labelKey: 'photoToWorksheet', icon: ScanLine },
  { href: '/multi-language-content', labelKey: 'multiLanguageContent', icon: Languages },
  { href: '/content-adaptation', labelKey: 'contentAdaptation', icon: GraduationCap },
  { href: '/qr-code-generator', labelKey: 'qrCodeGenerator', icon: QrCode },
  { href: '/grade-tracking', labelKey: 'gradeTracking', icon: BarChart3 },
  { href: '/quiz-generator', labelKey: 'quizGenerator', icon: FileQuestion },
  { href: '/rubric-creator', labelKey: 'rubricCreator', icon: ClipboardCheck },
  { href: '/writing-assistant', labelKey: 'writingAssistant', icon: Edit },
  { href: '/attendance', labelKey: 'attendance', icon: Users },
  { href: '/student-roster', labelKey: 'studentRoster', icon: UserCog },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold font-headline">{t('appName')}</h2>
              <p className="text-sm text-muted-foreground">{t('appDescription')}</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={t(item.labelKey)}
                  >
                    <div>
                      <item.icon />
                      <span>{t(item.labelKey)}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b no-print md:justify-end">
            <div className="md:hidden">
                <SidebarTrigger />
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
            </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
