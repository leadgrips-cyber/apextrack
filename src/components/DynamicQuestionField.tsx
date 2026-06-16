import type { SignupQuestion } from "../services/signup-questions";

interface Props {
  question: SignupQuestion;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const baseCls =
  "w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 transition";

export function DynamicQuestionField({ question, value, onChange, disabled }: Props) {
  const opts = question.options_json ?? [];

  const toggleCheckbox = (option: string) => {
    const current = value ? value.split(", ").filter(Boolean) : [];
    const idx = current.indexOf(option);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(option);
    onChange(current.join(", "));
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-[0.18em] theme-text-muted">
        {question.question_text}
        {question.is_required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {question.field_type === "text" && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={baseCls}
          required={question.is_required}
        />
      )}

      {question.field_type === "textarea" && (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${baseCls} resize-none`}
          required={question.is_required}
        />
      )}

      {question.field_type === "select" && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={baseCls}
          required={question.is_required}
        >
          <option value="">— Select —</option>
          {opts.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {question.field_type === "radio" && (
        <div className="space-y-2 pt-0.5">
          {opts.map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                disabled={disabled}
                className="text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-sm theme-text-main">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {question.field_type === "checkbox" && (
        <div className="space-y-2 pt-0.5">
          {opts.map((opt) => {
            const checked = value ? value.split(", ").includes(opt) : false;
            return (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCheckbox(opt)}
                  disabled={disabled}
                  className="text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-sm theme-text-main">{opt}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
