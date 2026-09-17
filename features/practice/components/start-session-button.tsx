'use client';

import { Button } from '@/components/ui/button';
import type { SessionKind } from '@/lib/domain';
import { useStartSession } from '../use-start-session';

type StartSessionButtonProps = {
  talkId: string;
  kind?: SessionKind;
  sectionId?: string | null;
  label?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function StartSessionButton({
  talkId,
  kind,
  sectionId,
  label = 'Start',
  variant = 'secondary',
  size = 'sm',
  className,
}: StartSessionButtonProps) {
  const { start, pending } = useStartSession(talkId);
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      pending={pending}
      pendingLabel="Starting session"
      onClick={() => start(kind, sectionId)}
    >
      {label}
    </Button>
  );
}
