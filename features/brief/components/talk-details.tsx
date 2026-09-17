'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { Field, Input } from '@/components/ui/field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Select } from '@/components/ui/select';
import { talkTypeLabels } from '@/features/talks/talk-types';
import type { Talk } from '@/lib/db/schema';
import { type Stakes, stakesLevels, type TalkType, talkTypes } from '@/lib/domain';
import { capitalize } from '@/lib/utils';
import { saveTalkDetails } from '../actions';

const typeOptions = talkTypes.map(type => ({ value: type, label: talkTypeLabels[type] }));
const stakesOptions = stakesLevels.map(value => ({ value, label: capitalize(value) }));
const nervousOptions = ['1', '2', '3', '4', '5'].map(value => ({ value, label: value }));

export function TalkDetails({ talk }: { talk: Talk }) {
  const [title, setTitle] = useState(talk.title);
  const [type, setType] = useState<TalkType>(talk.type);
  const [pendingType, setPendingType] = useState<TalkType | null>(null);
  const [date, setDate] = useState(talk.startsAt.slice(0, 10));
  const [time, setTime] = useState(talk.startsAt.slice(11, 16));
  const [length, setLength] = useState(String(talk.lengthMinutes));
  const [stakes, setStakes] = useState<Stakes>(talk.stakes);
  const [nervousness, setNervousness] = useState(String(talk.nervousness));

  const save = (patch: Parameters<typeof saveTalkDetails>[1]) => void saveTalkDetails(talk.id, patch);
  const commitSchedule = () => {
    const minutes = Number.parseInt(length, 10);
    if (!date || !time || !(minutes >= 1 && minutes <= 600)) return;
    save({ startsAt: `${date}T${time}`, lengthMinutes: minutes });
  };

  return (
    <div className="flex flex-col gap-5">
      <Field label="Title">
        <Input
          value={title}
          onChange={event => setTitle(event.target.value)}
          onBlur={() => {
            if (title.trim() && title !== talk.title) save({ title });
          }}
        />
      </Field>

      <Field label="Talk type" description="The type picks the sections on your cue cards.">
        <Select
          value={type}
          options={typeOptions}
          onValueChange={next => {
            if (next !== type) setPendingType(next);
          }}
        />
      </Field>

      <Dialog open={pendingType !== null} onOpenChange={open => !open && setPendingType(null)}>
        <DialogContent
          title="Switch the talk type?"
          description={
            pendingType
              ? `Your cue cards reset to the ${talkTypeLabels[pendingType]} template. Keywords on the current cards are cleared.`
              : undefined
          }
        >
          <div className="flex flex-wrap justify-end gap-2">
            <DialogClose render={<Button variant="quiet" />}>Keep {talkTypeLabels[type]}</DialogClose>
            <Button
              variant="primary"
              onClick={() => {
                if (pendingType) {
                  setType(pendingType);
                  save({ type: pendingType });
                }
                setPendingType(null);
              }}
            >
              Switch and reset cards
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Date">
          <Input type="date" value={date} onChange={event => setDate(event.target.value)} onBlur={commitSchedule} />
        </Field>
        <Field label="Start time">
          <Input type="time" value={time} onChange={event => setTime(event.target.value)} onBlur={commitSchedule} />
        </Field>
        <Field label="Length in minutes">
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={600}
            value={length}
            onChange={event => setLength(event.target.value)}
            onBlur={commitSchedule}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="font-medium">Stakes</span>
        <SegmentedControl
          label="Stakes"
          value={stakes}
          options={stakesOptions}
          onValueChange={next => {
            setStakes(next);
            save({ stakes: next });
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="font-medium">How nervous do you feel about it?</span>
        <SegmentedControl
          label="How nervous do you feel about it?"
          value={nervousness}
          options={nervousOptions}
          onValueChange={next => {
            setNervousness(next);
            save({ nervousness: Number.parseInt(next, 10) });
          }}
        />
        <span className="text-sm text-muted">1 is calm. 5 is very nervous.</span>
      </div>
    </div>
  );
}
