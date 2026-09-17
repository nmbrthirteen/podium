'use client';

import { Checklist } from '@/components/ui/checklist';

export const checkIds = ['opening', 'close', 'room', 'big-idea'] as const;
export type CheckId = (typeof checkIds)[number];

type TalkDayChecklistProps = {
  done: CheckId[];
  onToggle: (id: CheckId, checked: boolean) => void;
  openingLine: string;
  closingLine: string;
  bigIdea: string;
};

const quoted = (line: string) => (line.trim() ? `"${line.trim()}"` : undefined);

export function TalkDayChecklist({ done, onToggle, openingLine, closingLine, bigIdea }: TalkDayChecklistProps) {
  return (
    <Checklist
      label="Final check"
      onToggle={(id, checked) => {
        const check = checkIds.find(item => item === id);
        if (check) onToggle(check, checked);
      }}
      items={[
        {
          id: 'opening',
          title: 'Say your opening out loud',
          detail: quoted(openingLine),
          done: done.includes('opening'),
        },
        { id: 'close', title: 'Say your close out loud', detail: quoted(closingLine), done: done.includes('close') },
        { id: 'room', title: 'Check the room, clicker, and microphone', done: done.includes('room') },
        {
          id: 'big-idea',
          title: 'Repeat your big idea once',
          detail: quoted(bigIdea),
          done: done.includes('big-idea'),
        },
      ]}
    />
  );
}
