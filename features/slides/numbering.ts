type DraftPosition = { sectionId: string | null; position: number };

export function orderDrafts<D extends DraftPosition>(drafts: D[], sectionIds: string[]): D[] {
  const rank = new Map(sectionIds.map((id, index) => [id, index]));
  const sectionRank = (draft: D) =>
    (draft.sectionId === null ? undefined : rank.get(draft.sectionId)) ?? sectionIds.length;
  return [...drafts].sort((a, b) => sectionRank(a) - sectionRank(b) || a.position - b.position);
}
