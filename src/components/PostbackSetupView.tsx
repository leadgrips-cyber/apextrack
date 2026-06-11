import React, { useState, useEffect, useCallback } from "react";
import {
  Radio, RefreshCw, Play, Code, CheckCircle,
  Trash2, Edit2, X, Plus, AlertCircle,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import * as postbackApi from "../services/publisherPostbacks";
import type { PublisherPostback } from "../services/publisherPostbacks";

interface PostbackSetupViewProps {
  offers: any[];
}

export function PostbackSetupView({ offers }: PostbackSetupViewProps) {
  const [postbacks, setPostbacks] = useState<PublisherPostback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // create form
  const [createUrl, setCreateUrl] = useState("");
  const [createOfferId, setCreateOfferId] = useState("");
  const [createActive, setCreateActive] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editOfferId, setEditOfferId] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // test tool
  const [testUrl, setTestUrl] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testLog, setTestLog] = useState<string[]>([]);

  const TOKEN_LIST = [
    "{click_id}", "{offer_id}", "{publisher_id}",
    "{payout}", "{revenue}", "{status}",
    "{sub1}", "{sub2}", "{sub3}", "{sub4}", "{sub5}",
  ];

  const loadPostbacks = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await postbackApi.listPostbacks();
      setPostbacks(data);
    } catch (err: any) {
      setLoadError(err.message || "Failed to load postbacks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPostbacks();
  }, [loadPostbacks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createUrl.trim()) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      const payload: postbackApi.CreatePostbackPayload = {
        callback_url: createUrl.trim(),
        is_active: createActive,
      };
      if (createOfferId) payload.offer_id = Number(createOfferId);
      const created = await postbackApi.createPostback(payload);
      setPostbacks(prev => [created, ...prev]);
      setCreateUrl("");
      setCreateOfferId("");
      setCreateActive(true);
    } catch (err: any) {
      setCreateError(err.message || "Failed to create postback");
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (pb: PublisherPostback) => {
    setEditingId(pb.id);
    setEditUrl(pb.callback_url);
    setEditOfferId(pb.offer_id != null ? String(pb.offer_id) : "");
    setEditActive(pb.is_active);
    setEditError(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editUrl.trim()) return;
    setIsSaving(true);
    setEditError(null);
    try {
      const payload: postbackApi.UpdatePostbackPayload = {
        callback_url: editUrl.trim(),
        offer_id: editOfferId ? Number(editOfferId) : null,
        is_active: editActive,
      };
      const updated = await postbackApi.updatePostback(id, payload);
      setPostbacks(prev => prev.map(pb => pb.id === id ? updated : pb));
      setEditingId(null);
    } catch (err: any) {
      setEditError(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (pb: PublisherPostback) => {
    try {
      const updated = await postbackApi.updatePostback(pb.id, { is_active: !pb.is_active });
      setPostbacks(prev => prev.map(p => p.id === pb.id ? updated : p));
    } catch {
      // leave state unchanged on failure
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await postbackApi.deletePostback(id);
      setPostbacks(prev => prev.filter(pb => pb.id !== id));
    } catch {
      await loadPostbacks();
    } finally {
      setDeletingId(null);
    }
  };

  const handleFireTest = async () => {
    if (!testUrl.trim()) return;
    setIsTesting(true);
    const ts = () => new Date().toTimeString().split(" ")[0];
    setTestLog(prev => [`[${ts()}] → ${testUrl}`, ...prev]);
    try {
      const resp = await fetch(testUrl, { method: "GET" });
      const body = (await resp.text()).slice(0, 300);
      setTestLog(prev => [
        `[${ts()}] Body: ${body}`,
        `[${ts()}] ${resp.status} ${resp.statusText}`,
        ...prev,
      ]);
    } catch (err: any) {
      setTestLog(prev => [`[${ts()}] ERROR: ${String(err)}`, ...prev]);
    } finally {
      setIsTesting(false);
    }
  };

  const offerLabel = (offerId: number | null) => {
    if (offerId == null) return "All Offers (Global)";
    const o = offers.find(o => Number(o.id) === offerId);
    return o ? `#${offerId} – ${o.name}` : `Offer #${offerId}`;
  };

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="postback-setup-view">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-950 tracking-tight flex items-center gap-1.5">
            <Radio className="w-5 h-5 text-cyan-500" />
            Publisher Postback Configuration
          </h2>
          <p className="text-sm text-slate-600">
            S2S callback URLs that fire when a conversion is recorded for your traffic.
          </p>
        </div>
        <div className="bg-slate-50 px-2.5 py-1 rounded text-[10px] text-slate-600 font-mono border border-slate-200 shrink-0">
          {isLoading ? "loading..." : `${postbacks.length} configured`}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: create form + list */}
        <div className="lg:col-span-7 space-y-6">

          {/* Create form */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-slate-950 text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1">
              <Plus className="w-4 h-4 text-cyan-500" />
              Add Postback URL
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              {createError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-600 font-mono mb-1">
                  Offer — optional, leave blank to apply to all offers
                </label>
                <select
                  value={createOfferId}
                  onChange={e => setCreateOfferId(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
                >
                  <option value="">All Offers (Global)</option>
                  {offers.map(o => (
                    <option key={o.id} value={o.id}>#{o.id} – {o.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-600 font-mono mb-1">
                  Callback URL
                </label>
                <textarea
                  value={createUrl}
                  onChange={e => setCreateUrl(e.target.value)}
                  rows={3}
                  placeholder="https://your-tracker.com/postback?click_id={click_id}&payout={payout}&status={status}"
                  className="block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="create-active"
                  type="checkbox"
                  checked={createActive}
                  onChange={e => setCreateActive(e.target.checked)}
                  className="w-4 h-4 accent-cyan-600"
                />
                <label htmlFor="create-active" className="text-xs text-slate-700">
                  Active — fire on conversions immediately
                </label>
              </div>

              <button
                type="submit"
                disabled={isCreating || !createUrl.trim()}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl uppercase tracking-wider text-xs transition select-none flex items-center justify-center gap-2"
              >
                {isCreating
                  ? <RefreshCw className="w-3 h-3 animate-spin" />
                  : <Plus className="w-3 h-3" />}
                {isCreating ? "Creating..." : "Create Postback"}
              </button>
            </form>
          </div>

          {/* Postback list */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-slate-950 text-xs font-bold uppercase font-mono tracking-wider">
                Configured Postbacks
              </h3>
            </div>

            {isLoading ? (
              <div className="px-6 py-8 text-center text-xs text-slate-500 font-mono flex items-center justify-center gap-2">
                <RefreshCw className="w-3 h-3 animate-spin" /> Loading...
              </div>
            ) : loadError ? (
              <div className="px-6 py-5 text-xs text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {loadError}
              </div>
            ) : postbacks.length === 0 ? (
              <div className="px-6 py-8 text-center text-xs text-slate-400 font-mono">
                No postbacks configured. Add one above.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {postbacks.map(pb => (
                  <div key={pb.id} className="px-6 py-4">
                    {editingId === pb.id ? (
                      <div className="space-y-3">
                        {editError && (
                          <div className="text-xs text-rose-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {editError}
                          </div>
                        )}
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 font-mono uppercase mb-1">Offer</label>
                          <select
                            value={editOfferId}
                            onChange={e => setEditOfferId(e.target.value)}
                            className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs"
                          >
                            <option value="">All Offers (Global)</option>
                            {offers.map(o => (
                              <option key={o.id} value={o.id}>#{o.id} – {o.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 font-mono uppercase mb-1">Callback URL</label>
                          <textarea
                            value={editUrl}
                            onChange={e => setEditUrl(e.target.value)}
                            rows={2}
                            className="block w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-mono focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id={`edit-active-${pb.id}`}
                            type="checkbox"
                            checked={editActive}
                            onChange={e => setEditActive(e.target.checked)}
                            className="w-3 h-3 accent-cyan-600"
                          />
                          <label htmlFor={`edit-active-${pb.id}`} className="text-xs text-slate-600">Active</label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(pb.id)}
                            disabled={isSaving}
                            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                          >
                            {isSaving
                              ? <RefreshCw className="w-3 h-3 animate-spin" />
                              : <CheckCircle className="w-3 h-3" />}
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="border border-slate-200 text-slate-600 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-slate-900">
                              {offerLabel(pb.offer_id)}
                            </span>
                            {pb.is_active ? (
                              <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            ) : (
                              <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono text-slate-500 break-all leading-relaxed">
                            {pb.callback_url}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleToggleActive(pb)}
                            title={pb.is_active ? "Deactivate" : "Activate"}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition"
                          >
                            {pb.is_active
                              ? <ToggleRight className="w-4 h-4 text-emerald-600" />
                              : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                          </button>
                          <button
                            onClick={() => startEdit(pb)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-cyan-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(pb.id)}
                            disabled={deletingId === pb.id}
                            className="p-1.5 rounded-lg hover:bg-rose-50 transition disabled:opacity-40"
                            title="Delete"
                          >
                            {deletingId === pb.id
                              ? <RefreshCw className="w-4 h-4 text-rose-400 animate-spin" />
                              : <Trash2 className="w-4 h-4 text-rose-500" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: tokens + test tool */}
        <div className="lg:col-span-5 space-y-6">

          {/* Token reference */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-slate-950 text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1">
              <Code className="w-4 h-4 text-cyan-500" />
              Postback Token Reference
            </h3>
            <div className="flex flex-wrap gap-2">
              {TOKEN_LIST.map(t => (
                <div
                  key={t}
                  className="bg-slate-100 border border-slate-200 px-3 py-1 rounded font-mono text-cyan-700 text-[11px]"
                >
                  {t}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Tokens are replaced at delivery time with live conversion values.
              Global postbacks (no offer selected) fire for every conversion from your traffic.
            </p>
          </div>

          {/* Test tool */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-slate-950 text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1">
              <Play className="w-4 h-4 text-cyan-500" />
              Postback Test Tool
            </h3>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-600 font-mono mb-1">
                Test URL (with tokens manually replaced)
              </label>
              <textarea
                value={testUrl}
                onChange={e => setTestUrl(e.target.value)}
                rows={3}
                placeholder="https://your-tracker.com/postback?click_id=TEST123&payout=5.00&status=approved"
                className="block w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handleFireTest}
              disabled={isTesting || !testUrl.trim()}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold font-mono tracking-wider text-xs uppercase flex items-center justify-center gap-2 transition select-none cursor-pointer"
            >
              {isTesting
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <Play className="w-4 h-4" />}
              {isTesting ? "Firing..." : "Fire Test Request"}
            </button>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded max-h-48 overflow-y-auto font-mono text-[11px] text-slate-700">
              {testLog.length === 0
                ? <div className="text-slate-500 italic">[No test activity yet]</div>
                : testLog.map((l, i) => <div key={i} className="mb-1">{l}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
