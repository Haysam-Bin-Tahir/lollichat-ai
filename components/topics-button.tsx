import type { ComponentProps } from 'react';

import { type SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Button } from './ui/button';
import { LucideSparkles } from 'lucide-react';
import { useRouter } from 'next/dist/client/components/navigation';

export function TopicsButton({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const router = useRouter();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={() => {
            router.push('/topics');
            router.refresh();
          }}
          variant="outline"
          className="md:px-2 md:h-fit"
        >
          <LucideSparkles size={40} className="text-primary" />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start">Explore Topics</TooltipContent>
    </Tooltip>
  );
}
