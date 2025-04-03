import { motion } from 'framer-motion';
import Link from 'next/link';

import { MessageIcon } from './icons';

export const Overview = () => {
  return (
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
          <div className="size-20 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
            <MessageIcon size={40} />
          </div>
          <h1 className="winky-sans-heading text-4xl md:text-5xl">
            Hi there! 👋 I'm Lolli
          </h1>
        </div>
        
        <div className="space-y-6 winky-sans-regular text-xl text-muted-foreground">
          <p>
            I'm your friendly AI companion, here to chat about anything and everything! 
            Whether you need help with a task, want to brainstorm ideas, or just feel 
            like having a fun conversation, I'm all ears.
          </p>
          <p>
            What would you like to talk about today? 💭
          </p>
        </div>
      </div>
    </motion.div>
  );
};
