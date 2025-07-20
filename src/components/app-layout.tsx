
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  SidebarFooter,
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
  BookText,
  MessageSquare,
  LogOut,
  Settings,
} from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { LanguageSelector } from './language-selector';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';

const menuItems = [
  { href: '/', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/photo-to-worksheet', labelKey: 'photoToWorksheet', icon: ScanLine },
  { href: '/content-creator', labelKey: 'contentCreator', icon: Languages },
  { href: '/content-adaptation', labelKey: 'contentAdaptation', icon: GraduationCap },
  { href: '/qr-code-generator', labelKey: 'qrCodeGenerator', icon: QrCode },
  { href: '/grade-tracking', labelKey: 'gradeTracking', icon: BarChart3 },
  { href: '/quiz-generator', labelKey: 'quizGenerator', icon: FileQuestion },
  { href: '/rubric-creator', labelKey: 'rubricCreator', icon: ClipboardCheck },
  { href: '/writing-assistant', labelKey: 'writingAssistant', icon: Edit },
  { href: '/attendance', labelKey: 'attendance', icon: Users },
  { href: '/student-roster', labelKey: 'studentRoster', icon: UserCog },
  { href: '/lesson-planner', labelKey: 'lessonPlanner', icon: BookText },
  { href: '/discussion-generator', labelKey: 'discussionGenerator', icon: MessageSquare },
];

const publicRoutes = ['/login', '/signup'];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  React.useEffect(() => {
    if (loading) return;

    const isAuthPage = publicRoutes.includes(pathname);

    if (!user && !isAuthPage) {
        router.push('/login');
    }
    if (user && isAuthPage) {
        router.push('/');
    }
  }, [user, loading, pathname, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const isAuthPage = publicRoutes.includes(pathname);
  
  if (isAuthPage) {
    return <main>{children}</main>;
  }

  if (loading || (!user && !isAuthPage)) {
     return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
        </div>
     );
  }

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
               {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                          <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.displayName || 'User'}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/account"><Settings className="mr-2" />Account</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              )}
            </div>
        </header>
        <main className="p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
