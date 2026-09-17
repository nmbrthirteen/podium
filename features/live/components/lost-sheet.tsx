import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import type { RunCard } from '@/features/practice/run-cards';

type LostSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recoveryLine: string;
  previousCard: RunCard | undefined;
  card: RunCard;
};

export function LostSheet({ open, onOpenChange, recoveryLine, previousCard, card }: LostSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Take a breath" className="live">
      <div className="flex flex-col gap-6 pb-2">
        <p className="font-display text-2xl text-pretty">{recoveryLine}</p>
        {previousCard && (
          <section aria-labelledby="covered-heading" className="flex flex-col gap-2">
            <h3 id="covered-heading" className="text-sm font-medium text-muted">
              You just covered {previousCard.title}
            </h3>
            <p className="text-lg">{previousCard.keywords.join(', ') || previousCard.verbatim}</p>
          </section>
        )}
        <section aria-labelledby="now-heading" className="flex flex-col gap-2">
          <h3 id="now-heading" className="text-sm font-medium text-muted">
            Now: {card.title}
          </h3>
          <ul className="flex flex-col gap-1 text-2xl font-medium">
            {card.keywords.map(keyword => (
              <li key={keyword}>{keyword}</li>
            ))}
          </ul>
          {card.holdsVerbatim && card.verbatim && <p className="text-lg">{card.verbatim}</p>}
        </section>
        <Button variant="primary" size="lg" onClick={() => onOpenChange(false)}>
          Back to the talk
        </Button>
      </div>
    </Sheet>
  );
}
