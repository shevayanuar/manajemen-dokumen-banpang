"use client";
import { useState } from "react";
import { Modal } from "./Modal";

interface Perwakilan {
  id: string;
  nomorUrut: number;
  nik: string;
  namaLengkap: string;
}

interface Props {
  item: Perwakilan;
  onClose: () => void;
  onSuccess: () => void;
}

function FieldError({ msg }: { msg: string }) {
  return msg ? (
    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--danger)" }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {msg}
    </p>
  ) : null;
}

export function EditPerwakilanModal({ item, onClose, onSuccess }: Props) {
  const [nomorUrut, setNomorUrut] = useState(String(item.nomorUrut));
  const [nik, setNik] = useState(item.nik);
  const [namaLengkap, setNamaLengkap] = useState(item.namaLengkap);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (!nomorUrut) e.nomorUrut = "Nomor urut barcode wajib diisi.";
    else if (Number(nomorUrut) < 1 || Number(nomorUrut) > 10000) e.nomorUrut = "Nomor urut harus antara 1–10000.";
    if (!nik) e.nik = "NIK wajib diisi.";
    else if (nik.length !== 16) e.nik = "NIK harus tepat 16 digit angka.";
    if (!namaLengkap) e.namaLengkap = "Nama lengkap wajib diisi.";
    else if (namaLengkap.trim().length < 2) e.namaLengkap = "Nama minimal 2 huruf.";
    else if (namaLengkap.trim().length > 50) e.namaLengkap = "Nama maksimal 50 huruf.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const res = await fetch(`/api/perwakilan-satu-kk/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomorUrut: Number(nomorUrut),
        nikWakil: nik,
        namaLengkapWakil: namaLengkap.trim().toUpperCase(),
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      if (data.error?.includes("nomor urut") || data.error?.includes("Nomor urut"))
        setErrors({ nomorUrut: "Nomor urut barcode tersebut sudah terdata." });
      else if (data.error?.includes("NIK"))
        setErrors({ nik: "NIK sudah terdaftar." });
      else setApiError(data.error ?? "Terjadi kesalahan.");
      return;
    }
    onSuccess();
  }

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-md animate-scaleIn card overflow-hidden"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Edit Data Perwakilan 1 KK
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              #{item.nomorUrut} · {item.namaLengkap}
            </p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>

            <div className="px-5 py-4">
              <label className="label">Nomor Urut Barcode <span style={{ color: "var(--danger)" }}>*</span></label>
              <input type="number" className="input-field font-mono"
                style={errors.nomorUrut ? { borderColor: "var(--danger)" } : {}}
                placeholder="Isi nomor urut sesuai pada barcode"
                value={nomorUrut}
                onChange={e => { setNomorUrut(e.target.value); if (errors.nomorUrut) setErrors(p => ({ ...p, nomorUrut: "" })); }}
                min={1} max={10000} />
              <FieldError msg={errors.nomorUrut ?? ""} />
            </div>

            <div className="flex items-center gap-3 px-5">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded"
                style={{ color: "var(--text-muted)", background: "var(--bg-card-hover)" }}>
                Data Wakil
              </span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>

            <div className="px-5 py-4 flex flex-col gap-4">
              <div>
                <label className="label">Nama Lengkap Wakil <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" className="input-field"
                  style={{ textTransform: "uppercase", ...(errors.namaLengkap ? { borderColor: "var(--danger)" } : {}) }}
                  placeholder="NAMA SESUAI KTP (HURUF KAPITAL)" value={namaLengkap}
                  onChange={e => { setNamaLengkap(e.target.value.slice(0, 50)); if (errors.namaLengkap) setErrors(p => ({ ...p, namaLengkap: "" })); }}
                  onBlur={e => setNamaLengkap(e.target.value.toUpperCase())}
                  maxLength={50} />
                <div className="flex items-start justify-between mt-1">
                  <FieldError msg={errors.namaLengkap ?? ""} />
                  <span className="text-xs ml-auto flex-shrink-0" style={{ color: "var(--text-muted)" }}>{namaLengkap.length}/50</span>
                </div>
              </div>

              <div>
                <label className="label">NIK Wakil <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" inputMode="numeric" className="input-field font-mono"
                  style={errors.nik ? { borderColor: "var(--danger)" } : {}}
                  placeholder="16 digit angka" value={nik}
                  onChange={e => { setNik(e.target.value.replace(/\D/g, "").slice(0, 16)); if (errors.nik) setErrors(p => ({ ...p, nik: "" })); }}
                  maxLength={16} />
                <div className="flex items-start justify-between mt-1">
                  <FieldError msg={errors.nik ?? ""} />
                  <span className="text-xs ml-auto flex-shrink-0"
                    style={{ color: nik.length === 16 ? "var(--success)" : "var(--text-muted)" }}>
                    {nik.length}/16
                  </span>
                </div>
              </div>

              {apiError && (
                <div className="px-3 py-2.5 rounded-lg text-sm"
                  style={{ background: "var(--danger-subtle)", color: "var(--danger)", border: "1px solid rgba(220,38,38,0.2)" }}>
                  {apiError}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 px-5 py-4 justify-end" style={{ borderTop: "1px solid var(--border)" }}>
            <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}