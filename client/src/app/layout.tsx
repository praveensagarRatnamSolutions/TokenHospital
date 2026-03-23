import { Geist, Geist_Mono, Roboto } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const fontRoboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
});

import StoreProvider from '@/store/StoreProvider';
import QueryProvider from '@/store/QueryProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        'antialiased',
        fontMono.variable,
        'font-sans',
        fontSans.variable,
        fontRoboto.variable,
      )}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StoreProvider>
          <QueryProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </QueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
