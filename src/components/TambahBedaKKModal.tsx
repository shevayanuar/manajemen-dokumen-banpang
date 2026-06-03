"use client";
import { useRef, useState } from "react";
import { SignaturePad, SignaturePadHandle } from "./SignaturePad";
import { Modal } from "./Modal";

const ALAMAT_OPTIONS = ["Kedung Rengas","Babakan Bajing","Bangong","Rancawas","Bogor","Cilegeh","Bakung"];

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

export function TambahBedaKKModal({ onClose, onSuccess }: Props) {
  const sigRef = useRef<SignaturePadHandle>(null);
  const [nomorUrut, setNomorUrut] = useState("");
  const [namaPenerima, setNamaPenerima] = useState("");
  const [nikPenerima, setNikPenerima] = useState("");
  const [alamatPenerima, setAlamatPenerima] = useState("");
  const [namaWakil, setNamaWakil] = useState("");
  const [nikWakil, setNikWakil] = useState("");
  const [alamatWakil, setAlamatWakil] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!nomorUrut) e.nomorUrut = "Nomor urut barcode wajib diisi.";
    else if (Number(nomorUrut) < 1 || Number(nomorUrut) > 10000) e.nomorUrut = "Nomor urut harus antara 1–10000.";
    if (!namaPenerima) e.namaPenerima = "Nama penerima wajib diisi.";
    else if (namaPenerima.trim().length < 2) e.namaPenerima = "Nama minimal 2 huruf.";
    else if (namaPenerima.trim().length > 50) e.namaPenerima = "Nama maksimal 50 huruf.";
    if (!nikPenerima) e.nikPenerima = "NIK penerima wajib diisi.";
    else if (nikPenerima.length !== 16) e.nikPenerima = "NIK harus tepat 16 digit angka.";
    if (!alamatPenerima) e.alamatPenerima = "Alamat penerima wajib dipilih.";
    if (!namaWakil) e.namaWakil = "Nama wakil wajib diisi.";
    else if (namaWakil.trim().length < 2) e.namaWakil = "Nama minimal 2 huruf.";
    else if (namaWakil.trim().length > 50) e.namaWakil = "Nama maksimal 50 huruf.";
    if (!nikWakil) e.nikWakil = "NIK wakil wajib diisi.";
    else if (nikWakil.length !== 16) e.nikWakil = "NIK harus tepat 16 digit angka.";
    if (!alamatWakil) e.alamatWakil = "Alamat wakil wajib dipilih.";
    if (sigRef.current?.isEmpty()) e.ttdWakil = "Tanda tangan wajib diisi.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    const imageData = sigRef.current?.toDataURL("image/png") ?? "";

    const res = await fetch("/api/perwakilan-beda-kk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomorUrut: Number(nomorUrut),
        namaPenerimaBarcode: namaPenerima.trim().toUpperCase(),
        nikPenerimaBarcode: nikPenerima,
        alamatPenerimaBarcode: alamatPenerima,
        namaLengkapWakil: namaWakil.trim().toUpperCase(),
        nikWakil,
        alamatWakil,
        ttdWakil: imageData,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      if (data.error?.includes("nomor urut") || data.error?.includes("Nomor urut"))
        setErrors({ nomorUrut: "Nomor urut barcode tersebut sudah terdata." });
      else if (data.error?.includes("NIK penerima"))
        setErrors({ nikPenerima: "NIK penerima sudah terdaftar." });
      else if (data.error?.includes("NIK wakil sudah digunakan 3 kali"))
        setErrors({ nikWakil: "NIK wakil ini sudah digunakan 3 kali, tidak bisa ditambahkan lagi." });
      else setApiError(data.error ?? "Terjadi kesalahan.");
      return;
    }
    onSuccess();
  }

  const AlamatSelect = ({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) => (
    <div>
      <label className="label">{label} <span style={{ color: "var(--danger)" }}>*</span></label>
      <select
        className="input-field"
        style={error ? { borderColor: "var(--danger)" } : {}}
        value={value}
        onChange={e => { onChange(e.target.value); if (error) setErrors(p => ({ ...p })); }}
      >
        <option value="">— Pilih alamat —</option>
        {ALAMAT_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      <FieldError msg={error ?? ""} />
    </div>
  );

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-lg animate-scaleIn card overflow-hidden"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Tambah Data Perwakilan Beda KK
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

            {/* Nomor Urut */}
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

            {/* Pemisah Penerima */}
            <div className="flex items-center gap-3 px-5">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded"
                style={{ color: "var(--text-muted)", background: "var(--bg-card-hover)" }}>
                Data Penerima Barcode
              </span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>

            {/* Data Penerima */}
            <div className="px-5 py-4 flex flex-col gap-4">
              <div>
                <label className="label">Nama Penerima Barcode <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" className="input-field"
                  style={{ textTransform: "uppercase", ...(errors.namaPenerima ? { borderColor: "var(--danger)" } : {}) }}
                  placeholder="NAMA SESUAI KTP (HURUF KAPITAL)"
                  value={namaPenerima}
                  onChange={e => { setNamaPenerima(e.target.value.slice(0, 50)); if (errors.namaPenerima) setErrors(p => ({ ...p, namaPenerima: "" })); }}
                  onBlur={e => setNamaPenerima(e.target.value.toUpperCase())}
                  maxLength={50} />
                <div className="flex items-start justify-between mt-1">
                  <FieldError msg={errors.namaPenerima ?? ""} />
                  <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>{namaPenerima.length}/50</span>
                </div>
              </div>
              <div>
                <label className="label">NIK Penerima Barcode <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" inputMode="numeric" className="input-field font-mono"
                  style={errors.nikPenerima ? { borderColor: "var(--danger)" } : {}}
                  placeholder="16 digit angka" value={nikPenerima}
                  onChange={e => { setNikPenerima(e.target.value.replace(/\D/g, "").slice(0, 16)); if (errors.nikPenerima) setErrors(p => ({ ...p, nikPenerima: "" })); }}
                  maxLength={16} />
                <div className="flex items-start justify-between mt-1">
                  <FieldError msg={errors.nikPenerima ?? ""} />
                  <span className="text-xs ml-auto" style={{ color: nikPenerima.length === 16 ? "var(--success)" : "var(--text-muted)" }}>{nikPenerima.length}/16</span>
                </div>
              </div>
              <AlamatSelect
                label="Alamat Penerima Barcode"
                value={alamatPenerima}
                onChange={v => { setAlamatPenerima(v); setErrors(p => ({ ...p, alamatPenerima: "" })); }}
                error={errors.alamatPenerima}
              />
            </div>

            {/* Pemisah Wakil */}
            <div className="flex items-center gap-3 px-5">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded"
                style={{ color: "var(--text-muted)", background: "var(--bg-card-hover)" }}>
                Data Wakil
              </span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>

            {/* Data Wakil */}
            <div className="px-5 py-4 flex flex-col gap-4">
              <div>
                <label className="label">Nama Lengkap Wakil <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" className="input-field"
                  style={{ textTransform: "uppercase", ...(errors.namaWakil ? { borderColor: "var(--danger)" } : {}) }}
                  placeholder="NAMA SESUAI KTP (HURUF KAPITAL)"
                  value={namaWakil}
                  onChange={e => { setNamaWakil(e.target.value.slice(0, 50)); if (errors.namaWakil) setErrors(p => ({ ...p, namaWakil: "" })); }}
                  onBlur={e => setNamaWakil(e.target.value.toUpperCase())}
                  maxLength={50} />
                <div className="flex items-start justify-between mt-1">
                  <FieldError msg={errors.namaWakil ?? ""} />
                  <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>{namaWakil.length}/50</span>
                </div>
              </div>
              <div>
                <label className="label">NIK Wakil <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" inputMode="numeric" className="input-field font-mono"
                  style={errors.nikWakil ? { borderColor: "var(--danger)" } : {}}
                  placeholder="16 digit angka" value={nikWakil}
                  onChange={e => { setNikWakil(e.target.value.replace(/\D/g, "").slice(0, 16)); if (errors.nikWakil) setErrors(p => ({ ...p, nikWakil: "" })); }}
                  maxLength={16} />
                <div className="flex items-start justify-between mt-1">
                  <FieldError msg={errors.nikWakil ?? ""} />
                  <span className="text-xs ml-auto" style={{ color: nikWakil.length === 16 ? "var(--success)" : "var(--text-muted)" }}>{nikWakil.length}/16</span>
                </div>
              </div>
              <AlamatSelect
                label="Alamat Wakil"
                value={alamatWakil}
                onChange={v => { setAlamatWakil(v); setErrors(p => ({ ...p, alamatWakil: "" })); }}
                error={errors.alamatWakil}
              />

              {/* Tanda Tangan */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Tanda Tangan Wakil <span style={{ color: "var(--danger)" }}>*</span></label>
                  <button type="button"
                    onClick={() => { sigRef.current?.clear(); setErrors(p => ({ ...p, ttdWakil: "" })); }}
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
                  style={{ border: `1px solid ${errors.ttdWakil ? "var(--danger)" : "var(--border)"}` }}>
                  <SignaturePad ref={sigRef} height={160} />
                </div>
                <FieldError msg={errors.ttdWakil ?? ""} />
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