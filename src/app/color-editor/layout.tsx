import { MainLayout } from '@/app/main-layout';

export default function ColorEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
