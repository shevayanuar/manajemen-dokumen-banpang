"use client";
import { useRef, useState } from "react";
import { SignaturePad, SignaturePadHandle } from "./SignaturePad";
import { Modal } from "./Modal";

interface Props {
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

export function TambahPerwakilanModal({ onClose, onSuccess }: Props) {
  const sigRef = useRef<SignaturePadHandle>(null);
  const [nomorUrut, setNomorUrut] = useState("");
  const [nik, setNik] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!nomorUrut) e.nomorUrut = "Nomor urut barcode wajib diisi.";
    else if (Number(nomorUrut) < 1 || Number(nomorUrut) > 10000) e.nomorUrut = "Nomor urut harus antara 1–10000.";
    if (!nik) e.nik = "NIK wajib diisi.";
    else if (nik.length !== 16) e.nik = "NIK harus tepat 16 digit angka.";
    if (!namaLengkap) e.namaLengkap = "Nama lengkap wajib diisi.";
    else if (namaLengkap.trim().length < 2) e.namaLengkap = "Nama minimal 2 huruf.";
    else if (namaLengkap.trim().length > 50) e.namaLengkap = "Nama maksimal 50 huruf.";
    if (sigRef.current?.isEmpty()) e.tandaTangan = "Tanda tangan wajib diisi.";
    return e;
  }

  function clearSignature() {
    sigRef.current?.clear();
    setErrors(prev => ({ ...prev, tandaTangan: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    const imageData = sigRef.current?.toDataURL("image/png") ?? "";

    const res = await fetch("/api/perwakilan-satu-kk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomorUrut: Number(nomorUrut),
        nikWakil: nik,
        namaLengkapWakil: namaLengkap.trim().toUpperCase(),
        ttdWakil: imageData,
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
      <div className="w-full max-w-lg animate-scaleIn card overflow-hidden"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Tambah Data Perwakilan 1 KK
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Semua field wajib diisi</p>
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
                  style={{ textTransform: "uppercase", ...(errors.namaLengkap ? { borderColor: "var(--danger)" } : {})}}
                  placeholder="NAMA SESUAI KTP (HURUF KAPITAL)"
                  value={namaLengkap}
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Tanda Tangan Wakil <span style={{ color: "var(--danger)" }}>*</span></label>
                  <button type="button" onClick={clearSignature}
                    className="text-xs flex items-center gap-1 transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                    </svg>
                    Bersihkan
                  </button>
                </div>
                <div className="rounded-lg overflow-hidden"
                  style={{ border: `1px solid ${errors.tandaTangan ? "var(--danger)" : "var(--border)"}` }}>
                  <SignaturePad ref={sigRef} height={160} />
                </div>
                <FieldError msg={errors.tandaTangan ?? ""} />
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
              {loading ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>Menyimpan...</>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>Simpan</>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}