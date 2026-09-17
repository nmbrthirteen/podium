import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import type {
  DeckKind,
  Depth,
  FieldSource,
  FieldSources,
  PlanId,
  QuestionSource,
  SectionTiming,
  SessionKind,
  Stakes,
  SubscriptionStatus,
  TalkType,
  UsageKind,
} from '@/lib/domain';

export * from '@/lib/domain';

export const talks = sqliteTable(
  'talks',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().default('local'),
    title: text('title').notNull(),
    type: text('type').$type<TalkType>().notNull(),
    depth: text('depth').$type<Depth>().notNull(),
    stakes: text('stakes').$type<Stakes>().notNull().default('normal'),
    startsAt: text('starts_at').notNull(),
    lengthMinutes: integer('length_minutes').notNull(),
    nervousness: integer('nervousness').notNull(),
    completedAt: text('completed_at'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  table => [index('talks_user_id_idx').on(table.userId)],
);

export const briefs = sqliteTable('briefs', {
  talkId: text('talk_id').primaryKey(),
  goal: text('goal').notNull().default(''),
  audience: text('audience').notNull().default(''),
  bigIdea: text('big_idea').notNull().default(''),
  openingLine: text('opening_line').notNull().default(''),
  closingLine: text('closing_line').notNull().default(''),
  recoveryLine: text('recovery_line').notNull().default(''),
  backPocketQuestion: text('back_pocket_question').notNull().default(''),
  fieldSources: text('field_sources', { mode: 'json' }).$type<FieldSources>().notNull().default({}),
});

export const points = sqliteTable('points', {
  id: text('id').primaryKey(),
  talkId: text('talk_id').notNull(),
  position: integer('position').notNull(),
  text: text('text').notNull().default(''),
  example: text('example').notNull().default(''),
  source: text('source').$type<FieldSource>().notNull().default('user'),
});

export const sections = sqliteTable('sections', {
  id: text('id').primaryKey(),
  talkId: text('talk_id').notNull(),
  position: integer('position').notNull(),
  title: text('title').notNull(),
  minutes: real('minutes').notNull(),
  keywords: text('keywords', { mode: 'json' }).$type<string[]>().notNull().default([]),
  verbatim: text('verbatim').notNull().default(''),
  slideNumbers: text('slide_numbers', { mode: 'json' }).$type<number[]>().notNull().default([]),
});

export const decks = sqliteTable('decks', {
  id: text('id').primaryKey(),
  talkId: text('talk_id').notNull(),
  userId: text('user_id').notNull().default('local'),
  fileName: text('file_name').notNull(),
  kind: text('kind').$type<DeckKind>().notNull(),
  slideCount: integer('slide_count').notNull(),
  path: text('path').notNull(),
  uploadedAt: text('uploaded_at').notNull(),
});

export const slides = sqliteTable('slides', {
  id: text('id').primaryKey(),
  deckId: text('deck_id').notNull(),
  number: integer('number').notNull(),
  text: text('text').notNull().default(''),
  notes: text('notes').notNull().default(''),
  wordCount: integer('word_count').notNull().default(0),
  thumbnailPath: text('thumbnail_path'),
});

export const slideDrafts = sqliteTable(
  'slide_drafts',
  {
    id: text('id').primaryKey(),
    talkId: text('talk_id').notNull(),
    sectionId: text('section_id'),
    position: integer('position').notNull(),
    title: text('title').notNull().default(''),
    points: text('points', { mode: 'json' }).$type<string[]>().notNull().default([]),
    visual: text('visual').notNull().default(''),
    script: text('script').notNull().default(''),
  },
  table => [index('slide_drafts_talk_id_idx').on(table.talkId)],
);

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  talkId: text('talk_id').notNull(),
  source: text('source').$type<QuestionSource>().notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull().default(''),
  example: text('example').notNull().default(''),
  relevance: text('relevance').notNull().default(''),
  surprised: integer('surprised', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
});

export const planSessions = sqliteTable('plan_sessions', {
  id: text('id').primaryKey(),
  talkId: text('talk_id').notNull(),
  day: text('day').notNull(),
  position: integer('position').notNull(),
  kind: text('kind').$type<SessionKind>().notNull(),
  sectionId: text('section_id'),
  minutes: integer('minutes').notNull(),
  completedRunId: text('completed_run_id'),
});

export const runs = sqliteTable('runs', {
  id: text('id').primaryKey(),
  talkId: text('talk_id').notNull(),
  sessionId: text('session_id'),
  kind: text('kind').$type<SessionKind>().notNull(),
  sectionId: text('section_id'),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
  sectionTimings: text('section_timings', { mode: 'json' }).$type<SectionTiming[]>().notNull().default([]),
  prediction: text('prediction').notNull().default(''),
  observation: text('observation').notNull().default(''),
  recordingPath: text('recording_path'),
  excelled: text('excelled').notNull().default(''),
  workOn: text('work_on').notNull().default(''),
  challenge: text('challenge').notNull().default(''),
  listenerFeedback: text('listener_feedback').notNull().default(''),
  debriefedAt: text('debriefed_at'),
});

export const talkDebriefs = sqliteTable('talk_debriefs', {
  talkId: text('talk_id').primaryKey(),
  excelled: text('excelled').notNull().default(''),
  workOn: text('work_on').notNull().default(''),
  challenge: text('challenge').notNull().default(''),
  confidence: integer('confidence').notNull(),
  createdAt: text('created_at').notNull(),
});

export const coachCache = sqliteTable(
  'coach_cache',
  {
    id: text('id').primaryKey(),
    task: text('task').notNull(),
    inputHash: text('input_hash').notNull(),
    provider: text('provider').notNull(),
    output: text('output', { mode: 'json' }).$type<unknown>().notNull(),
    createdAt: text('created_at').notNull(),
  },
  table => [uniqueIndex('coach_cache_task_input').on(table.task, table.inputHash)],
);

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).$type<unknown>().notNull(),
});

export const usageEvents = sqliteTable(
  'usage_events',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    kind: text('kind').$type<UsageKind>().notNull(),
    units: integer('units').notNull(),
    createdAt: text('created_at').notNull(),
  },
  table => [index('usage_events_user_kind_time_idx').on(table.userId, table.kind, table.createdAt)],
);

export const subscriptions = sqliteTable('subscriptions', {
  userId: text('user_id').primaryKey(),
  plan: text('plan').$type<PlanId>().notNull().default('free'),
  status: text('status').$type<SubscriptionStatus>().notNull().default('active'),
  currentPeriodEnd: text('current_period_end'),
  providerCustomerId: text('provider_customer_id'),
  updatedAt: text('updated_at').notNull(),
});

export const authUsers = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .$onUpdate(() => new Date())
    .notNull(),
});

export const authSessions = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
  },
  table => [index('session_userId_idx').on(table.userId)],
);

export const authAccounts = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp_ms' }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp_ms' }),
    scope: text('scope'),
    password: text('password'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  table => [index('account_userId_idx').on(table.userId)],
);

export const authVerifications = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  table => [index('verification_identifier_idx').on(table.identifier)],
);

export type Talk = typeof talks.$inferSelect;
export type Brief = typeof briefs.$inferSelect;
export type Point = typeof points.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Deck = typeof decks.$inferSelect;
export type Slide = typeof slides.$inferSelect;
export type SlideDraft = typeof slideDrafts.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type PlanSession = typeof planSessions.$inferSelect;
export type Run = typeof runs.$inferSelect;
export type TalkDebrief = typeof talkDebriefs.$inferSelect;
