'use client';

import { type Dispatch, type SetStateAction, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { EditableLine } from '@/components/ui/editable-line';
import { FlowStep } from '@/components/ui/flow-step';
import { PlusIcon, TrashIcon } from '@/components/ui/icons';
import type { FieldSource } from '@/lib/domain';
import { addPoint, removePoint, savePoint } from '../actions';

export type EditablePoint = { id: string; text: string; example: string; source: FieldSource };

type PointsEditorProps = {
  talkId: string;
  points: EditablePoint[];
  setPoints: Dispatch<SetStateAction<EditablePoint[]>>;
};

export function PointsEditor({ talkId, points, setPoints }: PointsEditorProps) {
  const [adding, startAdding] = useTransition();

  const save = (id: string, field: 'text' | 'example', value: string) => {
    setPoints(current =>
      current.map(point => (point.id === id ? { ...point, [field]: value, source: 'user' } : point)),
    );
    void savePoint(talkId, id, { [field]: value });
  };

  return (
    <>
      {points.map((point, index) => (
        <FlowStep key={point.id} id={index === 0 ? 'points' : undefined} marker={index + 1}>
          <EditableLine
            label={`Point ${index + 1}`}
            value={point.text}
            placeholder="Tap to write the point"
            trailing={
              <Button
                variant="quiet"
                size="icon"
                className="text-muted"
                aria-label={`Remove point ${index + 1}`}
                onClick={() => {
                  setPoints(current => current.filter(item => item.id !== point.id));
                  void removePoint(talkId, point.id);
                }}
              >
                <TrashIcon size={16} />
              </Button>
            }
            onSave={value => save(point.id, 'text', value)}
          />
          <EditableLine
            id={`point-example-${point.id}`}
            label="Example"
            value={point.example}
            placeholder="Tap to add one example or number"
            onSave={value => save(point.id, 'example', value)}
          />
        </FlowStep>
      ))}

      <FlowStep id={points.length === 0 ? 'points' : undefined} marker={<PlusIcon size={18} />}>
        <Button
          variant="quiet"
          size="sm"
          className="-ml-3 self-start text-muted"
          pending={adding}
          pendingLabel="Adding a point"
          onClick={() =>
            startAdding(async () => {
              const point = await addPoint(talkId);
              setPoints(current => [...current, point]);
            })
          }
        >
          Add a point
        </Button>
      </FlowStep>
    </>
  );
}
