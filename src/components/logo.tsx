import * as React from 'react';
import { cn } from '@/lib/utils';

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cn("h-8 w-8", props.className)}
    >
      <path
        d="M22.2857 0H9.71429C4.34921 0 0 4.34921 0 9.71429V22.2857C0 27.6508 4.34921 32 9.71429 32H22.2857C27.6508 32 32 27.6508 32 22.2857V9.71429C32 4.34921 27.6508 0 22.2857 0Z"
        fill="hsl(var(--primary))"
      />
      <path
        d="M21.4286 10.5714C18.2 10.5714 15.5714 13.2 15.5714 16.4286C15.5714 19.6571 18.2 22.2857 21.4286 22.2857C24.6571 22.2857 27.2857 19.6571 27.2857 16.4286C27.2857 13.2 24.6571 10.5714 21.4286 10.5714ZM21.4286 20C20.2 20 19.1429 18.9429 19.1429 17.7143C19.1429 16.4857 20.2 15.4286 21.4286 15.4286C22.6571 15.4286 23.7143 16.4857 23.7143 17.7143C23.7143 18.9429 22.6571 20 21.4286 20Z"
        fill="hsl(var(--primary-foreground))"
        fillOpacity="0.8"
      />
      <path
        d="M9.71429 10.5714H14.8571V13.4286H9.71429V10.5714Z"
        fill="hsl(var(--primary-foreground))"
      />
      <path
        d="M9.71429 15.1429H13.1429V18H9.71429V15.1429Z"
        fill="hsl(var(--primary-foreground))"
      />
      <path
        d="M9.71429 19.7143H14.8571V22.5714H9.71429V19.7143Z"
        fill="hsl(var(--primary-foreground))"
      />
    </svg>
  );
}
