"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  text: string;
  likes: number;
  shares: number;
  comments: number;
  pageName: string;
  postDate: string | null;
  createdAt: string;
  analysis: string | null;
  rewrittenContent: string | null;
}

interface Source {
  sourceUrl: string;
  pageName: string;
}

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
      sortBy,
    });
    if (search) params.set("search", search);
    if (sourceFilter) params.set("sourceUrl", sourceFilter);

    try {
      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [offset, search, sourceFilter, sortBy]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetch("/api/posts/sources")
      .then((r) => r.json())
      .then((d) => setSources(d.sources || []))
      .catch(() => {});
  }, []);

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bai viet</h1>

      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOffset(0);
          }}
          placeholder="Tim kiem bai viet..."
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 w-64"
        />

        <select
          value={sourceFilter}
          onChange={(e) => {
            setSourceFilter(e.target.value);
            setOffset(0);
          }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
        >
          <option value="">Tat ca nguon</option>
          {sources.map((s) => (
            <option key={s.sourceUrl} value={s.sourceUrl}>
              {s.pageName}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500/50"
        >
          <option value="createdAt">Moi nhat</option>
          <option value="likes">Nhieu like</option>
          <option value="shares">Nhieu share</option>
          <option value="comments">Nhieu comment</option>
        </select>
      </div>

      <div className="bg-[#111827] border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/40">Dang tai...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-white/40">
            Chua co bai viet nao.{" "}
            <a href="/scrape" className="text-blue-400 hover:underline">
              Quet bai viet moi
            </a>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-sm text-white/50">
                <th className="px-4 py-3">Noi dung</th>
                <th className="px-4 py-3 w-20 text-right">Likes</th>
                <th className="px-4 py-3 w-20 text-right">Shares</th>
                <th className="px-4 py-3 w-24 text-right">Comments</th>
                <th className="px-4 py-3 w-28">Nguon</th>
                <th className="px-4 py-3 w-24">Trang thai</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  onClick={() => router.push(`/posts/${post.id}`)}
                  className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm line-clamp-2">
                      {post.text.slice(0, 120)}
                      {post.text.length > 120 ? "..." : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-white/70">
                    {post.likes.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-white/70">
                    {post.shares.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-white/70">
                    {post.comments.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-white/40 truncate block max-w-[100px]">
                      {post.pageName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {post.analysis && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                          PT
                        </span>
                      )}
                      {post.rewrittenContent && (
                        <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                          VL
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-white/40">
            Trang {currentPage} / {totalPages} ({total} bai viet)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="bg-white/10 hover:bg-white/15 disabled:opacity-30 text-white rounded-lg px-3 py-1.5 text-sm transition-colors"
            >
              Truoc
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="bg-white/10 hover:bg-white/15 disabled:opacity-30 text-white rounded-lg px-3 py-1.5 text-sm transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
