import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Playfair_Display as Playfair, PT_Sans as PTSans } from 'next/font/google';

const playfair = Playfair({ 
  subsets: ['latin'], 
  variable: '--font-playfair' 
});

const ptSans = PTSans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'Fotix',
  description: 'Kit de ferramentas com IA para criação de conteúdo de e-commerce de moda.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={`${playfair.variable} ${ptSans.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FF7F50" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
