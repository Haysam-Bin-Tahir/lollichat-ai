import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideProps } from 'lucide-react';
import { SparklesIcon as LucideSparkles } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { customRoles } from '@/lib/topics/custom-roles';

const SparklesIcon = ({ className, ...props }: LucideProps) => {
  return <LucideSparkles className={cn(className)} {...props} />;
};

export const Overview = () => {
  const topic = useSearchParams().get('topic');
  const topicConfig = customRoles[topic as keyof typeof customRoles];

  return topicConfig ? null : (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-16"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-8 flex flex-col gap-10 leading-relaxed text-center max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-8">
          <div className="size-20 rounded-full bg-indigo-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
            <SparklesIcon
              size={36}
              fill="currentColor"
              className="text-primary group-hover:scale-110 transition-transform duration-200"
            />
          </div>
          <h1 className="winky-sans-heading text-4xl md:text-5xl">
            Hi there! 👋 I&apos;m{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-300">
              Lolli
            </span>
          </h1>
        </div>

        <div className="space-y-6 winky-sans-regular text-2xl text-muted-foreground">
          <p>
            I&apos;m your friendly AI companion, here to chat about anything and
            everything! Whether you need help with a task, want to brainstorm
            ideas, or just feel like having a fun conversation, I&apos;m all
            ears.
          </p>
          <p>What would you like to talk about today? 💭</p>
        </div>
      </div>
    </motion.div>
  );
};
