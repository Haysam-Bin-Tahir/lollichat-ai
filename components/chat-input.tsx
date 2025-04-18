'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SendIcon, PlusIcon, Loader2 } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { createChat } from '@/app/(chat)/actions';
import { useMessageLimit } from '@/hooks/use-message-limit';
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
  const { isLimitReached, incrementMessageCount, hasUnlimitedMessages } =
    useMessageLimit();

  // Determine if input should be disabled
  const inputDisabled =
    isDisabled || isPending || (isLimitReached && !hasUnlimitedMessages);

  const handleSubmit = async () => {
    if (inputDisabled) return;

    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    setValue('');

    if (chatId) {
      // Existing chat
      if (onSubmit) {
        await onSubmit(trimmedValue);
        incrementMessageCount();
      }
    } else {
      // New chat
      startTransition(async () => {
        const newChatId = await createChat(trimmedValue);
        incrementMessageCount();
        router.push(`/chat/${newChatId}`);
      });
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
        {isLimitReached && !hasUnlimitedMessages ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/95 z-10 px-4">
            <div className="text-center">
              <p className="text-sm font-medium mb-2">
                You've reached the free message limit
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Upgrade to a paid plan to send unlimited messages
              </p>
              <Button asChild size="sm">
                <a href="/plans">View Plans</a>
              </Button>
            </div>
          </div>
        ) : null}

        <TextareaAutosize
          ref={textareaRef}
          tabIndex={0}
          placeholder="Send a message..."
          className={cn(
            'min-h-[60px] w-full resize-none bg-transparent px-0 py-3 focus-within:outline-none sm:text-sm',
            inputDisabled && 'opacity-50 cursor-not-allowed',
          )}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={inputDisabled}
          rows={1}
        />
        <div className="flex justify-between py-2">
          <div className="flex items-center">
            {!chatId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={inputDisabled}
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span className="sr-only">Add</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Coming soon</TooltipContent>
              </Tooltip>
            )}
          </div>
          <div>
            <Button
              type="submit"
              size="icon"
              disabled={inputDisabled || value.trim().length === 0}
              onClick={handleSubmit}
            >
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
