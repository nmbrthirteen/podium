'use client';

import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { ChevronDownIcon, PlayIcon } from '@/components/ui/icons';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/components/ui/menu';
import { sessionKindHints, sessionKindLabels } from '@/features/plan/session-kinds';
import type { NextStepAction } from '@/features/talks/next-step';
import { sessionKinds } from '@/lib/domain';
import { useStartSession } from '../use-start-session';

type PracticeControlsProps = { talkId: string; talkTitle: string; action: NextStepAction };

export function PracticeControls({ talkId, talkTitle, action }: PracticeControlsProps) {
  const { start, pending } = useStartSession(talkId);

  if (action === 'debrief' || action === 'done') {
    return (
      <Link href={`/talks/${talkId}/debrief`} className={buttonVariants({ variant: 'primary' })}>
        {action === 'debrief' ? 'Debrief' : 'View debrief'}
      </Link>
    );
  }

  return (
    <div className="flex shrink-0 self-start sm:self-auto">
      <Button
        variant="primary"
        pending={pending}
        pendingLabel="Starting session"
        onClick={() => start()}
        className="rounded-r-none pl-3.5"
        aria-label={`${action === 'present' ? 'Open talk day' : 'Practice'} for ${talkTitle}`}
      >
        <PlayIcon size={16} />
        {action === 'present' ? 'Open talk day' : 'Practice'}
      </Button>
      <Menu>
        <MenuTrigger
          disabled={pending}
          aria-label={`Choose a session for ${talkTitle}`}
          className={buttonVariants({
            variant: 'primary',
            size: 'icon',
            className: 'rounded-l-none border-l border-accent-ink/25',
          })}
        >
          <ChevronDownIcon size={18} />
        </MenuTrigger>
        <MenuContent label="Session kinds">
          {sessionKinds.map(kind => (
            <MenuItem key={kind} onClick={() => start(kind)} description={sessionKindHints[kind]}>
              {sessionKindLabels[kind]}
            </MenuItem>
          ))}
        </MenuContent>
      </Menu>
    </div>
  );
}
