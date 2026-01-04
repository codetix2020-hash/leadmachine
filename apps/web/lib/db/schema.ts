import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Tabla de leads
export const leads = sqliteTable('leads', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	user_id: text('user_id').notNull().default('00000000-0000-0000-0000-000000000000'),
	company_name: text('company_name').notNull(),
	email: text('email'),
	phone: text('phone'),
	linkedin_url: text('linkedin_url'),
	instagram_url: text('instagram_url'),
	website: text('website'),
	type: text('type', { enum: ['codetix', 'reservaspro'] }).notNull(),
	score: integer('score').default(0).notNull(),
	status: text('status', {
		enum: ['new', 'contacted', 'interested', 'call_scheduled', 'closed', 'lost'],
	})
		.default('new')
		.notNull(),
	industry: text('industry'),
	location: text('location'),
	employee_count: integer('employee_count'),
	problem_detected: text('problem_detected'),
	insight: text('insight'),
	created_at: text('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updated_at: text('updated_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

// Tabla de conversaciones
export const conversations = sqliteTable('conversations', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	lead_id: text('lead_id')
		.notNull()
		.references(() => leads.id, { onDelete: 'cascade' }),
	channel: text('channel', {
		enum: ['email', 'linkedin', 'whatsapp', 'instagram'],
	}).notNull(),
	message_sent: text('message_sent').notNull(),
	message_received: text('message_received'),
	sentiment: text('sentiment', {
		enum: ['interested', 'needs_info', 'not_now', 'not_interested', 'auto_reply'],
	}),
	created_at: text('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

// Tabla de secuencias de outreach
export const outreachSequences = sqliteTable('outreach_sequences', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	lead_id: text('lead_id')
		.notNull()
		.references(() => leads.id, { onDelete: 'cascade' }),
	sequence_type: text('sequence_type').notNull(),
	current_step: integer('current_step').default(1).notNull(),
	next_action_date: text('next_action_date'),
	status: text('status', { enum: ['active', 'paused', 'completed'] })
		.default('active')
		.notNull(),
	created_at: text('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updated_at: text('updated_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

// Tabla de analytics
export const analytics = sqliteTable('analytics', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	date: text('date').notNull().unique(),
	leads_found: integer('leads_found').default(0).notNull(),
	messages_sent: integer('messages_sent').default(0).notNull(),
	open_rate: real('open_rate').default(0).notNull(),
	response_rate: real('response_rate').default(0).notNull(),
	calls_scheduled: integer('calls_scheduled').default(0).notNull(),
	deals_closed: integer('deals_closed').default(0).notNull(),
	revenue_generated: real('revenue_generated').default(0).notNull(),
	created_at: text('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

// Tipos inferidos
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type OutreachSequence = typeof outreachSequences.$inferSelect;
export type NewOutreachSequence = typeof outreachSequences.$inferInsert;
export type Analytic = typeof analytics.$inferSelect;
export type NewAnalytic = typeof analytics.$inferInsert;

