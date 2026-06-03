"use client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

type Stats = {
  totalPerwakilan: number;
  totalSatuKK: number;
  totalBedaKK: number;
  totalUsers: number;
  todayCount: number;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const isSuperadmin = session?.user?.role === "SUPERADMIN";

  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["stats"],
    queryFn: () => fetch("/api/stats").then(r => r.json()),
  });

  function StatCard({ label, value, sub, color }: {
    label: string;
    value: number | undefined;
    sub?: string;
    color?: string;
  }) {
    return (
      <div className="stat-card">
        <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        <p className="text-2xl lg:text-3xl font-bold mt-1" style={{ color: color ?? "var(--text-primary)" }}>
          {isLoading ? "—" : (value?.toLocaleString("id-ID") ?? "—")}
        </p>
        {sub && <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{sub}</p>}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          Selamat datang, {session?.user?.name}
        </p>
      </div>

      <div className={`grid gap-4 ${isSuperadmin ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2"}`}>
        <StatCard
          label="Total"
          value={stats?.totalPerwakilan}
          sub="1 KK + Beda KK"
        />
        <StatCard
          label="Data Baru Hari Ini"
          value={stats?.todayCount}
          sub="1 KK + Beda KK"
          color="var(--accent)"
        />
        <StatCard
          label="Perwakilan 1 KK"
          value={stats?.totalSatuKK}
          sub="total data terdaftar"
          color="var(--success)"
        />
        <StatCard
          label="Perwakilan Beda KK"
          value={stats?.totalBedaKK}
          sub="total data terdaftar"
          color="var(--warning)"
        />
        {isSuperadmin && (
          <StatCard
            label="Pengguna"
            value={stats?.totalUsers}
            sub="akun aktif"
          />
        )}
      </div>
    </div>
  );
}