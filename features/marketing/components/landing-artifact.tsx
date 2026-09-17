import { SegmentBar, sectionSegments } from '@/components/ui/segment-bar';

const timeline = [
  { id: 'answer', minutes: 1 },
  { id: 'situation', minutes: 1 },
  { id: 'reasons', minutes: 6 },
  { id: 'ask', minutes: 2 },
];

const keywords = ['Churn up 4 points', 'Tickets wait 2 days', '30 of 41 lost waited', 'Two hires cost $240k'];

export function LandingArtifact() {
  return (
    <figure
      aria-label="Example of live mode during a talk"
      className="live flex flex-col gap-5 rounded-card bg-canvas p-6 text-ink sm:p-8"
    >
      <div className="flex flex-wrap gap-x-10 gap-y-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted">Section time left</span>
          <span className="font-mono text-4xl leading-none font-medium tabular-nums">4:12</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted">Talk time left</span>
          <span className="font-mono text-4xl leading-none font-medium tabular-nums">7:40</span>
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-card bg-surface p-6 shadow-card">
        <p className="text-sm text-muted">Section 3 of 4, 6 minutes</p>
        <p className="font-display text-2xl font-semibold">Reasons</p>
        <SegmentBar segments={sectionSegments(timeline, 2)} label="Section 3 of 4" />
        <ul className="flex flex-col gap-2 text-2xl font-medium">
          {keywords.map(keyword => (
            <li key={keyword}>{keyword}</li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted">
          Next: <span className="text-ink">Ask and close</span>
        </p>
        <span className="flex min-h-14 items-center rounded-control bg-surface px-6 text-xl font-medium shadow-control">
          Lost
        </span>
      </div>
      <figcaption className="sr-only">
        Live mode shows the current keywords, the time left, and a Lost button for blank moments.
      </figcaption>
    </figure>
  );
}
