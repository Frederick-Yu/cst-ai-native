"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ShieldAlert, Menu, X, LogOut, LayoutDashboard, Building2, ScrollText } from "lucide-react";

const navLinks = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/customers", label: "고객사", icon: Building2 },
  { href: "/audit-logs", label: "감사 로그", icon: ScrollText },
];

export function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-14 w-full border-b border-stone-800 bg-stone-900">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-teal-400" aria-hidden="true" />
          <span className="font-semibold text-stone-100">CST</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="메인 내비게이션">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                pathname === href
                  ? "bg-stone-800 text-teal-400"
                  : "text-stone-400 hover:bg-stone-800 hover:text-stone-100"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop user */}
        <div className="hidden items-center gap-3 md:flex">
          <span className="text-sm text-stone-400">{session?.user?.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-stone-400 transition-colors hover:bg-stone-800 hover:text-rose-400"
            aria-label="로그아웃"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-md p-2 text-stone-400 hover:bg-stone-800 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="border-t border-stone-800 bg-stone-900 px-4 pb-4 md:hidden"
          aria-label="모바일 내비게이션"
        >
          <div className="flex flex-col gap-1 pt-2">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  pathname === href
                    ? "bg-stone-800 text-teal-400"
                    : "text-stone-400 hover:bg-stone-800 hover:text-stone-100"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-stone-400 transition-colors hover:bg-stone-800 hover:text-rose-400"
            >
              <LogOut className="size-4" aria-hidden="true" />
              로그아웃
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
