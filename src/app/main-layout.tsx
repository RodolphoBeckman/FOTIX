'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/logo';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo />
            <h1 className="font-headline text-xl font-bold tracking-tight">FashionAI Toolkit</h1>
          </Link>
          <Tabs value={pathname} className="hidden md:block">
            <TabsList>
              <TabsTrigger value="/image-editor" asChild>
                <Link href="/image-editor">Editor de Imagem</Link>
              </TabsTrigger>
              <TabsTrigger value="/color-editor" asChild>
                <Link href="/color-editor">Editor de Cores</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
    </div>
  );
}
