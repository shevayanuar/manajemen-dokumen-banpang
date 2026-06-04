"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function AkunPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Set initial values only once when session loads
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name?.toUpperCase() ?? "");
      setEmail(session.user.email?.toLowerCase() ?? "");
    }
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Nama wajib diisi.");
      return;
    }
    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/akun", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Terjadi kesalahan.");
      return;
    }

    setSuccess("Akun berhasil diperbarui.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    if (newPassword || email.toLowerCase() !== session?.user?.email?.toLowerCase()) {
      setTimeout(() => signOut({ callbackUrl: "/login" }), 1500);
    }
  }

  const EyeIcon = ({ show }: { show: boolean }) => show ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const isSuperadmin = session?.user?.role === "SUPERADMIN";

  return (
    <div className="animate-fadeIn max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Kelola Akun</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
          {isSuperadmin ? "Kelola akun superadmin" : "Kelola akun Anda"}
        </p>
      </div>

      {/* Badge info akun */}
      <div className="flex items-center gap-3 mb-5 px-3 py-2.5 rounded-lg"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            background: isSuperadmin ? "rgba(217,119,6,0.1)" : "var(--accent-subtle)",
            color: isSuperadmin ? "var(--warning)" : "var(--accent)"
          }}>
          {session?.user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
            {session?.user?.name}
          </p>
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
            {session?.user?.email}
          </p>
        </div>
        <span className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
          style={{
            background: isSuperadmin ? "rgba(217,119,6,0.1)" : "var(--accent-subtle)",
            color: isSuperadmin ? "var(--warning)" : "var(--accent)",
          }}>
          {isSuperadmin ? "Super Admin" : "User"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Informasi akun */}
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
            Informasi Akun
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="label">Nama</label>
              <input type="text" className="input-field"
                style={{ textTransform: "uppercase" }}
                placeholder="NAMA LENGKAP"
                value={name}
                onChange={e => setName(e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field"
                style={{ textTransform: "lowercase" }}
                placeholder="email@contoh.com"
                value={email}
                onChange={e => setEmail(e.target.value.toLowerCase())}
              />
              {email.toLowerCase() !== (session?.user?.email?.toLowerCase() ?? "") && email !== "" && (
                <p className="text-xs mt-1" style={{ color: "var(--warning)" }}>
                  ⚠ Mengubah email akan logout otomatis
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Ganti password */}
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
            Ganti Password
          </p>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Kosongkan jika tidak ingin mengganti password
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="label">Password Saat Ini</label>
              <div className="relative">
                <input type={showCurrent ? "text" : "password"} className="input-field pr-10"
                  placeholder="••••••••" value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)} />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}>
                  <EyeIcon show={showCurrent} />
                </button>
              </div>
            </div>
            <div>
              <label className="label">Password Baru</label>
              <div className="relative">
                <input type={showNew ? "text" : "password"} className="input-field pr-10"
                  placeholder="Min. 8 karakter" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}>
                  <EyeIcon show={showNew} />
                </button>
              </div>
            </div>
            <div>
              <label className="label">Konfirmasi Password Baru</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} className="input-field pr-10"
                  placeholder="Ulangi password baru" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}>
                  <EyeIcon show={showConfirm} />
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>Password tidak cocok</p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="px-3 py-2.5 rounded-lg text-sm"
            style={{ background: "var(--danger-subtle)", color: "var(--danger)", border: "1px solid rgba(220,38,38,0.2)" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="px-3 py-2.5 rounded-lg text-sm"
            style={{ background: "var(--success-subtle)", color: "var(--success)", border: "1px solid rgba(52,211,153,0.2)" }}>
            {success}{(newPassword || email.toLowerCase() !== session?.user?.email?.toLowerCase()) && " Mengalihkan ke login..."}
          </div>
        )}

        <button type="submit" className="btn-primary self-start px-6" disabled={loading}>
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Menyimpan...
            </>
          ) : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}