"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalPosts: number;
  analyzedPosts: number;
  rewrittenPosts: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalPosts: 0,
    analyzedPosts: 0,
    rewrittenPosts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts?limit=1")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStats({
            totalPosts: data.total || 0,
            analyzedPosts: data.analyzedCount || 0,
            rewrittenPosts: data.rewrittenCount || 0,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: "Tong bai viet",
      value: stats.totalPosts,
      desc: "Bai viet da quet",
    },
    {
      title: "Da phan tich",
      value: stats.analyzedPosts,
      desc: "Phan tich viral",
    },
    {
      title: "Da viet lai",
      value: stats.rewrittenPosts,
      desc: "Bai da rewrite",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Chao mung den Thong Tri Facebook
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-[#111827] border border-white/10 rounded-xl p-5"
          >
            <p className="text-sm text-white/50 mb-1">{card.title}</p>
            <p className="text-3xl font-bold">
              {loading ? "..." : card.value}
            </p>
            <p className="text-xs text-white/30 mt-2">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-[#111827] border border-white/10 rounded-xl p-5">
        <h2 className="text-lg font-semibold mb-3">Bat dau nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/scrape"
            className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <p className="font-medium">Quet bai viet moi</p>
            <p className="text-sm text-white/40 mt-1">
              Nhap URL fanpage de quet bai viet viral
            </p>
          </a>
          <a
            href="/posts"
            className="block p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <p className="font-medium">Xem bai viet</p>
            <p className="text-sm text-white/40 mt-1">
              Phan tich va viet lai bai viet da quet
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
