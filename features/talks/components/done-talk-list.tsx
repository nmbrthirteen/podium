import Link from 'next/link';
import { CheckIcon } from '@/components/ui/icons';
import type { TalkSummary } from '../queries';
import { TalkMenu } from './talk-menu';

export function DoneTalkList({ talks }: { talks: TalkSummary[] }) {
  return (
    <section aria-labelledby="done-heading" className="flex flex-col gap-2">
      <h2 id="done-heading" className="font-display text-xl font-semibold">
        Done
      </h2>
      <ul className="flex flex-col">
        {talks.map(talk => (
          <li key={talk.id} className="flex min-h-14 items-center gap-3 border-b border-line last:border-b-0">
            <CheckIcon size={18} className="shrink-0 text-accent" />
            <Link href={`/talks/${talk.id}/plan`} className="min-w-0 flex-1 truncate font-medium hover:underline">
              {talk.title}
            </Link>
            <span className="shrink-0 text-sm text-muted">{talk.next.when}</span>
            <TalkMenu talkId={talk.id} title={talk.title} done />
          </li>
        ))}
      </ul>
    </section>
  );
}
