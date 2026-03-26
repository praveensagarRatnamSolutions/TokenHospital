import { Geist, Geist_Mono, Roboto } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

import StoreProvider from '@/store/StoreProvider';
import QueryProvider from '@/store/QueryProvider';

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

export const metadata = {
  title: 'Hospital Token System',
  description: 'Manage hospital tokens efficiently',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
