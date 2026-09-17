'use client';

import { MicIcon, StopIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

type MicButtonProps = { listening: boolean; disabled?: boolean; onPress: () => void };

export function MicButton({ listening, disabled = false, onPress }: MicButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={listening}
      aria-label={listening ? 'Stop listening' : 'Start listening'}
      disabled={disabled}
      onClick={onPress}
      className={cn(
        'press relative flex size-24 items-center justify-center rounded-full text-accent-ink disabled:opacity-50',
        listening ? 'bg-danger' : 'bg-accent',
      )}
    >
      {listening && (
        <>
          <span aria-hidden="true" className="listen-ring absolute inset-0 rounded-full bg-danger" />
          <span aria-hidden="true" className="listen-ring listen-ring-late absolute inset-0 rounded-full bg-danger" />
        </>
      )}
      <span className="relative">{listening ? <StopIcon size={32} /> : <MicIcon size={36} />}</span>
    </button>
  );
}
