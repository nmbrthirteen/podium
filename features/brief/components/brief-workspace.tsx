'use client';

import { LoadingState } from '@/components/ui/loading-state';
import type { TalkBundle } from '@/features/talks/queries';
import { focusTarget } from '../brief-context';
import type { RuleAction } from '../rules';
import { useAutoBrief } from '../use-auto-brief';
import { BriefEditor } from './brief-editor';

export function BriefWorkspace({ bundle }: { bundle: TalkBundle }) {
  const auto = useAutoBrief(bundle);

  const onRuleAction = (action: RuleAction) => {
    if (action.kind === 'focus') focusTarget(action.target);
    else if (action.panel === 'points') focusTarget('points');
  };

  return (
    <div className="flex flex-col gap-6">
      {auto.running && <LoadingState label="The coach is drafting your brief" onCancel={auto.cancel} />}
      <BriefEditor
        key={auto.version}
        talk={bundle.talk}
        brief={auto.brief}
        points={auto.points}
        questions={bundle.questions}
        draftFailed={auto.failed}
        onRuleAction={onRuleAction}
      />
    </div>
  );
}
