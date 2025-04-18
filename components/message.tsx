'use client';

import type { UIMessage } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState, useCallback, useRef, useEffect } from 'react';
import type { Vote } from '@/lib/db/schema';
import { DocumentToolCall, DocumentToolResult } from './document';
import { PencilEditIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import equal from 'fast-deep-equal';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';
import { DocumentPreview } from './document-preview';
import { MessageReasoning } from './message-reasoning';
import { UseChatHelpers } from '@ai-sdk/react';
import { LucideProps } from 'lucide-react';
import { SparklesIcon as LucideSparkles } from 'lucide-react';
import { customRoles } from '@/lib/topics/custom-roles';
import Image from 'next/image';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';

const SparklesIcon = ({ className, ...props }: LucideProps) => {
  return <LucideSparkles className={cn(className)} {...props} />;
};

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: UIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const messageRef = useRef<string>('');
  const lastLengthRef = useRef<number>(0);
  const pendingTextRef = useRef<string>('');
  const speakingRef = useRef<boolean>(false);
  const { speak, selectedVoice } = useTextToSpeech();

  const getMessageText = useCallback((message: UIMessage) => {
    return message.parts
      .filter((part) => part.type === 'text')
      .map((part) => (part as any).text)
      .join(' ');
  }, []);

  const speakNextSentence = useCallback(() => {
    if (!pendingTextRef.current || speakingRef.current) return;

    const match = pendingTextRef.current.match(/^[^.!?]+[.!?]+/);
    if (match) {
      speakingRef.current = true;
      const sentence = match[0];
      pendingTextRef.current = pendingTextRef.current
        .slice(sentence.length)
        .trim();

      speak(sentence, false, () => {
        speakingRef.current = false;
        speakNextSentence(); // Try to speak next sentence after current one finishes
      });
    }
  }, [speak]);

  // Auto-play effect for new messages
  useEffect(() => {
    if (message.role === 'assistant' && selectedVoice) {
      const text = getMessageText(message);
      const isGoogleVoice = selectedVoice.name.startsWith('Google');

      if (isGoogleVoice && !isLoading) {
        // For Google voices, wait for complete message
        if (text !== messageRef.current) {
          messageRef.current = text;
          speak(text);
        }
      } else if (!isGoogleVoice) {
        // For local voices, queue new text as it arrives
        const currentLength = text.length;
        if (currentLength > lastLengthRef.current) {
          const newText = text.slice(lastLengthRef.current);
          pendingTextRef.current += newText;
          lastLengthRef.current = currentLength;

          // Try to speak next sentence if not already speaking
          if (!speakingRef.current) {
            speakNextSentence();
          }
        }
      }
    } else {
      // Reset refs when voice is turned off
      messageRef.current = '';
      lastLengthRef.current = 0;
      pendingTextRef.current = '';
      speakingRef.current = false;
    }
  }, [
    message,
    isLoading,
    speak,
    getMessageText,
    selectedVoice,
    speakNextSentence,
  ]);

  // Reset refs when message changes
  useEffect(() => {
    messageRef.current = '';
    lastLengthRef.current = 0;
    pendingTextRef.current = '';
    speakingRef.current = false;
  }, [message.id]);

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          {message.role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 w-full winky-sans-regular text-[22px]">
            {message.experimental_attachments && (
              <div
                data-testid={`message-attachments`}
                className="flex flex-row justify-end gap-2"
              >
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === 'reasoning') {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={part.reasoning}
                  />
                );
              }

              if (type === 'text') {
                if (mode === 'view') {
                  if (part.text?.includes('lollichat-custom-role-assumption')) {
                    const topicCode = part.text
                      .split('lollichat-custom-role-assumption:')[1]
                      ?.split('|')[0];
                    const topic =
                      customRoles[topicCode as keyof typeof customRoles]
                        ?.topic || '';
                    const img =
                      customRoles[topicCode as keyof typeof customRoles]?.img ||
                      '';
                    return (
                      <div
                        key={key}
                        className="w-full min-w-[280px] sm:min-w-[400px] md:min-w-[500px] max-w-xl mx-auto overflow-hidden bg-white dark:bg-zinc-900 rounded-xl shadow-xl transform transition-all hover:scale-[1.02] border border-indigo-100 dark:border-indigo-900/30"
                      >
                        <div className="relative h-40 sm:h-52 md:h-64 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-90" />
                          <Image
                            src={`/images/topics/${img}`}
                            alt="Topic Background"
                            fill
                            sizes="(max-width: 768px) 280px, (max-width: 1200px) 500px"
                            className="object-cover"
                            priority
                            loading="eager"
                          />
                          <SparklesIcon
                            className="absolute top-1 left-1 text-white/80"
                            size={24}
                          />
                        </div>
                        <div className="p-3 sm:p-4 md:p-6">
                          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold winky-sans-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {topic}
                          </h3>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      {message.role === 'user' && !isReadonly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode('edit');
                              }}
                            >
                              <PencilEditIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      )}

                      <div
                        data-testid="message-content"
                        className={cn('flex flex-col gap-4', {
                          'bg-indigo-50 text-indigo-900 dark:bg-indigo-900/20 dark:text-indigo-100 px-3 py-2 rounded-xl':
                            message.role === 'user',
                        })}
                      >
                        <Markdown>{part.text}</Markdown>
                      </div>
                    </div>
                  );
                }

                if (mode === 'edit') {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      <div className="size-8" />

                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        reload={reload}
                      />
                    </div>
                  );
                }
              }

              if (type === 'tool-invocation') {
                const { toolInvocation } = part;
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === 'call') {
                  const { args } = toolInvocation;

                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: ['getWeather'].includes(toolName),
                      })}
                    >
                      {toolName === 'getWeather' ? (
                        <Weather />
                      ) : toolName === 'createDocument' ? (
                        <DocumentPreview isReadonly={isReadonly} args={args} />
                      ) : toolName === 'updateDocument' ? (
                        <DocumentToolCall
                          type="update"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'requestSuggestions' ? (
                        <DocumentToolCall
                          type="request-suggestions"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : null}
                    </div>
                  );
                }

                if (state === 'result') {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      {toolName === 'getWeather' ? (
                        <Weather weatherAtLocation={result} />
                      ) : toolName === 'createDocument' ? (
                        <DocumentPreview
                          isReadonly={isReadonly}
                          result={result}
                        />
                      ) : toolName === 'updateDocument' ? (
                        <DocumentToolResult
                          type="update"
                          result={result}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'requestSuggestions' ? (
                        <DocumentToolResult
                          type="request-suggestions"
                          result={result}
                          isReadonly={isReadonly}
                        />
                      ) : (
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                      )}
                    </div>
                  );
                }
              }
            })}

            <MessageActions
              key={`action-${message.id}`}
              chatId={chatId}
              message={message}
              vote={vote}
              isLoading={isLoading}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Hmm...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
