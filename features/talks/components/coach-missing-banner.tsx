import Link from 'next/link';
import { ArrowRightIcon } from '@/components/ui/icons';

export function CoachMissingBanner() {
  return (
    <Link
      href="/settings"
      className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-danger-soft px-4 font-medium text-danger"
    >
      Set up the coach to draft briefs and cards
      <ArrowRightIcon size={18} />
    </Link>
  );
}
