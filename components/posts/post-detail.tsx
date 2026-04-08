"use client";

import { useState, useEffect } from "react";

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

interface Rewrite {
  id: string;
  content: string;
  nicheCustom: string | null;
  createdAt: string;
  nicheProfile: NicheProfile | null;
}

interface Post {
  id: string;
  text: string;
  likes: number;
  shares: number;
  comments: number;
  pageName: string;
  sourceUrl: string;
  postUrl: string | null;
  postDate: string | null;
  analysis: string | null;
  rewrittenContent: string | null;
  nicheProfile: NicheProfile | null;
  nicheCustom: string | null;
  rewrites: Rewrite[];
  createdAt: string;
}

interface Analysis {
  hookAnalysis: string;
  emotionTriggers: string[];
  contentFormat: string;
  ctaAnalysis: string;
  viralScore: number;
  summary: string;
}

export function PostDetail({ post }: { post: Post }) {
  const [analysis, setAnalysis] = useState<Analysis | null>(
    post.analysis ? JSON.parse(post.analysis) : null
  );
  const [rewrittenContent, setRewrittenContent] = useState(
    post.rewrittenContent || ""
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [nicheProfiles, setNicheProfiles] = useState<NicheProfile[]>([]);
  const [selectedNiche, setSelectedNiche] = useState("");
  const [nicheCustom, setNicheCustom] = useState("");

  useEffect(() => {
    fetch("/api/niche-profiles")
      .then((r) => r.json())
      .then((d) => setNicheProfiles(d.profiles || []))
      .catch(() => {});
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Loi phan tich");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRewrite = async () => {
    setRewriting(true);
    setError("");
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          nicheProfileId: selectedNiche || undefined,
          nicheCustom: !selectedNiche ? nicheCustom || undefined : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRewrittenContent(data.rewrittenContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Loi viet lai");
    } finally {
      setRewriting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rewrittenContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl">
      <a
        href="/posts"
        className="text-sm text-white/40 hover:text-white/60 mb-4 inline-block"
      >
        &larr; Quay lai danh sach
      </a>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Likes", value: post.likes },
          { label: "Shares", value: post.shares },
          { label: "Comments", value: post.comments },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-[#111827] border border-white/10 rounded-xl p-4 text-center"
          >
            <p className="text-2xl font-bold">{m.value.toLocaleString()}</p>
            <p className="text-sm text-white/40">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Original post */}
      <div className="bg-[#111827] border border-white/10 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Bai viet goc</h2>
          <span className="text-xs text-white/30">{post.pageName}</span>
        </div>
        <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
          {post.text}
        </p>
        {post.postUrl && (
          <a
            href={post.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm mt-3 inline-block"
          >
            Xem bai goc
          </a>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Viral analysis */}
      <div className="bg-[#111827] border border-white/10 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Phan tich Viral</h2>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            {analyzing
              ? "Dang phan tich..."
              : analysis
              ? "Phan tich lai"
              : "Phan tich"}
          </button>
        </div>

        {analyzing && (
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white/20 border-t-blue-400 rounded-full" />
            AI dang phan tich bai viet...
          </div>
        )}

        {analysis && !analyzing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-blue-400">
                {analysis.viralScore}
              </span>
              <span className="text-sm text-white/40">Diem Viral</span>
            </div>

            <div>
              <p className="text-sm font-medium text-white/60 mb-1">
                Phan tich Hook
              </p>
              <p className="text-sm text-white/80">{analysis.hookAnalysis}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-white/60 mb-1">
                Cam xuc kich hoat
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.emotionTriggers.map((e, i) => (
                  <span
                    key={i}
                    className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-white/60 mb-1">
                Dinh dang noi dung
              </p>
              <p className="text-sm text-white/80">{analysis.contentFormat}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-white/60 mb-1">
                Phan tich CTA
              </p>
              <p className="text-sm text-white/80">{analysis.ctaAnalysis}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-white/60 mb-1">
                Tom tat
              </p>
              <p className="text-sm text-white/80">{analysis.summary}</p>
            </div>
          </div>
        )}
      </div>

      {/* Rewrite section */}
      <div className="bg-[#111827] border border-white/10 rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">Viet lai theo ngach</h2>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">
              Chon ngach co san
            </label>
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="">-- Khong chon --</option>
              {nicheProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {!selectedNiche && (
            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Hoac nhap ngach tu do
              </label>
              <input
                type="text"
                value={nicheCustom}
                onChange={(e) => setNicheCustom(e.target.value)}
                placeholder="VD: Bat dong san, Lam dep, Giao duc..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          )}

          <button
            onClick={handleRewrite}
            disabled={rewriting}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            {rewriting ? "Dang viet lai..." : "Viet lai bai viet"}
          </button>
        </div>

        {rewriting && (
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white/20 border-t-blue-400 rounded-full" />
            AI dang viet lai bai viet...
          </div>
        )}

        {rewrittenContent && !rewriting && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white/60">Ket qua</p>
              <button
                onClick={handleCopy}
                className="bg-white/10 hover:bg-white/15 text-white rounded-lg px-3 py-1.5 text-xs transition-colors"
              >
                {copied ? "Da sao chep!" : "Sao chep"}
              </button>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-white/80 whitespace-pre-wrap leading-relaxed text-sm">
                {rewrittenContent}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Rewrite history */}
      {post.rewrites.length > 0 && (
        <div className="bg-[#111827] border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-4">
            Lich su viet lai ({post.rewrites.length})
          </h2>
          <div className="space-y-3">
            {post.rewrites.map((r) => (
              <div
                key={r.id}
                className="bg-white/5 rounded-lg p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-white/30">
                    {new Date(r.createdAt).toLocaleString("vi-VN")}
                  </span>
                  {r.nicheProfile && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                      {r.nicheProfile.name}
                    </span>
                  )}
                  {r.nicheCustom && (
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">
                      {r.nicheCustom}
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/70 whitespace-pre-wrap line-clamp-4">
                  {r.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
