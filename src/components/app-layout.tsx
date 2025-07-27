
"use client";

import React, { useState, useEffect } from 'react';
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
import { LogOut, Settings, BookOpen, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { LanguageSelector } from './language-selector';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { menuCategories, type MenuCategory, type MenuItem } from '@/lib/menu-items';
import { Chatbot } from './chatbot/chatbot';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const MainSidebar = React.memo(function MainSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set(menuCategories.map(cat => cat.id)));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Find which category contains the current path
  const getCurrentCategory = (): string | null => {
    for (const category of menuCategories) {
      if (category.items.some(item => item.href === pathname)) {
        return category.id;
      }
    }
    return null;
  };

  // Keep all categories collapsed by default and preload all pages
  useEffect(() => {
    // Preload all pages for instant navigation
    const preloadPages = () => {
      menuCategories.forEach(category => {
        category.items.forEach(item => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = item.href;
          document.head.appendChild(link);
        });
      });
    };
    
    // Preload after a short delay to not block initial render
    const timer = setTimeout(preloadPages, 1000);
    return () => clearTimeout(timer);
  }, [pathname]);

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const renderMenuItem = (item: MenuItem, isSubItem = false) => {
    const isActive = pathname === item.href;
    return (
      <SidebarMenuItem key={item.href}>
        <Link 
          href={item.href} 
          prefetch={true}
          className="block group"
          onClick={() => {
            if (!isActive) {
              setIsNavigating(true);
              // Reset navigation state after a short delay
              setTimeout(() => setIsNavigating(false), 100);
            }
          }}
        >
          <SidebarMenuButton
            asChild
            isActive={isActive}
            tooltip={isCollapsed ? t(item.labelKey) : undefined}
            className={cn(
              "transition-all duration-300 w-full hover:shadow-sm hover:scale-[1.01]",
              isSubItem && "ml-4 pl-4 border-l-2 border-muted",
              isActive && isSubItem && "border-l-primary",
              isNavigating && !isActive && "opacity-75"
            )}
          >
            <div className={cn(
              "flex items-center gap-3 w-full",
              isSubItem && "text-sm"
            )}>
              <item.icon className={cn(
                "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                isSubItem ? "w-4 h-4" : "w-5 h-5"
              )} />
              {!isCollapsed && (
                <span>
                  {t(item.labelKey)}
                </span>
              )}
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    );
  };

  const renderCategory = (category: MenuCategory) => {
    const isCollapsedCategory = collapsedCategories.has(category.id);
    const hasActiveItem = category.items.some(item => item.href === pathname);
    const isCurrentCategory = getCurrentCategory() === category.id;

    return (
      <div 
        key={category.id} 
        className="space-y-1 group"
        onMouseEnter={() => {
          setCollapsedCategories(prev => {
            const newSet = new Set(prev);
            newSet.delete(category.id);
            return newSet;
          });
        }}
        onMouseLeave={() => {
          setCollapsedCategories(prev => {
            const newSet = new Set(prev);
            newSet.add(category.id);
            return newSet;
          });
        }}
      >
        {/* Category Header */}
        <div
          className={cn(
            "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all duration-300 hover:bg-accent hover:shadow-md hover:scale-[1.02]",
            isCurrentCategory && "bg-accent/50 shadow-sm",
            isCollapsed && "justify-center"
          )}
          onClick={() => toggleCategory(category.id)}
        >
                      <div className="flex items-center gap-3">
              <category.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {!isCollapsed && (
                <span className="font-medium text-sm uppercase tracking-wide">
                  {t(category.labelKey)}
                </span>
              )}
            </div>
          {!isCollapsed && (
            <div className={cn(
              "transition-all duration-300",
              isCollapsedCategory ? "rotate-0 opacity-50" : "rotate-180 opacity-100"
            )}>
              <ChevronDown className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Category Items */}
        <div className={cn(
          "space-y-1 transition-all duration-500 ease-in-out overflow-hidden",
          isCollapsed && "ml-2",
          isCollapsedCategory && !isCollapsed ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
        )}>
          {category.items.map(item => renderMenuItem(item, true))}
        </div>
      </div>
    );
  };

  return (
    <Sidebar 
      variant="floating" 
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center justify-center">
          <Image 
            src="/image.png" 
            alt="Sahayak AI" 
            width={300} 
            height={80} 
            className="h-17 w-auto object-contain rounded-lg"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarMenu className="space-y-2 p-2">
          {menuCategories.map(renderCategory)}
        </SidebarMenu>
      </SidebarContent>

      {/* Profile Section */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'Teacher'} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user?.displayName?.charAt(0)?.toUpperCase() || 'T'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.displayName || 'Teacher'}</p>
              <p className="text-xs text-muted-foreground">Teacher</p>
            </div>
          )}
          {!isCollapsed && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName || 'Teacher'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <Settings className="mr-2 h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => auth && signOut(auth)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </Sidebar>
  );
});

function Header() {
    const { user } = useAuth();
    const pathname = usePathname();
    const isGetStartedPage = pathname === '/';
    
    return (
        <header className="flex items-center justify-between p-4 border-b no-print relative">
            {/* Mobile sidebar trigger - positioned absolutely on left */}
            <div className="md:hidden absolute left-4">
                <SidebarTrigger />
            </div>
            
            {/* Center Sahayak AI title */}
            {!isGetStartedPage && (
                <div className="flex-1 flex justify-center">
                    <h1 className="text-2xl md:text-4xl font-black tracking-tight text-primary font-sans uppercase select-none drop-shadow-sm">
                        SAHAYAK AI
                    </h1>
                </div>
            )}
            
            {/* Right side controls */}
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
                        <DropdownMenuItem onClick={() => auth && signOut(auth)}>
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
