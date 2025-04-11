'use client';

import { ReactNode, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { VolumeIcon, Volume2Icon, VolumeXIcon } from 'lucide-react';
import { CheckCircleFillIcon, ChevronDownIcon } from './icons';
import { useTextToSpeech } from '@/hooks/use-text-to-speech';

interface VoiceOption {
  id: string;
  label: string;
  description?: string;
  icon: ReactNode;
}

export function VoiceSelector({
  className,
}: React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const { voices, selectedVoice, setSelectedVoice, stop } = useTextToSpeech();

  const voiceOptions = useMemo(() => {
    // Filter for specific voices
    const allowedVoices = ['Samantha', 'Aaron', 'Arthur', 'Daniel'];

    // Map of original names to display names (keeping for future use)
    const displayNames: Record<string, string> = {
      // 'Google US English': 'US Female (Pro)',
      // 'Google UK English Female': 'UK Female (Pro)',
      // 'Google UK English Male': 'UK Male (Pro)',
    };

    // Filter and deduplicate voices
    const filteredVoices = Array.from(
      new Map(
        voices
          .filter(
            (voice) =>
              allowedVoices.includes(voice.name) &&
              (voice.lang.startsWith('en-US') ||
                voice.lang.startsWith('en-GB')),
          )
          .map((voice) => [voice.name, voice]),
      ).values(),
    );

    const options: VoiceOption[] = [
      {
        id: 'off',
        label: 'Text-to-Speech Off',
        description: 'Disable voice transcription',
        icon: <VolumeXIcon className="h-4 w-4" />,
      },
      // Show "Turn On" option if we have no filtered voices but either have a selected voice or available voices
      ...(filteredVoices.length === 0 && (selectedVoice || voices.length > 0)
        ? [
            {
              id: 'on',
              label: 'Text-to-Speech On',
              description: selectedVoice
                ? `Using ${selectedVoice.name}`
                : 'Enable voice transcription',
              icon: <Volume2Icon className="h-4 w-4" />,
            },
          ]
        : filteredVoices.map((voice) => ({
            id: voice.name,
            label: displayNames[voice.name] || voice.name,
            description: `${voice.lang} ${voice.localService ? '(Local)' : '(Remote)'}`,
            icon: <Volume2Icon className="h-4 w-4" />,
          }))),
    ];
    return options;
  }, [voices, selectedVoice]);

  const selectedOption = useMemo(
    () =>
      voiceOptions.find(
        (option) =>
          option.id ===
          (selectedVoice
            ? option.id === 'on'
              ? 'on'
              : selectedVoice.name
            : 'off'),
      ) ?? voiceOptions[0],
    [voiceOptions, selectedVoice],
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
          className="flex px-2 h-[40px] sm:h-[34px] gap-2"
        >
          {selectedOption.icon}
          <span className="hidden md:inline">{selectedOption.label}</span>
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-[300px] max-h-[300px] overflow-y-auto"
      >
        {voiceOptions.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onSelect={() => {
              if (option.id === 'off') {
                stop();
                setSelectedVoice(null);
              } else if (option.id === 'on') {
                stop();
                // If we have a selected voice, use it
                if (selectedVoice) {
                  setSelectedVoice(selectedVoice);
                }
                // Otherwise try to find a suitable voice from available voices
                else if (voices.length > 0) {
                  const voice = voices.find(
                    (v) =>
                      v.lang.startsWith('en-US') || v.lang.startsWith('en-GB'),
                  );
                  if (voice) setSelectedVoice(voice);
                }
              } else {
                stop();
                const voice = voices.find((v) => v.name === option.id);
                if (voice) setSelectedVoice(voice);
              }
              setOpen(false);
            }}
            className="gap-4 group/item flex flex-row justify-between items-center"
            data-active={option.id === selectedOption.id}
          >
            <div className="flex flex-col gap-1 items-start">
              <div className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </div>
              {option.description && (
                <div className="text-xs text-muted-foreground pl-6">
                  {option.description}
                </div>
              )}
            </div>
            <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
              <CheckCircleFillIcon />
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
