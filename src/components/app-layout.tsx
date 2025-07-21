
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
import { LogOut, Settings, BookOpen } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { LanguageSelector } from './language-selector';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { menuItems } from '@/lib/menu-items';
import { Chatbot } from './chatbot/chatbot';

const MainSidebar = React.memo(function MainSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  
  return (
    <Sidebar variant="floating" collapsible="icon">
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
              <Link href={item.href} prefetch={true}>
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
  );
});

function Header() {
    const { user } = useAuth();
    return (
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
                        <DropdownMenuItem onClick={() => signOut(auth)}>
                            <LogOut className="mr-2" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              )}
            </div>
        </header>
    )
}

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <MainSidebar />
            <SidebarInset>
                <Header />
                <main className="p-4 md:p-6 lg:p-8">
                    {children}
                </main>
                <Chatbot />
            </SidebarInset>
        </SidebarProvider>
    )
}
