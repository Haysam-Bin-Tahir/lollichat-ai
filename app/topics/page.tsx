'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { customRoles } from '@/lib/topics/custom-roles';
import { cn } from '@/lib/utils';
import { SparklesIcon as LucideSparkles } from 'lucide-react';
import { PlusIcon } from 'lucide-react';

// Grid configuration for different sized tiles
const gridConfig = {
  // Row 1
  FL: 'col-span-1 row-span-1', // Regular tile after Boundary Setting
  RA: 'col-span-2 row-span-2', // Large tile
  LM: 'col-span-1 row-span-2', // Tall tile
  PH: 'col-span-1 row-span-2', // Tall tile
  //   // Row 2 (continues tall tiles)
  //   // Row 3
  //   DB: 'col-span-2 row-span-1', // Wide tile
  //   MM: 'col-span-1 row-span-1',
  //   AI: 'col-span-1 row-span-1',
  //   // Row 4
  //   KA: 'col-span-2 row-span-1', // Wide tile
  //   SC: 'col-span-1 row-span-1',
  //   CT: 'col-span-1 row-span-1',
  //   // Row 5
  //   SL: 'col-span-2 row-span-1', // Wide tile
  //   BN: 'col-span-1 row-span-1',
  //   // Row 6
  //   MN: 'col-span-2 row-span-1', // Wide tile
  //   PR: 'col-span-1 row-span-1',
  //   CR: 'col-span-1 row-span-1',
  //   FF: 'col-span-1 row-span-1',
  // Row 7 (if needed)
  AX: 'col-span-1 row-span-2', // Tall tile at end
};

export default function TopicsPage() {
  return (
    <div className="min-h-dvh bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col items-center gap-4 mb-12">
          <LucideSparkles size={40} className="text-primary" />
          <h1 className="text-3xl md:text-5xl font-bold winky-sans-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Topic
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground winky-sans-regular text-center max-w-2xl">
            Select a topic to start a focused conversation with Lolli
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="group relative overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-0.5 duration-300"
          >
            <Link
              href="/"
              className="absolute inset-0 z-10 p-6 md:p-8 flex flex-col items-center justify-center text-center gap-2 transition-opacity duration-300"
            >
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                <PlusIcon className="size-6 text-primary" />
              </div>
              <h2 className="text-lg md:text-2xl lg:text-3xl font-bold winky-sans-bold text-foreground">
                New Chat
              </h2>
              <p className="text-sm text-muted-foreground">
                Start a conversation without a topic
              </p>
            </Link>
          </motion.div>

          {Object.entries(customRoles).map(([key, role]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'group relative overflow-hidden rounded-xl border border-border transition-all hover:border-primary/50',
                'min-h-[120px] md:min-h-[200px]',
                'w-full h-full',
                gridConfig[key as keyof typeof gridConfig],
              )}
            >
              <Link
                href={`/?topic=${key}`}
                className="absolute inset-0 z-10 p-3 md:p-6 flex flex-col justify-between transition-opacity duration-300"
              >
                <div className="flex justify-end" />
                <h2 className="text-lg md:text-2xl lg:text-3xl font-bold winky-sans-bold text-white [text-shadow:_0_2px_10px_rgb(0_0_0_/_80%)]">
                  {role.topic}
                </h2>
              </Link>

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div
                  style={{ transition: 'all .3s ease-out' }}
                  className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20"
                />
              </div>

              <div className="relative w-full h-full">
                <Image
                  src={`/images/topics/${role.img}`}
                  alt={role.topic}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="object-cover transition-all duration-300 group-hover:scale-105"
                  priority={key === 'RA' || key === 'LM' || key === 'PH'}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
