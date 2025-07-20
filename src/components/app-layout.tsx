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
} from 'lucide-react';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/photo-to-worksheet', label: 'Photo to Worksheet', icon: ScanLine },
  { href: '/multi-language-content', label: 'Multi-Language Content', icon: Languages },
  { href: '/content-adaptation', label: 'Content Adaptation', icon: GraduationCap },
  { href: '/qr-code-generator', label: 'QR Code Generator', icon: QrCode },
  { href: '/grade-tracking', label: 'Grade Tracking', icon: BarChart3 },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold font-headline">Sahayak AI</h2>
              <p className="text-sm text-muted-foreground">AI for Education</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <div>
                      <item.icon />
                      <span>{item.label}</span>
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
        </header>
        <main className="p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
