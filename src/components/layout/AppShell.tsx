"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { PropsWithChildren } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/map", label: "Map Analysis" },
  { href: "/alerts", label: "Alert Center" },
  { href: "/about", label: "About" },
] as const;

function NavLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full px-3 py-1.5 text-sm transition",
        "hover:bg-white/10 hover:text-white",
        isActive
          ? "bg-white/10 text-white ring-1 ring-white/15"
          : "text-white/70",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-app text-app-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-app-gradient" />
        <div className="absolute inset-0 bg-app-grid opacity-50" />
        <div className="absolute -top-32 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-40 right-[-10%] h-[500px] w-[700px] rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/10 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
          <Link href="/" className="group flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)]" />
            <span className="text-sm font-semibold tracking-[0.22em] text-white/90">
              ASTRASENSE
            </span>
            <span className="hidden text-xs text-white/50 md:inline">
              Environmental Risk Intelligence
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                isActive={pathname === item.href}
              />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/80 backdrop-blur transition hover:bg-white/10 md:hidden"
              aria-expanded={mobileOpen}
              aria-label="Open navigation"
            >
              Menu
            </button>
            <Link
              href="/dashboard"
              className="rounded-full bg-cyan-400/15 px-3 py-1.5 text-sm text-cyan-100 ring-1 ring-cyan-300/20 transition hover:bg-cyan-400/20"
            >
              Open Dashboard
            </Link>
          </div>
        </div>

        {mobileOpen ? (
          <div className="md:hidden">
            <div className="mx-auto max-w-6xl px-4 pb-3">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
                <div className="grid gap-1 p-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "rounded-xl px-3 py-2 text-sm transition",
                        pathname === item.href
                          ? "bg-white/10 text-white ring-1 ring-white/15"
                          : "text-white/75 hover:bg-white/5",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} ASTRASENSE. Simulation-only demo.</p>
          <p>Built for environmental monitoring workflows.</p>
        </div>
      </footer>
    </div>
  );
}

