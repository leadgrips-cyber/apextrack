import { query, pool } from "../db/index.js";
import {
  SignupQuestionRecord,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  QuestionResponseInput,
} from "../types/signup-questions.js";

export interface SignupQuestionResponseRecord {
  question_id: number;
  question_text: string;
  field_type: string;
  answer: string;
}

export async function listAllQuestions(): Promise<SignupQuestionRecord[]> {
  const result = await query<SignupQuestionRecord>(
    `SELECT * FROM signup_questions ORDER BY sort_order ASC, id ASC`
  );
  return result.rows;
}

export async function listPublicQuestions(
  role: 'publisher' | 'advertiser'
): Promise<SignupQuestionRecord[]> {
  const result = await query<SignupQuestionRecord>(
    `SELECT * FROM signup_questions
     WHERE is_active = true AND (target_role = $1 OR target_role = 'both')
     ORDER BY sort_order ASC, id ASC`,
    [role]
  );
  return result.rows;
}

export async function findQuestionById(id: number): Promise<SignupQuestionRecord | null> {
  const result = await query<SignupQuestionRecord>(
    `SELECT * FROM signup_questions WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function createQuestion(
  payload: CreateQuestionPayload
): Promise<SignupQuestionRecord> {
  const result = await query<SignupQuestionRecord>(
    `INSERT INTO signup_questions
       (question_text, field_type, target_role, is_required, sort_order, is_active, options_json)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      payload.question_text,
      payload.field_type,
      payload.target_role,
      payload.is_required,
      payload.sort_order,
      payload.is_active,
      payload.options_json != null ? JSON.stringify(payload.options_json) : null,
    ]
  );
  return result.rows[0];
}

export async function updateQuestion(
  id: number,
  payload: UpdateQuestionPayload
): Promise<SignupQuestionRecord | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (payload.question_text !== undefined) { sets.push(`question_text = $${idx++}`); values.push(payload.question_text); }
  if (payload.field_type     !== undefined) { sets.push(`field_type = $${idx++}`);     values.push(payload.field_type); }
  if (payload.target_role    !== undefined) { sets.push(`target_role = $${idx++}`);    values.push(payload.target_role); }
  if (payload.is_required    !== undefined) { sets.push(`is_required = $${idx++}`);    values.push(payload.is_required); }
  if (payload.sort_order     !== undefined) { sets.push(`sort_order = $${idx++}`);     values.push(payload.sort_order); }
  if (payload.is_active      !== undefined) { sets.push(`is_active = $${idx++}`);      values.push(payload.is_active); }
  if ('options_json' in payload)            { sets.push(`options_json = $${idx++}`);   values.push(payload.options_json != null ? JSON.stringify(payload.options_json) : null); }

  if (sets.length === 0) return findQuestionById(id);

  sets.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query<SignupQuestionRecord>(
    `UPDATE signup_questions SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] ?? null;
}

export async function deleteQuestion(id: number): Promise<boolean> {
  const result = await query(
    `DELETE FROM signup_questions WHERE id = $1`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function saveResponses(
  publisherId: string | null,
  advertiserId: string | null,
  responses: QuestionResponseInput[]
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const r of responses) {
      await client.query(
        `INSERT INTO signup_question_responses (publisher_id, advertiser_id, question_id, answer)
         VALUES ($1, $2, $3, $4)`,
        [publisherId, advertiserId, r.question_id, r.answer]
      );
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getResponsesByPublisher(
  publisherId: string
): Promise<SignupQuestionResponseRecord[]> {
  const result = await query<SignupQuestionResponseRecord>(
    `SELECT sqr.question_id, sq.question_text, sq.field_type, sqr.answer
     FROM signup_question_responses sqr
     JOIN signup_questions sq ON sq.id = sqr.question_id
     WHERE sqr.publisher_id = $1
     ORDER BY sq.sort_order ASC, sqr.question_id ASC`,
    [publisherId]
  );
  return result.rows;
}
