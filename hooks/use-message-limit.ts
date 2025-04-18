'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useFeatureAccess } from './use-subscription';

const FREE_MESSAGE_LIMIT = 5;

export function useMessageLimit(messageCount?: number) {
  const { data: session } = useSession();
  const { hasAccess: hasUnlimitedMessages, isLoading } =
    useFeatureAccess('unlimited-messages');

  // Calculate if limit is reached based on provided message count
  const isLimitReached =
    !hasUnlimitedMessages &&
    typeof messageCount === 'number' &&
    messageCount >= FREE_MESSAGE_LIMIT;

  return {
    messageCount,
    isLimitReached,
    hasUnlimitedMessages,
    isLoading,
    messageLimit: FREE_MESSAGE_LIMIT,
  };
}
