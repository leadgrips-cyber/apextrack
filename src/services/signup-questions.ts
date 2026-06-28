const API_URL = "/api";

function adminHeaders() {
  const token = localStorage.getItem("admin_token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface SignupQuestion {
  id: number;
  question_text: string;
  field_type: "text" | "textarea" | "select" | "radio" | "checkbox";
  target_role: "publisher" | "advertiser" | "both";
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
  options_json: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestionPayload {
  question_text: string;
  field_type: SignupQuestion["field_type"];
  target_role: SignupQuestion["target_role"];
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
  options_json?: string[] | null;
}

// ── Public ─────────────────────────────────────────────────────────────────

export async function loadSignupQuestions(
  role: "publisher" | "advertiser"
): Promise<SignupQuestion[]> {
  const res = await fetch(
    `${API_URL}/signup-questions/public?role=${role}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.questions ?? []) as SignupQuestion[];
}

export async function submitSignupResponses(payload: {
  publisher_id?: string;
  advertiser_id?: string;
  responses: Array<{ question_id: number; answer: string }>;
}): Promise<void> {
  const res = await fetch(`${API_URL}/signup-questions/responses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as { message?: string }).message ||
        `Failed to save signup responses (HTTP ${res.status})`
    );
  }
}

// ── Admin ───────────────────────────────────────────────────────────────────

export interface SignupQuestionResponse {
  question_id: number;
  question_text: string;
  field_type: string;
  answer: string;
}

export async function getPublisherSignupResponses(
  publisherId: string
): Promise<SignupQuestionResponse[]> {
  const res = await fetch(`${API_URL}/signup-questions/publisher/${publisherId}`, {
    headers: adminHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as { message?: string }).message ||
        `Failed to load signup responses (HTTP ${res.status})`
    );
  }
  const data = await res.json();
  return (data.responses ?? []) as SignupQuestionResponse[];
}

export async function listSignupQuestions(): Promise<SignupQuestion[]> {
  const res = await fetch(`${API_URL}/signup-questions`, {
    headers: adminHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `Failed to load signup questions (HTTP ${res.status})`);
  }
  const data = await res.json();
  return (data.questions ?? []) as SignupQuestion[];
}

export async function createSignupQuestion(
  payload: CreateQuestionPayload
): Promise<SignupQuestion> {
  const res = await fetch(`${API_URL}/signup-questions`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create question");
  return data.question as SignupQuestion;
}

export async function updateSignupQuestion(
  id: number,
  payload: Partial<CreateQuestionPayload>
): Promise<SignupQuestion> {
  const res = await fetch(`${API_URL}/signup-questions/${id}`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update question");
  return data.question as SignupQuestion;
}

export async function deleteSignupQuestion(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/signup-questions/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || "Failed to delete question");
  }
}
