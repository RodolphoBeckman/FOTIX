'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';

export default function Home() {
  const router = useRouter();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/image-editor');
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="animate-fade-in-out">
        <Logo className="h-24 w-24" />
      </div>
    </div>
  );
}
