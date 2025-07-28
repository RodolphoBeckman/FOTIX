import { MainLayout } from '@/app/main-layout';

export default function ImageEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
