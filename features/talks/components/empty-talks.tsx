import Link from 'next/link';
import { IconBadge } from '@/components/ui/icon-badge';
import { MicIcon } from '@/components/ui/icons';

export function EmptyTalks({ hasFinished }: { hasFinished: boolean }) {
  return (
    <Link
      href="/talks/new"
      className="press flex flex-col items-center gap-5 rounded-2xl bg-inset px-6 py-16 text-center"
    >
      <IconBadge size="20" tone="accent">
        <MicIcon size={32} />
      </IconBadge>
      <span className="font-display text-2xl font-semibold">
        {hasFinished ? 'Add your next talk' : 'Add your first talk'}
      </span>
    </Link>
  );
}
