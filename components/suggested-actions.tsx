'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo, useEffect } from 'react';
import { UseChatHelpers } from '@ai-sdk/react';
import { useSearchParams } from 'next/navigation';
import { customRoles } from '@/lib/topics/custom-roles';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');

  // Auto-invoke append if valid topic exists
  useEffect(() => {
    const topicConfig = customRoles[topic as keyof typeof customRoles];

    const topicAction = `${topicConfig?.topic} lollichat-custom-role-assumption:${topic}`;
    if (topic && topicConfig) {
      window.history.replaceState({}, '', `/chat/${chatId}`);
      append({
        role: 'user',
        content: topicAction,
      });
    }
  }, [topic, chatId, append]);

  const suggestedActions = [
    {
      title: 'Hi Lolli! Tell me',
      label: 'what makes you unique?',
      action: 'Hi Lolli! Tell me what makes you unique?',
    },
    {
      title: "What's the weather like",
      label: 'in New York?',
      action: "What's the current weather like in New York?",
    },
    {
      title: 'Help me write',
      label: 'about democracy',
      action:
        'Help me write an essay about democracy, its core principles, and its importance in modern society. Provide a summary of what you wrote.',
    },
    {
      title: "I'd love to learn",
      label: 'a new skill today',
      action:
        "I'd love to learn a new practical skill today. What do you suggest?",
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
