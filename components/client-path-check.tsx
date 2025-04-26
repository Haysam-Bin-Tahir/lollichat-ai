'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SparklesIcon as LucideSparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ClientPathCheck() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Only show header on these specific paths
  const showHeader = ['/topics', '/privacy-policy', '/terms-of-service'].includes(pathname);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  if (!showHeader) return null;
  
  return (
    <>
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="flex flex-row gap-3 items-center">
            <LucideSparkles
              size={24}
              fill="currentColor"
              className="text-primary group-hover:scale-110 transition-transform duration-200"
            />
            <span className="winky-sans-bold text-3xl tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-300">
              Lollichat
            </span>
          </Link>
        </div>
      </header>
      <style jsx global>{`
        main {
          min-height: calc(100vh - 132px);
        }
      `}</style>
    </>
  );
} 