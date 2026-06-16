import { useEffect, useState } from "react";
import { Mail, MessageCircle, Phone, MessageSquare } from "lucide-react";
import { getManagerPublishers, type ManagerPublisher } from "../../services/managers";

interface Props {
  managerId: string;
}

export function ManagerCommunicationView({ managerId }: Props) {
  const [publishers, setPublishers] = useState<ManagerPublisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ManagerPublisher | null>(null);

  useEffect(() => {
    if (!managerId) return;
    setLoading(true);
    getManagerPublishers(managerId)
      .then((pubs) => {
        setPublishers(pubs);
        if (pubs.length > 0) setSelected(pubs[0]);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load publishers"))
      .finally(() => setLoading(false));
  }, [managerId]);

  const statusColor = (s: string) => {
    const u = s.toUpperCase();
    if (u === "ACTIVE") return "bg-emerald-100 text-emerald-700";
    if (u === "PENDING") return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-600";
  };

  const meta = (p: ManagerPublisher, key: string): string | null =>
    (p.profile_metadata?.[key] as string | undefined) ?? null;

  const telegramHandle = (p: ManagerPublisher) => {
    const t = meta(p, "telegram");
    return t ? t.replace(/^@/, "") : null;
  };

  const whatsappNumber = (p: ManagerPublisher) => {
    const w = meta(p, "whatsapp");
    return w ? w.replace(/[^0-9]/g, "") : null;
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Communication</div>
        <div className="mt-2 text-2xl font-black theme-text-main">Publisher Contacts</div>
        <p className="mt-1 text-sm theme-text-muted">Contact details for your assigned publishers.</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-sm text-rose-700">{error}</div>
      )}

      {loading ? (
        <div className="theme-bg-card border theme-border rounded-3xl p-8 text-center text-sm theme-text-muted">Loading…</div>
      ) : publishers.length === 0 ? (
        <div className="theme-bg-card border theme-border rounded-3xl p-8 text-center text-sm theme-text-muted">
          No publishers assigned to you yet.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Publisher list */}
          <div className="col-span-1 theme-bg-card border theme-border rounded-3xl p-4">
            <div className="text-sm font-semibold theme-text-main mb-3">Assigned Publishers</div>
            <div className="space-y-2">
              {publishers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    selected?.id === p.id
                      ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950"
                      : "theme-border theme-bg-well hover:border-cyan-300"
                  }`}
                >
                  <div className="text-sm font-semibold theme-text-main truncate">{p.full_name}</div>
                  <div className="text-xs font-mono theme-text-muted truncate">{p.email}</div>
                  <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-bold ${statusColor(p.account_status)}`}>
                    {p.account_status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact detail card */}
          <div className="col-span-2 theme-bg-card border theme-border rounded-3xl p-6">
            {selected ? (
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-100 flex items-center justify-center text-cyan-700 font-black text-lg shrink-0">
                    {selected.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold theme-text-main">{selected.full_name}</div>
                    {selected.company_name && (
                      <div className="text-xs theme-text-muted">{selected.company_name}</div>
                    )}
                    <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-bold ${statusColor(selected.account_status)}`}>
                      {selected.account_status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Email — always present */}
                  <div className="theme-bg-well border theme-border rounded-xl p-3">
                    <p className="text-xs theme-text-secondary mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </p>
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-sm font-mono text-cyan-600 hover:underline break-all"
                    >
                      {selected.email}
                    </a>
                  </div>

                  {/* Country */}
                  <div className="theme-bg-well border theme-border rounded-xl p-3">
                    <p className="text-xs theme-text-secondary mb-1">Country</p>
                    <p className="text-sm theme-text-main">{selected.country_code ?? "—"}</p>
                  </div>

                  {/* Telegram */}
                  {telegramHandle(selected) && (
                    <div className="theme-bg-well border theme-border rounded-xl p-3">
                      <p className="text-xs theme-text-secondary mb-1 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> Telegram
                      </p>
                      <a
                        href={`tg://resolve?domain=${telegramHandle(selected)}`}
                        className="text-sm text-cyan-600 hover:underline"
                      >
                        @{telegramHandle(selected)}
                      </a>
                    </div>
                  )}

                  {/* Skype — text only, no standard deep link */}
                  {meta(selected, "skype") && (
                    <div className="theme-bg-well border theme-border rounded-xl p-3">
                      <p className="text-xs theme-text-secondary mb-1">Skype</p>
                      <p className="text-sm theme-text-main">{meta(selected, "skype")}</p>
                    </div>
                  )}

                  {/* WhatsApp */}
                  {whatsappNumber(selected) && (
                    <div className="theme-bg-well border theme-border rounded-xl p-3">
                      <p className="text-xs theme-text-secondary mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> WhatsApp
                      </p>
                      <a
                        href={`https://wa.me/${whatsappNumber(selected)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-600 hover:underline"
                      >
                        {meta(selected, "whatsapp")}
                      </a>
                    </div>
                  )}

                  {/* Registered */}
                  <div className="theme-bg-well border theme-border rounded-xl p-3">
                    <p className="text-xs theme-text-secondary mb-1">Registered</p>
                    <p className="text-sm theme-text-main">{new Date(selected.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {meta(selected, "manager_notes") && (
                  <div className="theme-bg-well border theme-border rounded-xl p-4">
                    <p className="text-xs font-semibold theme-text-secondary mb-2 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Manager Notes
                    </p>
                    <p className="text-sm theme-text-main whitespace-pre-wrap">{meta(selected, "manager_notes")}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm theme-text-muted">Select a publisher to view their contact details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
