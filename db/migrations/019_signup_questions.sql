-- Migration 019: Dynamic signup questions system

CREATE TABLE signup_questions (
  id           SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  field_type   VARCHAR(20) NOT NULL CHECK (field_type IN ('text', 'textarea', 'select', 'radio', 'checkbox')),
  target_role  VARCHAR(20) NOT NULL CHECK (target_role IN ('publisher', 'advertiser', 'both')),
  is_required  BOOLEAN NOT NULL DEFAULT false,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  options_json JSONB DEFAULT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE signup_question_responses (
  id            SERIAL PRIMARY KEY,
  publisher_id  UUID REFERENCES publishers(id) ON DELETE CASCADE,
  advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,
  question_id   INTEGER NOT NULL REFERENCES signup_questions(id) ON DELETE CASCADE,
  answer        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_sqr_exactly_one CHECK (
    (publisher_id IS NOT NULL)::int + (advertiser_id IS NOT NULL)::int = 1
  )
);

CREATE INDEX idx_signup_questions_target_role ON signup_questions(target_role);
CREATE INDEX idx_signup_questions_sort_order  ON signup_questions(sort_order);
CREATE INDEX idx_sqr_publisher_id   ON signup_question_responses(publisher_id);
CREATE INDEX idx_sqr_advertiser_id  ON signup_question_responses(advertiser_id);
CREATE INDEX idx_sqr_question_id    ON signup_question_responses(question_id);
