import { Logo } from '@/components/logo';

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Logo className="h-16 w-16 animate-logo-pulse" />
    </div>
  );
}
