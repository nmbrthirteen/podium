import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ArrowRightIcon } from '@/components/ui/icons';
import type { SeenStepId } from '../setup-steps';
import { SeenMarker } from './seen-marker';

type NextStepLinkProps = { talkId: string; seen: SeenStepId; href: string; label: string };

export function NextStepLink({ talkId, seen, href, label }: NextStepLinkProps) {
  return (
    <div className="flex justify-end border-t border-line pt-6">
      <SeenMarker talkId={talkId} step={seen} />
      <Link href={href} className={buttonVariants({ variant: 'primary', size: 'lg', className: 'pr-4' })}>
        {label}
        <ArrowRightIcon size={18} />
      </Link>
    </div>
  );
}
