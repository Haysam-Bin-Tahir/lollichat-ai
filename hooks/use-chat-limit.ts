'use client';

import { useSession } from 'next-auth/react';
import { useFeatureLimit } from './use-subscription';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import type { Chat } from '@/lib/db/schema';

export function useChatLimit() {
  const { data: session } = useSession();
  const { limit: chatHistoryLimit, isLoading: isLimitLoading } =
    useFeatureLimit('chat-history');

  const { data: history, isLoading: isHistoryLoading } = useSWR<Array<Chat>>(
    session?.user ? '/api/history' : null,
    fetcher,
    { fallbackData: [] },
  );

  const chatCount = history?.length || 0;
  const isLimitReached = chatCount >= chatHistoryLimit;
  const isLoading = isLimitLoading || isHistoryLoading;

  console.log('Subscription Info', {isLoading, chatCount, chatHistoryLimit, isLimitReached});

  return {
    chatCount,
    chatHistoryLimit,
    isLimitReached,
    isLoading,
    remainingChats: Math.max(0, chatHistoryLimit - chatCount),
  };
}
