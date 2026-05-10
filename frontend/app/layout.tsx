import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Sarkari School — Government Jobs, Results, Admit Cards 2025',
    template: '%s | Sarkari School',
  },
  description: 'Sarkari School: Latest government job notifications, exam results, admit cards, answer keys from official sources. UPSC, SSC, RRB, IBPS, SBI and more.',
  keywords: ['sarkari naukri', 'government jobs', 'sarkari result', 'UPSC', 'SSC CGL', 'IBPS', 'RRB NTPC'],
  metadataBase: new URL('https://sarkarischool.in'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Sarkari School',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}` }} />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
