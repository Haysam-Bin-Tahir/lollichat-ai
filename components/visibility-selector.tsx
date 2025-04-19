'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import {
  CheckCircleFillIcon,
  ChevronDownIcon,
  GlobeIcon,
  LockIcon,
} from './icons';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useFeatureAccess } from '@/hooks/use-subscription';
import { AlertCircle } from 'lucide-react';

export type VisibilityType = 'private' | 'public';

const visibilities: Array<{
  id: VisibilityType;
  label: string;
  description: string;
  icon: ReactNode;
  requiresFeature?: string;
}> = [
  {
    id: 'private',
    label: 'Private',
    description: 'Only you can access this chat',
    icon: <LockIcon />,
  },
  {
    id: 'public',
    label: 'Public',
    description: 'Anyone with the link can access this chat',
    icon: <GlobeIcon />,
    requiresFeature: 'public-chats',
  },
];

export function VisibilitySelector({
  chatId,
  className,
  selectedVisibilityType,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const { hasAccess: canSharePublicly } = useFeatureAccess('public-chats');

  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId,
    initialVisibility: selectedVisibilityType,
  });

  const selectedVisibility = useMemo(
    () => visibilities.find((visibility) => visibility.id === visibilityType),
    [visibilityType],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          variant="outline"
          className="hidden md:flex md:px-2 md:h-[34px]"
        >
          {selectedVisibility?.icon}
          {selectedVisibility?.label}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[300px]">
        {visibilities.map((visibility) => {
          const isDisabled = visibility.requiresFeature && !canSharePublicly;

          return (
            <div key={visibility.id}>
              <DropdownMenuItem
                onSelect={() => {
                  if (!isDisabled) {
                    setVisibilityType(visibility.id);
                    setOpen(false);
                  }
                }}
                className={cn(
                  'gap-4 group/item flex flex-row justify-between items-center',
                  isDisabled && 'opacity-50 cursor-not-allowed',
                )}
                data-active={visibility.id === visibilityType}
                disabled={isDisabled || false}
              >
                <div className="flex flex-col gap-1 items-start">
                  {visibility.label}
                  {visibility.description && (
                    <div className="text-xs text-muted-foreground">
                      {visibility.description}
                    </div>
                  )}
                </div>
                <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                  <CheckCircleFillIcon />
                </div>
              </DropdownMenuItem>

              {isDisabled && visibility.id === 'public' && (
                <div className="px-2 py-1.5 text-xs text-amber-500 flex items-center gap-1.5 border-t border-border/50 mt-1 pt-2">
                  <AlertCircle size={14} />
                  <span>Requires Standard or Priority plan</span>
                </div>
              )}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
