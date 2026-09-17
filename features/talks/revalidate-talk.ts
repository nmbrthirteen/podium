import { revalidatePath } from 'next/cache';

// The root layout renders the sidebar frame with every talk's title, progress, and
// done state, so revalidating it also covers every nested talk route.
export function revalidateTalk(_talkId: string) {
  revalidatePath('/', 'layout');
}
