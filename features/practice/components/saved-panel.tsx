import Link from 'next/link';
import { type ReactNode, useId } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { CheckMark } from '@/components/ui/check-mark';
import { IconBadge } from '@/components/ui/icon-badge';

type SavedPanelProps = {
  title: ReactNode;
  talkId: string;
  children?: ReactNode;
  actions?: ReactNode;
};

export function SavedPanel({ title, talkId, children, actions }: SavedPanelProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-3">
        <IconBadge size="10" tone="accent">
          <CheckMark size={22} />
        </IconBadge>
        <h2 id={headingId} className="font-display text-2xl font-semibold">
          {title}
        </h2>
      </div>
      {children}
      <div className="flex flex-wrap gap-2">
        {actions}
        <Link href={`/talks/${talkId}/practice`} className={buttonVariants({ variant: 'secondary' })}>
          Back to practice
        </Link>
      </div>
    </section>
  );
}
