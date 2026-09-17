import { Button } from '@/components/ui/button';
import { IconBadge } from '@/components/ui/icon-badge';
import { CalendarIcon, ChartIcon } from '@/components/ui/icons';

type DebriefLockedProps = {
  when: string;
  onContinue: () => void;
};

export function DebriefLocked({ when, onContinue }: DebriefLockedProps) {
  return (
    <section className="flex flex-col items-center gap-5 rounded-2xl bg-inset px-6 py-12 text-center">
      <IconBadge size="16" tone="surface">
        <ChartIcon size={28} />
      </IconBadge>
      <h2 className="font-display text-2xl font-semibold text-balance">Debrief opens after your talk</h2>
      <span className="inline-flex h-8 items-center gap-2 rounded-full bg-surface px-3 text-sm shadow-card">
        <CalendarIcon size={14} className="text-accent" />
        {when}
      </span>
      <Button variant="secondary" onClick={onContinue}>
        My talk already happened
      </Button>
    </section>
  );
}
