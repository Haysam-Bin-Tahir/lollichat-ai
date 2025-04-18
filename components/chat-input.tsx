'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SendIcon, PlusIcon, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  chatId?: string;
  isDisabled?: boolean;
  onSubmit?: (value: string) => Promise<void>;
}

export function ChatInput({ chatId, isDisabled, onSubmit }: ChatInputProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState('');

  // Determine if input should be disabled

  const handleSubmit = async () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    setValue('');

    if (chatId) {
      // Existing chat
      if (onSubmit) {
        await onSubmit(trimmedValue);
      }
    } else {
      // New chat
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full px-2 sm:px-4">
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden rounded-lg border bg-background px-2 sm:px-3">
        <div className="flex justify-between py-2">
          <div className="flex items-center">
            {!chatId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <PlusIcon className="h-5 w-5" />
                    <span className="sr-only">Add</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Coming soon</TooltipContent>
              </Tooltip>
            )}
          </div>
          <div>
            <Button type="submit" size="icon" onClick={handleSubmit}>
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SendIcon className="h-5 w-5" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
