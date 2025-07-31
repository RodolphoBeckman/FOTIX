'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo(props: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Fotix Logo"
      width={32}
      height={32}
      className={cn("h-8 w-8", props.className)}
    />
  );
}
