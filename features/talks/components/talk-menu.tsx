'use client';

import { useState, useTransition } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { MoreIcon } from '@/components/ui/icons';
import { Menu, MenuContent, MenuItem, MenuTrigger } from '@/components/ui/menu';
import { deleteTalk, setTalkDone } from '../actions';

type TalkMenuProps = { talkId: string; title: string; done: boolean };

export function TalkMenu({ talkId, title, done }: TalkMenuProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Menu>
        <MenuTrigger
          aria-label={`More actions for ${title}`}
          disabled={pending}
          className={buttonVariants({ variant: 'quiet', size: 'icon', className: 'shrink-0 text-muted' })}
        >
          <MoreIcon size={20} />
        </MenuTrigger>
        <MenuContent label="Talk actions">
          <MenuItem
            onClick={() =>
              startTransition(async () => {
                await setTalkDone(talkId, !done);
              })
            }
          >
            {done ? 'Reopen talk' : 'Mark as done'}
          </MenuItem>
          <MenuItem className="text-danger" onClick={() => setConfirmOpen(true)}>
            Delete talk
          </MenuItem>
        </MenuContent>
      </Menu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          title={`Delete ${title}?`}
          description="Its plan, runs, recordings, and slides are removed for good."
        >
          <div className="flex flex-wrap justify-end gap-2">
            <DialogClose render={<Button variant="quiet" />}>Keep talk</DialogClose>
            <Button
              variant="danger"
              pending={pending}
              pendingLabel="Deleting the talk"
              onClick={() =>
                startTransition(async () => {
                  await deleteTalk(talkId);
                })
              }
            >
              Delete talk
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
