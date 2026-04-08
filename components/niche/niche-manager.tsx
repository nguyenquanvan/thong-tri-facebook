"use client";

import { useState, useEffect, useCallback } from "react";

interface NicheProfile {
  id: string;
  name: string;
  description: string;
  toneOfVoice: string | null;
  keywords: string | null;
  bannedWords: string | null;
  desiredLength: string | null;
  ctaTemplate: string | null;
  createdAt: string;
}

interface FormData {
  name: string;
  description: string;
  toneOfVoice: string;
  keywords: string;
  bannedWords: string;
  desiredLength: string;
  ctaTemplate: string;
}

const emptyForm: FormData = {
  name: "",
  description: "",
  toneOfVoice: "",
  keywords: "",
  bannedWords: "",
  desiredLength: "",
  ctaTemplate: "",
};

export function NicheManager() {
  const [profiles, setProfiles] = useState<NicheProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchProfiles = useCallback(async () => {
    try {
      const res = await fetch("/api/niche-profiles");
      const data = await res.json();
      setProfiles(data.profiles || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = editingId
        ? `/api/niche-profiles/${editingId}`
        : "/api/niche-profiles";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await fetchProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Loi luu ngach");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (profile: NicheProfile) => {
    setEditingId(profile.id);
    setForm({
      name: profile.name,
      description: profile.description,
      toneOfVoice: profile.toneOfVoice || "",
      keywords: profile.keywords || "",
      bannedWords: profile.bannedWords || "",
      desiredLength: profile.desiredLength || "",
      ctaTemplate: profile.ctaTemplate || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Ban co chac muon xoa ngach nay?")) return;

    try {
      const res = await fetch(`/api/niche-profiles/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      await fetchProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Loi xoa ngach");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="text-white/40">Dang tai...</div>;
  }

  return (
    <div>
      {!showForm && (
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyForm);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors mb-6"
        >
          Them moi
        </button>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="bg-[#111827] border border-white/10 rounded-xl p-5 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Chinh sua ngach" : "Them ngach moi"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  Ten ngach *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                  placeholder="VD: Bat dong san"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  Giong van
                </label>
                <input
                  type="text"
                  value={form.toneOfVoice}
                  onChange={(e) => updateField("toneOfVoice", e.target.value)}
                  placeholder="VD: Chuyen nghiep, than thien"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Mo ta *
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                required
                rows={2}
                placeholder="Mo ta ve ngach noi dung nay"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  Tu khoa
                </label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => updateField("keywords", e.target.value)}
                  placeholder="Phan cach bang dau phay"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  Tu cam
                </label>
                <input
                  type="text"
                  value={form.bannedWords}
                  onChange={(e) => updateField("bannedWords", e.target.value)}
                  placeholder="Tu khong duoc su dung"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  Do dai mong muon
                </label>
                <input
                  type="text"
                  value={form.desiredLength}
                  onChange={(e) => updateField("desiredLength", e.target.value)}
                  placeholder="VD: 200-500 tu"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  CTA mau
                </label>
                <input
                  type="text"
                  value={form.ctaTemplate}
                  onChange={(e) => updateField("ctaTemplate", e.target.value)}
                  placeholder="VD: Lien he ngay de nhan uu dai"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                {saving ? "Dang luu..." : editingId ? "Cap nhat" : "Tao moi"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-white/10 hover:bg-white/15 text-white rounded-lg px-4 py-2 text-sm transition-colors"
              >
                Huy
              </button>
            </div>
          </form>
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="bg-[#111827] border border-white/10 rounded-xl p-8 text-center text-white/40">
          Chua co ngach nao. Tao ngach dau tien de bat dau!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-[#111827] border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{profile.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(profile)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Sua
                  </button>
                  <button
                    onClick={() => handleDelete(profile.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Xoa
                  </button>
                </div>
              </div>
              <p className="text-sm text-white/60 mb-3">
                {profile.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.toneOfVoice && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                    {profile.toneOfVoice}
                  </span>
                )}
                {profile.keywords && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                    {profile.keywords}
                  </span>
                )}
                {profile.desiredLength && (
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                    {profile.desiredLength}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
