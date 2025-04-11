'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { customRoles } from '@/lib/topics/custom-roles';
import { cn } from '@/lib/utils';
import { SparklesIcon } from '@/components/icons';

// Grid configuration for different sized tiles
const gridConfig = {
  FF: 'col-span-1 row-span-1',
  RA: 'col-span-2 row-span-2',
  LM: 'col-span-1 row-span-2',
  AI: 'col-span-1 row-span-1',
  DB: 'col-span-2 row-span-1',
  SC: 'col-span-1 row-span-1',
  PH: 'col-span-1 row-span-2',
  MM: 'col-span-1 row-span-1',
  KA: 'col-span-2 row-span-1',
  CT: 'col-span-1 row-span-1',
  BN: 'col-span-1 row-span-1',
  SL: 'col-span-2 row-span-1',
  AX: 'col-span-1 row-span-2',
  PR: 'col-span-1 row-span-1',
  MN: 'col-span-2 row-span-1',
  CR: 'col-span-1 row-span-1',
};

export default function TopicsPage() {
  return (
    <div className="min-h-dvh bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col items-center gap-4 mb-12">
          <SparklesIcon size={40} className="text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold winky-sans-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Topic
          </h1>
          <p className="text-xl text-muted-foreground winky-sans-regular text-center max-w-2xl">
            Select a topic to start a focused conversation with Lolli
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(customRoles).map(([key, role]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'group relative overflow-hidden rounded-xl border border-border transition-all hover:border-primary/50',
                gridConfig[key as keyof typeof gridConfig],
              )}
            >
              <Link
                href={`/chat?topic=${key}`}
                className="absolute inset-0 z-10"
              >
                <span className="sr-only">{role.topic}</span>
              </Link>

              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/60 group-hover:via-background/30 group-hover:to-background/70 transition-all duration-300" />

              <img
                src={`/images/topics/${role.img}`}
                alt={role.topic}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="text-xl font-bold winky-sans-bold text-white drop-shadow-sm group-hover:text-primary transition-colors">
                  {role.topic}
                </h2>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
