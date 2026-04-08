"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  name: string;
  email: string;
}

const navItems = [
  { href: "/", label: "Tong quan", icon: "\u{1F3E0}" },
  { href: "/scrape", label: "Quet Viral", icon: "\u{1F50D}" },
  { href: "/posts", label: "Bai viet", icon: "\u{1F4DD}" },
  { href: "/niche-profiles", label: "Ngach viet", icon: "\u{1F3AF}" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-60 bg-[#0d1120] border-r border-white/10 flex flex-col z-50">
      <div className="p-5 border-b border-white/10">
        <h1 className="font-bold text-lg text-blue-400">
          Thong Tri Facebook
        </h1>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        {user && (
          <div className="mb-3">
            <p className="text-sm font-medium text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-white/40 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full text-sm text-white/50 hover:text-white py-2 px-3 rounded-lg hover:bg-white/5 transition-colors text-left"
        >
          Dang xuat
        </button>
      </div>
    </aside>
  );
}
