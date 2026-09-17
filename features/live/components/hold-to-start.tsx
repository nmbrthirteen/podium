import { HoldButton } from '@/components/ui/hold-button';

type HoldToStartProps = {
  talkTitle: string;
  onComplete: () => void;
};

export function HoldToStart({ talkTitle, onComplete }: HoldToStartProps) {
  return (
    <div className="live flex min-h-dvh flex-col items-center justify-center gap-8 bg-canvas px-6 text-center text-ink">
      <h1 className="max-w-lg font-display text-4xl font-semibold text-balance">{talkTitle}</h1>
      <HoldButton onComplete={onComplete} className="min-h-16 px-10 text-xl">
        Hold to start
      </HoldButton>
    </div>
  );
}
