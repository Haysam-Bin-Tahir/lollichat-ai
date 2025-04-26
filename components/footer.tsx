'use client';

import Link from 'next/link';
import { SparklesIcon as LucideSparkles } from 'lucide-react';
import { useLayout } from './layout-context';

export function Footer() {
  const { showHeaderAndFooter } = useLayout();
  
  if (!showHeaderAndFooter) return null;

  return (
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
  );
} 