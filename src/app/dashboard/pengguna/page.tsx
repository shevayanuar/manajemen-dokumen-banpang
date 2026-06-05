"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Modal } from "@/components/Modal";

type User = { id: string; name: string; email: string; createdAt: string };

export default function PenggunaPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then(r => r.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      setDeleteUser(null);
    },
  });

  function openAdd() {
    setEditUser(null);
    setName(""); setEmail(""); setPassword(""); setFormError("");
    setShowForm(true);
  }

  function openEdit(user: User) {
    setEditUser(user);
    setName(user.name.toUpperCase());
    setEmail(user.email.toLowerCase());
    setPassword(""); setFormError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    const url = editUser ? `/api/users/${editUser.id}` : "/api/users";
    const method = editUser ? "PUT" : "POST";
    const body: Record<string, string> = {
      name: name.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
    };
    if (password) body.password = password;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setFormLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error ?? "Terjadi kesalahan.");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    setShowForm(false);
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Kelola Pengguna
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Tambah, edit, atau hapus akun pengguna
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary self-start">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tambah User
        </button>
      </div>

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th className="hidden sm:table-cell">Email</th>
                <th className="hidden md:table-cell">Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {[1,2,3,4].map(j => (
                      <td key={j}>
                        <div className="h-4 rounded animate-pulse" style={{ background: "var(--bg-card-hover)", width: "70%" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !users?.length ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Belum ada pengguna</p>
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-medium block">{user.name}</span>
                          <span className="text-xs sm:hidden" style={{ color: "var(--text-muted)" }}>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
                        {user.email}
                      </span>
                    </td>
                    <td className="hidden md:table-cell">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(user)} className="btn-secondary py-1 px-2.5 text-xs">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button onClick={() => setDeleteUser(user)} className="btn-danger py-1 px-2.5 text-xs">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4h6v2"/>
                          </svg>
                          <span className="hidden sm:inline">Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <div className="w-full max-w-md animate-scaleIn card overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                {editUser ? "Edit Pengguna" : "Tambah Pengguna"}
              </h2>
              <button onClick={() => setShowForm(false)}
                className="w-7 h-7 flex items-center justify-center rounded-md"
                style={{ color: "var(--text-muted)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="px-5 py-4 flex flex-col gap-4">
                <div>
                  <label className="label">Nama</label>
                  <input type="text" className="input-field" placeholder="NAMA LENGKAP"
                    style={{ textTransform: "uppercase" }}
                    value={name}
                    onChange={e => setName(e.target.value.slice(0, 100))}
                    onBlur={e => setName(e.target.value.toUpperCase())}
                    required />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input-field" placeholder="email@contoh.com"
                    style={{ textTransform: "lowercase" }}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={e => setEmail(e.target.value.toLowerCase())}
                    required />
                </div>
                <div>
                  <label className="label">
                    Password {editUser && <span style={{ color: "var(--text-muted)" }}>(kosongkan jika tidak diubah)</span>}
                  </label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} className="input-field pr-10"
                      placeholder="••••••••" value={password}
                      onChange={e => setPassword(e.target.value)}
                      {...(!editUser ? { required: true } : {})} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: "var(--text-muted)" }}>
                      {showPassword ? (
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
                      )}
                    </button>
                  </div>
                </div>
                {formError && (
                  <div className="px-3 py-2.5 rounded-lg text-sm"
                    style={{ background: "var(--danger-subtle)", color: "var(--danger)", border: "1px solid rgba(220,38,38,0.2)" }}>
                    {formError}
                  </div>
                )}
              </div>
              <div className="flex gap-2 px-5 py-4 justify-end" style={{ borderTop: "1px solid var(--border)" }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary" disabled={formLoading}>
                  {formLoading ? "Menyimpan..." : (editUser ? "Simpan Perubahan" : "Tambah")}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Delete modal */}
      {deleteUser && (
        <Modal onClose={() => setDeleteUser(null)}>
          <div className="w-full max-w-sm animate-scaleIn card overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="px-5 py-5 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "var(--danger-subtle)", border: "1px solid rgba(220,38,38,0.3)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--danger)" }}>
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="17" y1="11" x2="23" y2="11"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Hapus Pengguna?</h3>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  Akun <span className="font-medium" style={{ color: "var(--text-primary)" }}>{deleteUser.name}</span> akan dihapus permanen.
                </p>
              </div>
            </div>
            <div className="flex gap-2 px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setDeleteUser(null)} className="btn-secondary flex-1 justify-center">Batal</button>
              <button onClick={() => deleteMutation.mutate(deleteUser.id)}
                className="btn-danger flex-1 justify-center" disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}