import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import './globals.css';
import { TextToSpeechProvider } from '@/hooks/use-text-to-speech';
import Link from 'next/link';
import { SparklesIcon as LucideSparkles } from 'lucide-react';
import { ClientPathCheck } from '@/components/client-path-check';

export const metadata: Metadata = {
  metadataBase: new URL('https://chat.vercel.ai'),
  title: 'Lollichat - Your AI companion',
  description:
    'Lollichat is your AI companion, here to chat about anything and everything.',
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)';
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)';
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // We'll use a different approach to determine the current path
  // This will be handled client-side with a ClientPathCheck component
  
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Winky+Sans:ital,wght@0,300..900;1,300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TextToSpeechProvider>
              <ClientPathCheck />
              <Toaster position="top-center" />
              {children}
              
              {/* Footer */}
              <footer className="bg-background border-t border-border py-6">
                <div className="container mx-auto px-4">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                      <LucideSparkles size={20} className="text-primary" />
                      <span className="ml-2 font-bold text-foreground">Lollichat</span>
                    </div>
                    <div className="flex space-x-6">
                      <Link href="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">
                        Terms of Service
                      </Link>
                      <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                        Privacy Policy
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-muted-foreground text-sm">
                    &copy; {new Date().getFullYear()} Lollichat. All rights reserved.
                  </div>
                </div>
              </footer>
            </TextToSpeechProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
