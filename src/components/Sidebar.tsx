"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  user: { name: string; email: string; role: string };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const isSuperadmin = user.role === "SUPERADMIN";
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
    },
    {
      href: "/dashboard/perwakilan-satu-kk",
      label: "Perwakilan 1 KK",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      href: "/dashboard/perwakilan-beda-kk",
      label: "Perwakilan Beda KK",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
          <line x1="19" y1="3" x2="19" y2="9"/><line x1="22" y1="6" x2="16" y2="6"/>
        </svg>
      ),
    },
    {
      href: "/dashboard/pengganti",
      label: "Pengganti",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 1l4 4-4 4"/>
          <path d="M3 11V9a4 4 0 014-4h14"/>
          <path d="M7 23l-4-4 4-4"/>
          <path d="M21 13v2a4 4 0 01-4 4H3"/>
        </svg>
      ),
    },
    ...(isSuperadmin ? [{
      href: "/dashboard/pengguna",
      label: "Kelola Pengguna",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
    }] : []),
    {
      href: "/dashboard/akun",
      label: "Kelola Akun",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ];

  const SidebarContent = () => (
    <>
      <div className="hidden lg:flex px-5 py-5 items-center gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--accent-subtle)", border: "1px solid rgba(79,110,247,0.3)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M2 12l10 5 10-5" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>Banpang Temiyang</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Manajemen Data</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: active ? "var(--accent-subtle)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                border: active ? "1px solid rgba(79,110,247,0.2)" : "1px solid transparent",
              }}>
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 flex flex-col gap-2" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="px-1">
          <p className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>Tema</p>
          <ThemeToggle />
        </div>
        <div className="px-3 py-3 rounded-lg mt-1" style={{ background: "var(--bg)" }}>
          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{user.name}</p>
          <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>{user.email}</p>
          <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-medium"
            style={{
              background: isSuperadmin ? "rgba(217,119,6,0.1)" : "var(--accent-subtle)",
              color: isSuperadmin ? "var(--warning)" : "var(--accent)",
            }}>
            {isSuperadmin ? "Super Admin" : "User"}
          </span>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = "var(--danger)";
            (e.currentTarget as HTMLElement).style.background = "var(--danger-subtle)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Keluar
        </button>
      </div>
    </>
  );

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14"
        style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--accent-subtle)", border: "1px solid rgba(79,110,247,0.3)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Banpang Temiyang</p>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
          style={{ background: mobileOpen ? "var(--accent-subtle)" : "transparent", color: "var(--text-secondary)" }}>
          {mobileOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </header>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-20" style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`lg:hidden fixed top-14 left-0 bottom-0 w-72 z-20 flex flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "var(--bg-card)", borderRight: "1px solid var(--border)" }}>
        <SidebarContent />
      </aside>

      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 flex-col z-20"
        style={{ background: "var(--bg-card)", borderRight: "1px solid var(--border)" }}>
        <SidebarContent />
      </aside>
    </>
  );
}