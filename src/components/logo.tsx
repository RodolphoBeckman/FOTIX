import * as React from 'react';

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
        <path d="M22.2857 0H9.71429C4.34921 0 0 4.34921 0 9.71429V22.2857C0 27.6508 4.34921 32 9.71429 32H22.2857C27.6508 32 32 27.6508 32 22.2857V9.71429C32 4.34921 27.6508 0 22.2857 0Z" fill="hsl(var(--primary))"/>
        <path d="M16.4286 10.5714C13.2 10.5714 10.5714 13.2 10.5714 16.4286V21.4286H16.4286C19.6571 21.4286 22.2857 18.8 22.2857 15.5714V10.5714H16.4286Z" fill="hsl(var(--primary-foreground))" fillOpacity="0.8"/>
        <path d="M15.5714 21.4286C18.8 21.4286 21.4286 18.8 21.4286 15.5714V10.5714H15.5714C12.3429 10.5714 9.71429 13.2 9.71429 16.4286V21.4286H15.5714Z" fill="hsl(var(--primary-foreground))"/>
    </svg>
  );
}
