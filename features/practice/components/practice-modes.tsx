'use client';

import { IconBadge } from '@/components/ui/icon-badge';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/components/ui/menu';
import { sessionKindIcons } from '@/features/plan/session-icons';
import { sessionKindHints, sessionKindLabels, sessionMinutes } from '@/features/plan/session-kinds';
import type { SessionKind } from '@/lib/domain';
import { formatMinutes } from '@/lib/utils';
import { useStartSession } from '../use-start-session';

const modeKinds: SessionKind[] = [
  'full-run',
  'section-loop',
  'qa-drill',
  'open-close-drill',
  'dress-rehearsal',
  'recorded-run',
  'listener-run',
  'mental-walkthrough',
];

type PracticeModesProps = {
  talkId: string;
  lengthMinutes: number;
  sections: { id: string; title: string; minutes: number }[];
};

const shortMinutes = (minutes: number) => `${Math.round(minutes)} min`;

const tileClass =
  'press flex h-full w-full flex-col gap-2 rounded-2xl bg-surface p-3.5 sm:min-h-36 sm:gap-3 sm:p-4 text-left shadow-card transition-colors hover:bg-inset disabled:opacity-60';

export function PracticeModes({ talkId, lengthMinutes, sections }: PracticeModesProps) {
  const { start, pendingKind } = useStartSession(talkId);

  const tileBody = (kind: SessionKind, minutesLabel: string) => {
    const Icon = sessionKindIcons[kind];
    return (
      <>
        <span className="flex items-center justify-between gap-2">
          <IconBadge size="10" tone="soft">
            <Icon size={20} />
          </IconBadge>
          <span className="text-sm text-muted tabular-nums">{pendingKind === kind ? 'Starting' : minutesLabel}</span>
        </span>
        <span className="font-medium">{sessionKindLabels[kind]}</span>
        <span className="hidden text-sm text-muted sm:block">{sessionKindHints[kind]}</span>
      </>
    );
  };

  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {modeKinds.map(kind => {
        if (kind === 'section-loop') {
          const longest = Math.max(0, ...sections.map(section => section.minutes));
          return (
            <li key={kind}>
              <Menu>
                <MenuTrigger
                  disabled={pendingKind !== null || sections.length === 0}
                  aria-label={`${sessionKindLabels[kind]}: choose a section`}
                  className={tileClass}
                >
                  {tileBody(kind, `Up to ${shortMinutes(sessionMinutes(kind, lengthMinutes, longest))}`)}
                </MenuTrigger>
                <MenuContent label="Sections">
                  {sections.map(section => (
                    <MenuItem
                      key={section.id}
                      onClick={() => start(kind, section.id)}
                      description={formatMinutes(sessionMinutes(kind, lengthMinutes, section.minutes))}
                    >
                      {section.title}
                    </MenuItem>
                  ))}
                </MenuContent>
              </Menu>
            </li>
          );
        }
        return (
          <li key={kind}>
            <button type="button" disabled={pendingKind !== null} onClick={() => start(kind)} className={tileClass}>
              {tileBody(kind, shortMinutes(sessionMinutes(kind, lengthMinutes)))}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
