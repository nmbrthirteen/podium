import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import { toBriefContext } from '@/features/brief/brief-context';
import { StructureEditor } from '@/features/cue-cards/components/structure-editor';
import { SlidesPanel } from '@/features/slides/components/slides-panel';
import { NextStepLink } from '@/features/talks/components/next-step-link';
import { TalkHeader } from '@/features/talks/components/talk-header';
import { loadTalkPage } from '@/features/talks/load-talk-page';

export const metadata: Metadata = { title: 'Cards' };

export default async function CardsPage({ params }: { params: Promise<{ 'talk-id': string }> }) {
  const { bundle, next } = await loadTalkPage(params);
  const talkId = bundle.talk.id;
  const context = toBriefContext(bundle.talk, bundle.brief, bundle.points);
  const sectionsKey = bundle.sections.map(section => section.id).join('-');

  return (
    <AppShell width="lg">
      <TalkHeader talk={bundle.talk} next={next} />
      <StructureEditor
        key={sectionsKey}
        talk={bundle.talk}
        sections={bundle.sections}
        slides={bundle.slides}
        deckId={bundle.deck?.id ?? null}
        context={context}
      />
      <section aria-labelledby="slides-heading" className="flex scroll-mt-6 flex-col gap-4">
        <h2 id="slides-heading" className="font-display text-xl font-semibold">
          Slides
        </h2>
        <SlidesPanel
          key={`${sectionsKey}:${bundle.deck?.id ?? 'none'}`}
          talkId={talkId}
          deck={bundle.deck}
          slides={bundle.slides}
          drafts={bundle.slideDrafts}
          sections={bundle.sections}
          context={context}
        />
      </section>
      <NextStepLink talkId={talkId} seen="cards" href={`/talks/${talkId}/practice`} label="Next: first run" />
    </AppShell>
  );
}
