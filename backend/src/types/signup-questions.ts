export type FieldType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
export type QuestionTargetRole = 'publisher' | 'advertiser' | 'both';

export interface SignupQuestionRecord {
  id: number;
  question_text: string;
  field_type: FieldType;
  target_role: QuestionTargetRole;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
  options_json: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestionPayload {
  question_text: string;
  field_type: FieldType;
  target_role: QuestionTargetRole;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
  options_json?: string[] | null;
}

export interface UpdateQuestionPayload {
  question_text?: string;
  field_type?: FieldType;
  target_role?: QuestionTargetRole;
  is_required?: boolean;
  sort_order?: number;
  is_active?: boolean;
  options_json?: string[] | null;
}

export interface QuestionResponseInput {
  question_id: number;
  answer: string;
}

export interface SubmitResponsesPayload {
  publisher_id?: string;
  advertiser_id?: string;
  responses: QuestionResponseInput[];
}
