import * as repo from "../repositories/signup-questions.repository.js";
import {
  CreateQuestionPayload,
  FieldType,
  QuestionTargetRole,
  QuestionResponseInput,
  UpdateQuestionPayload,
} from "../types/signup-questions.js";

const VALID_FIELD_TYPES: FieldType[] = ['text', 'textarea', 'select', 'radio', 'checkbox'];
const VALID_ROLES: QuestionTargetRole[] = ['publisher', 'advertiser', 'both'];
const CHOICE_TYPES: FieldType[] = ['select', 'radio', 'checkbox'];

function validate(p: Partial<CreateQuestionPayload>, requireAll: boolean) {
  if (requireAll) {
    if (!p.question_text?.trim()) throw new Error('question_text is required');
    if (!p.field_type)            throw new Error('field_type is required');
    if (!p.target_role)           throw new Error('target_role is required');
  }
  if (p.field_type && !VALID_FIELD_TYPES.includes(p.field_type)) {
    throw new Error(`field_type must be one of: ${VALID_FIELD_TYPES.join(', ')}`);
  }
  if (p.target_role && !VALID_ROLES.includes(p.target_role)) {
    throw new Error(`target_role must be one of: ${VALID_ROLES.join(', ')}`);
  }
  if (p.field_type && CHOICE_TYPES.includes(p.field_type)) {
    if (!p.options_json || p.options_json.length < 2) {
      throw new Error(`options_json must have at least 2 options for field_type '${p.field_type}'`);
    }
  }
}

export async function listAll() {
  return repo.listAllQuestions();
}

export async function listPublic(role: 'publisher' | 'advertiser') {
  return repo.listPublicQuestions(role);
}

export async function create(payload: CreateQuestionPayload) {
  validate(payload, true);
  return repo.createQuestion({
    question_text: payload.question_text.trim(),
    field_type:    payload.field_type,
    target_role:   payload.target_role,
    is_required:   payload.is_required ?? false,
    sort_order:    payload.sort_order  ?? 0,
    is_active:     payload.is_active   ?? true,
    options_json:  payload.options_json ?? null,
  });
}

export async function update(id: number, payload: UpdateQuestionPayload) {
  validate(payload, false);
  const updated = await repo.updateQuestion(id, payload);
  if (!updated) throw new Error('Question not found');
  return updated;
}

export async function remove(id: number) {
  const deleted = await repo.deleteQuestion(id);
  if (!deleted) throw new Error('Question not found');
}

export async function submitResponses(
  publisherId: string | undefined,
  advertiserId: string | undefined,
  responses: QuestionResponseInput[]
) {
  if (!publisherId && !advertiserId) {
    throw new Error('Either publisher_id or advertiser_id is required');
  }
  if (publisherId && advertiserId) {
    throw new Error('Provide only one of publisher_id or advertiser_id');
  }
  if (!Array.isArray(responses) || responses.length === 0) return;

  await repo.saveResponses(publisherId ?? null, advertiserId ?? null, responses);
}
