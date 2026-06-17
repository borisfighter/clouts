import { pgTable, uuid, text, boolean, integer, timestamp, date, jsonb, vector, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── USERS ───────────────────────────────────────────────────
export const users = pgTable('users', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  email:                text('email').notNull().unique(),
  name:                 text('name'),
  avatarUrl:            text('avatar_url'),
  plan:                 text('plan').notNull().default('free'),
  stripeCustomerId:     text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  planExpiresAt:        timestamp('plan_expires_at', { withTimezone: true }),
  createdAt:            timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:            timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── BRANDS ──────────────────────────────────────────────────
export const brands = pgTable('brands', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:        text('name').notNull(),
  domain:      text('domain').notNull(),
  logoUrl:     text('logo_url'),
  keywords:    text('keywords').array().default([]),
  competitors: text('competitors').array().default([]),
  isDefault:   boolean('is_default').default(false),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── MENTIONS ────────────────────────────────────────────────
export const mentions = pgTable('mentions', {
  id:           uuid('id').primaryKey().defaultRandom(),
  brandId:      uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  engine:       text('engine').notNull(),
  prompt:       text('prompt').notNull(),
  responseText: text('response_text').notNull(),
  mentioned:    boolean('mentioned').notNull().default(false),
  sentiment:    text('sentiment'),
  position:     integer('position'),
  citedUrl:     text('cited_url'),
  score:        integer('score'),
  embedding:    vector('embedding', { dimensions: 1536 }),
  scrapedAt:    timestamp('scraped_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  brandIdx:    index('mentions_brand_id_idx').on(t.brandId),
  engineIdx:   index('mentions_engine_idx').on(t.engine),
  scrapedIdx:  index('mentions_scraped_at_idx').on(t.scrapedAt),
}))

// ─── PROMPT VOLUMES ──────────────────────────────────────────
export const promptVolumes = pgTable('prompt_volumes', {
  id:               uuid('id').primaryKey().defaultRandom(),
  brandId:          uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  query:            text('query').notNull(),
  category:         text('category'),
  estimatedVolume:  integer('estimated_volume'),
  engines:          text('engines').array().default([]),
  opportunityScore: integer('opportunity_score'),
  date:             date('date').notNull().defaultNow(),
  createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── AGENTS ──────────────────────────────────────────────────
export const agents = pgTable('agents', {
  id:         uuid('id').primaryKey().defaultRandom(),
  brandId:    uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  name:       text('name').notNull(),
  type:       text('type').notNull(), // aeo | content | pr | shopping
  status:     text('status').notNull().default('idle'),
  config:     jsonb('config').default({}),
  lastRunAt:  timestamp('last_run_at', { withTimezone: true }),
  nextRunAt:  timestamp('next_run_at', { withTimezone: true }),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const agentRuns = pgTable('agent_runs', {
  id:          uuid('id').primaryKey().defaultRandom(),
  agentId:     uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  status:      text('status').notNull().default('running'),
  input:       jsonb('input'),
  output:      jsonb('output'),
  error:       text('error'),
  durationMs:  integer('duration_ms'),
  startedAt:   timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
})

// ─── CLIPS ───────────────────────────────────────────────────
export const clips = pgTable('clips', {
  id:             uuid('id').primaryKey().defaultRandom(),
  brandId:        uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  mentionId:      uuid('mention_id').references(() => mentions.id, { onDelete: 'set null' }),
  title:          text('title').notNull(),
  description:    text('description'),
  status:         text('status').notNull().default('processing'),
  sourceUrl:      text('source_url'),
  muxAssetId:     text('mux_asset_id'),
  muxPlaybackId:  text('mux_playback_id'),
  r2Key:          text('r2_key'),
  durationSec:    integer('duration_sec'),
  startSec:       integer('start_sec').default(0),
  endSec:         integer('end_sec'),
  format:         text('format').default('16:9'),
  captionsUrl:    text('captions_url'),
  thumbnailUrl:   text('thumbnail_url'),
  hasCaptions:    boolean('has_captions').default(false),
  hasBranding:    boolean('has_branding').default(true),
  tags:           text('tags').array().default([]),
  views:          integer('views').default(0),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  publishedAt:    timestamp('published_at', { withTimezone: true }),
}, (t) => ({
  brandIdx:  index('clips_brand_id_idx').on(t.brandId),
  statusIdx: index('clips_status_idx').on(t.status),
}))

export const clipPublishes = pgTable('clip_publishes', {
  id:             uuid('id').primaryKey().defaultRandom(),
  clipId:         uuid('clip_id').notNull().references(() => clips.id, { onDelete: 'cascade' }),
  platform:       text('platform').notNull(),
  platformPostId: text('platform_post_id'),
  status:         text('status').notNull().default('queued'),
  publishedAt:    timestamp('published_at', { withTimezone: true }),
  views:          integer('views').default(0),
  likes:          integer('likes').default(0),
  shares:         integer('shares').default(0),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ─── RELATIONS ───────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  brands: many(brands),
}))

export const brandsRelations = relations(brands, ({ one, many }) => ({
  user:          one(users, { fields: [brands.userId], references: [users.id] }),
  mentions:      many(mentions),
  promptVolumes: many(promptVolumes),
  agents:        many(agents),
  clips:         many(clips),
}))

export const mentionsRelations = relations(mentions, ({ one, many }) => ({
  brand: one(brands, { fields: [mentions.brandId], references: [brands.id] }),
  clips: many(clips),
}))

export const clipsRelations = relations(clips, ({ one, many }) => ({
  brand:    one(brands,   { fields: [clips.brandId],   references: [brands.id] }),
  mention:  one(mentions, { fields: [clips.mentionId], references: [mentions.id] }),
  publishes: many(clipPublishes),
}))

export const clipPublishesRelations = relations(clipPublishes, ({ one }) => ({
  clip: one(clips, { fields: [clipPublishes.clipId], references: [clips.id] }),
}))

// ─── TYPE EXPORTS ────────────────────────────────────────────
export type User         = typeof users.$inferSelect
export type NewUser      = typeof users.$inferInsert
export type Brand        = typeof brands.$inferSelect
export type Mention      = typeof mentions.$inferSelect
export type Agent        = typeof agents.$inferSelect
export type AgentRun     = typeof agentRuns.$inferSelect
export type Clip         = typeof clips.$inferSelect
export type ClipPublish  = typeof clipPublishes.$inferSelect
