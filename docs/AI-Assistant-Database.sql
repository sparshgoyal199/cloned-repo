DROP TABLE IF EXISTS "public"."emails_raw";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS "Emails_raw_id_seq";

-- Table Definition
CREATE TABLE "public"."emails_raw" (
    "id" int4 NOT NULL DEFAULT nextval('"Emails_raw_id_seq"'::regclass),
    "message_id_url" text,
    "subject" text,
    "sender" json,
    "body" text,
    "labels" json,
    "created_at" timestamp,
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX "Emails_raw_pkey" ON public.emails_raw USING btree (id);

DROP TABLE IF EXISTS "public"."tasks";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS tasks_id_seq;

-- Table Definition
CREATE TABLE "public"."tasks" (
    "id" int4 NOT NULL DEFAULT nextval('tasks_id_seq'::regclass),
    "description" text,
    "due_date" timestamp,
    "priority" int2,
    "created_at" timestamp,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."daily_digest";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS daily_digest_id_seq;

-- Table Definition
CREATE TABLE "public"."daily_digest" (
    "id" int4 NOT NULL DEFAULT nextval('daily_digest_id_seq'::regclass),
    "digest_date" date,
    "content" text,
    "generated_at" timestamp,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."emails_ai";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS "Emails_ai_id_seq";

-- Table Definition
CREATE TABLE "public"."emails_ai" (
    "id" int4 NOT NULL DEFAULT nextval('"Emails_ai_id_seq"'::regclass),
    "summary" text,
    "importance" text,
    "urgency" text,
    "category" text,
    "action_items" json,
    "created_at" timestamp,
    "message_id_url" text,
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX "Emails_ai_pkey" ON public.emails_ai USING btree (id);

DROP TABLE IF EXISTS "public"."calendar_events";
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS calendar_events_id_seq;

-- Table Definition
CREATE TABLE "public"."calendar_events" (
    "id" int4 NOT NULL DEFAULT nextval('calendar_events_id_seq'::regclass),
    "event_id" text,
    "title" text,
    "description" text,
    "start_time" timestamp,
    "end_time" timestamp,
    "created_at" timestamp,
    "html_link" text,
    PRIMARY KEY ("id")
);

