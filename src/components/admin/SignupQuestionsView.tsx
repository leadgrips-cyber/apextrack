import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ClipboardList } from "lucide-react";
import {
  listSignupQuestions,
  createSignupQuestion,
  updateSignupQuestion,
  deleteSignupQuestion,
  type SignupQuestion,
  type CreateQuestionPayload,
} from "../../services/signup-questions";

type FieldType = SignupQuestion["field_type"];
type TargetRole = SignupQuestion["target_role"];

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text",     label: "Short Text" },
  { value: "textarea", label: "Long Text (Textarea)" },
  { value: "select",   label: "Dropdown (Select)" },
  { value: "radio",    label: "Single Choice (Radio)" },
  { value: "checkbox", label: "Multiple Choice (Checkbox)" },
];

const ROLES: { value: TargetRole; label: string }[] = [
  { value: "publisher", label: "Publisher Signup" },
  { value: "advertiser", label: "Advertiser Signup" },
  { value: "both", label: "Both" },
];

const CHOICE_TYPES: FieldType[] = ["select", "radio", "checkbox"];

interface FormState {
  question_text: string;
  field_type: FieldType;
  target_role: TargetRole;
  is_required: boolean;
  sort_order: number;
  is_active: boolean;
  options_text: string;
}

const EMPTY_FORM: FormState = {
  question_text: "",
  field_type: "text",
  target_role: "publisher",
  is_required: false,
  sort_order: 0,
  is_active: true,
  options_text: "",
};

function parseOptions(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function formToPayload(f: FormState): CreateQuestionPayload {
  return {
    question_text: f.question_text.trim(),
    field_type: f.field_type,
    target_role: f.target_role,
    is_required: f.is_required,
    sort_order: f.sort_order,
    is_active: f.is_active,
    options_json: CHOICE_TYPES.includes(f.field_type) ? parseOptions(f.options_text) : null,
  };
}

function questionToForm(q: SignupQuestion): FormState {
  return {
    question_text: q.question_text,
    field_type: q.field_type,
    target_role: q.target_role,
    is_required: q.is_required,
    sort_order: q.sort_order,
    is_active: q.is_active,
    options_text: (q.options_json ?? []).join("\n"),
  };
}

const roleLabel: Record<TargetRole, string> = {
  publisher: "Publisher",
  advertiser: "Advertiser",
  both: "Both",
};

const typeBadge: Record<FieldType, string> = {
  text: "bg-blue-100 text-blue-700",
  textarea: "bg-purple-100 text-purple-700",
  select: "bg-amber-100 text-amber-700",
  radio: "bg-cyan-100 text-cyan-700",
  checkbox: "bg-emerald-100 text-emerald-700",
};

export function SignupQuestionsView() {
  const [questions, setQuestions] = useState<SignupQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    listSignupQuestions()
      .then(setQuestions)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load questions"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (q: SignupQuestion) => {
    setEditingId(q.id);
    setForm(questionToForm(q));
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError(null);
  };

  const handleSave = async () => {
    setFormError(null);
    if (!form.question_text.trim()) { setFormError("Question text is required."); return; }
    if (CHOICE_TYPES.includes(form.field_type) && parseOptions(form.options_text).length < 2) {
      setFormError("At least 2 options are required for this field type."); return;
    }
    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (editingId !== null) {
        const updated = await updateSignupQuestion(editingId, payload);
        setQuestions((prev) => prev.map((q) => (q.id === editingId ? updated : q)));
      } else {
        const created = await createSignupQuestion(payload);
        setQuestions((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id));
      }
      closeModal();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (q: SignupQuestion) => {
    try {
      const updated = await updateSignupQuestion(q.id, { is_active: !q.is_active });
      setQuestions((prev) => prev.map((x) => (x.id === q.id ? updated : x)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to toggle question");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSignupQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setDeleteConfirmId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete question");
    }
  };

  const needsOptions = CHOICE_TYPES.includes(form.field_type);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Settings</div>
          <div className="mt-2 text-2xl font-black theme-text-main">Signup Questions</div>
          <p className="mt-1 text-sm theme-text-muted">
            Custom questions shown to publishers and advertisers during signup. Disabled questions are hidden.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-sm text-rose-700">
          <strong>Error:</strong> {error}
          {error.includes("does not exist") && (
            <p className="mt-1 text-xs text-rose-600">
              Run <code className="bg-rose-100 px-1 rounded">npm run migrate</code> in the backend directory to apply missing migrations.
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="theme-bg-card border theme-border rounded-3xl p-8 text-center text-sm theme-text-muted">
          Loading questions…
        </div>
      ) : questions.length === 0 ? (
        <div className="theme-bg-card border theme-border rounded-3xl p-12 text-center">
          <ClipboardList className="w-10 h-10 theme-text-muted mx-auto mb-3" />
          <p className="text-sm font-semibold theme-text-muted">No signup questions yet.</p>
          <p className="text-xs theme-text-muted mt-1">Click "Add Question" to create the first one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {["#", "Question", "Type", "Target", "Required", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-[10px] uppercase tracking-widest theme-text-secondary font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {questions.map((q) => (
                <tr key={q.id} className={`hover:bg-slate-50 dark:hover:bg-slate-900 ${!q.is_active ? "opacity-50" : ""}`}>
                  <td className="px-5 py-4 text-xs font-mono theme-text-muted w-10">{q.sort_order}</td>
                  <td className="px-5 py-4 max-w-xs">
                    <div className="font-semibold theme-text-main text-sm truncate">{q.question_text}</div>
                    {q.options_json && q.options_json.length > 0 && (
                      <div className="text-[10px] theme-text-muted mt-0.5 truncate">
                        Options: {q.options_json.join(", ")}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${typeBadge[q.field_type]}`}>
                      {q.field_type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs theme-text-secondary">{roleLabel[q.target_role]}</td>
                  <td className="px-5 py-4 text-xs">
                    {q.is_required ? (
                      <span className="text-rose-600 font-semibold">Yes</span>
                    ) : (
                      <span className="theme-text-muted">No</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggle(q)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold transition ${
                        q.is_active ? "text-emerald-600 hover:text-emerald-700" : "theme-text-muted hover:text-cyan-600"
                      }`}
                    >
                      {q.is_active ? (
                        <><ToggleRight className="w-4 h-4" /> Active</>
                      ) : (
                        <><ToggleLeft className="w-4 h-4" /> Inactive</>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    {deleteConfirmId === q.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-rose-600 font-semibold">Delete?</span>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="text-xs px-2 py-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xs px-2 py-1 border theme-border rounded-lg theme-text-secondary hover:theme-bg-well"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEdit(q)}
                          className="theme-text-secondary hover:text-cyan-600 transition"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(q.id)}
                          className="theme-text-secondary hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b theme-border sticky top-0 bg-white dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black theme-text-main">
                  {editingId !== null ? "Edit Question" : "Add Question"}
                </h2>
                <button onClick={closeModal} className="theme-text-muted hover:theme-text-main text-lg">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {formError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.18em] theme-text-muted mb-1.5">
                  Question Text <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={form.question_text}
                  onChange={(e) => setForm((f) => ({ ...f, question_text: e.target.value }))}
                  placeholder="e.g. What is your primary traffic source?"
                  className="w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.18em] theme-text-muted mb-1.5">
                    Field Type
                  </label>
                  <select
                    value={form.field_type}
                    onChange={(e) => setForm((f) => ({ ...f, field_type: e.target.value as FieldType, options_text: "" }))}
                    className="w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm theme-text-main focus:outline-none"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.18em] theme-text-muted mb-1.5">
                    Target
                  </label>
                  <select
                    value={form.target_role}
                    onChange={(e) => setForm((f) => ({ ...f, target_role: e.target.value as TargetRole }))}
                    className="w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm theme-text-main focus:outline-none"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {needsOptions && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.18em] theme-text-muted mb-1.5">
                    Options <span className="text-red-400">*</span>
                    <span className="ml-1 text-[10px] normal-case font-normal theme-text-muted">(one per line, min. 2)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={form.options_text}
                    onChange={(e) => setForm((f) => ({ ...f, options_text: e.target.value }))}
                    placeholder={"Option A\nOption B\nOption C"}
                    className="w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.18em] theme-text-muted mb-1.5">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))}
                  className="w-24 rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  min={0}
                />
                <p className="text-[10px] theme-text-muted mt-1">Lower numbers appear first.</p>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_required}
                    onChange={(e) => setForm((f) => ({ ...f, is_required: e.target.checked }))}
                    className="text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-sm theme-text-main font-semibold">Required</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    className="text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-sm theme-text-main font-semibold">Active</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-cyan-600 text-white rounded-xl text-sm font-semibold hover:bg-cyan-700 disabled:opacity-50"
                >
                  {saving ? "Saving…" : editingId !== null ? "Save Changes" : "Create Question"}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border theme-border theme-text-secondary rounded-xl text-sm font-semibold hover:theme-bg-well"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
