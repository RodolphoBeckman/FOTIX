'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarContent
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Image, Palette, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/image-editor',
      label: 'Editor de Imagem',
      icon: Image,
    },
    {
      href: '/color-editor',
      label: 'Editor de Cores',
      icon: Palette,
    }
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
            <div className="flex items-center gap-3 p-2">
                <Logo />
                <h1 className="font-headline text-xl font-bold tracking-tight text-sidebar-foreground">
                    FashionAI
                </h1>
            </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                        <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                            <item.icon />
                            <span>{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
            <div className="container flex h-14 items-center">
                <div className="flex items-center gap-4">
                    <SidebarTrigger>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <PanelLeft />
                        </Button>
                    </SidebarTrigger>
                    <Link href="/" className="flex items-center gap-2">
                        <Logo />
                         <h1 className="font-headline text-xl font-bold tracking-tight">
                            FashionAI
                        </h1>
                    </Link>
                </div>
            </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t py-6 md:px-8 md:py-0">
          <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground">
              Construído com Next.js, Genkit e ShadCN UI.
            </p>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
