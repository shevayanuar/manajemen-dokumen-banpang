"use client";
import { useRef, useState } from "react";
import { SignaturePad, SignaturePadHandle } from "./SignaturePad";
import { Modal } from "./Modal";

const ALAMAT_OPTIONS = ["Kedung Rengas","Babakan Bajing","Bangong","Rancawas","Bogor","Cilegeh","Bakung"];
const SEBAB_OPTIONS = ["Tidak ditemukan alamatnya","Pindah Domisili","Meninggal Dunia"];

interface Props { onClose: () => void; onSuccess: () => void; }

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

export function TambahPenggantiModal({ onClose, onSuccess }: Props) {
  const sigRef = useRef<SignaturePadHandle>(null);
  const [nomorUrut, setNomorUrut] = useState("");
  const [namaAwal, setNamaAwal] = useState("");
  const [nikAwal, setNikAwal] = useState("");
  const [alamatAwal, setAlamatAwal] = useState("");
  const [namaPengganti, setNamaPengganti] = useState("");
  const [nikPengganti, setNikPengganti] = useState("");
  const [alamatPengganti, setAlamatPengganti] = useState("");
  const [sebab, setSebab] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!nomorUrut) e.nomorUrut = "Nomor urut barcode wajib diisi.";
    else if (Number(nomorUrut) < 1 || Number(nomorUrut) > 10000) e.nomorUrut = "Nomor urut harus antara 1–10000.";
    if (!namaAwal) e.namaAwal = "Nama PBP Awal wajib diisi.";
    else if (namaAwal.trim().length < 2) e.namaAwal = "Nama minimal 2 huruf.";
    else if (namaAwal.trim().length > 50) e.namaAwal = "Nama maksimal 50 huruf.";
    if (!nikAwal) e.nikAwal = "NIK PBP Awal wajib diisi.";
    else if (nikAwal.length !== 16) e.nikAwal = "NIK harus tepat 16 digit angka.";
    if (!alamatAwal) e.alamatAwal = "Alamat PBP Awal wajib dipilih.";
    if (!namaPengganti) e.namaPengganti = "Nama PBP Pengganti wajib diisi.";
    else if (namaPengganti.trim().length < 2) e.namaPengganti = "Nama minimal 2 huruf.";
    else if (namaPengganti.trim().length > 50) e.namaPengganti = "Nama maksimal 50 huruf.";
    if (!nikPengganti) e.nikPengganti = "NIK PBP Pengganti wajib diisi.";
    else if (nikPengganti.length !== 16) e.nikPengganti = "NIK harus tepat 16 digit angka.";
    else if (nikPengganti === nikAwal) e.nikPengganti = "NIK PBP Pengganti tidak boleh sama dengan NIK PBP Awal.";
    if (!alamatPengganti) e.alamatPengganti = "Alamat PBP Pengganti wajib dipilih.";
    if (!sebab) e.sebab = "Sebab penggantian wajib dipilih.";
    if (sigRef.current?.isEmpty()) e.ttd = "Tanda tangan wajib diisi.";
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

    const res = await fetch("/api/pengganti", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomorUrut: Number(nomorUrut),
        namaPbpAwal: namaAwal.trim().toUpperCase(),
        nikPbpAwal: nikAwal,
        alamatPbpAwal: alamatAwal,
        namaPbpPengganti: namaPengganti.trim().toUpperCase(),
        nikPbpPengganti: nikPengganti,
        alamatPbpPengganti: alamatPengganti,
        sebabPenggantian: sebab,
        ttdPengganti: imageData,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      if (data.error?.includes("nomor urut") || data.error?.includes("Nomor urut"))
        setErrors({ nomorUrut: "Nomor urut barcode tersebut sudah terdata." });
      else if (data.error?.includes("NIK PBP Awal"))
        setErrors({ nikAwal: data.error });
      else if (data.error?.includes("NIK PBP Pengganti"))
        setErrors({ nikPengganti: data.error });
      else setApiError(data.error ?? "Terjadi kesalahan.");
      return;
    }
    onSuccess();
  }

  const Divider = ({ label }: { label: string }) => (
    <div className="flex items-center gap-3 px-5">
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      <span className="text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded"
        style={{ color: "var(--text-muted)", background: "var(--bg-card-hover)" }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    </div>
  );

  const AlamatSelect = ({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) => (
    <div>
      <label className="label">{label} <span style={{ color: "var(--danger)" }}>*</span></label>
      <select className="input-field" style={error ? { borderColor: "var(--danger)" } : {}}
        value={value} onChange={e => { onChange(e.target.value); }}>
        <option value="">— Pilih alamat —</option>
        {ALAMAT_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      <FieldError msg={error ?? ""} />
    </div>
  );

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-lg animate-scaleIn card overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Tambah Data Pengganti</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>Semua field wajib diisi</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
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

            <Divider label="Data PBP Awal" />

            <div className="px-5 py-4 flex flex-col gap-4">
              <div>
                <label className="label">Nama PBP Awal <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" className="input-field"
                  style={{ textTransform: "uppercase", ...(errors.namaAwal ? { borderColor: "var(--danger)" } : {}) }}
                  placeholder="Nama sesuai KTP"
                  value={namaAwal}
                  onChange={e => { setNamaAwal(e.target.value.slice(0, 50)); if (errors.namaAwal) setErrors(p => ({ ...p, namaAwal: "" })); }}
                  onBlur={e => setNamaAwal(e.target.value.toUpperCase())}
                  maxLength={50} />
                <div className="flex items-start justify-between mt-1">
                  <FieldError msg={errors.namaAwal ?? ""} />
                  <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>{namaAwal.length}/50</span>
                </div>
              </div>
              <div>
                <label className="label">NIK PBP Awal <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" inputMode="numeric" className="input-field font-mono"
                  style={errors.nikAwal ? { borderColor: "var(--danger)" } : {}}
                  placeholder="16 digit angka" value={nikAwal}
                  onChange={e => { setNikAwal(e.target.value.replace(/\D/g, "").slice(0, 16)); if (errors.nikAwal) setErrors(p => ({ ...p, nikAwal: "" })); }}
                  maxLength={16} />
                <div className="flex items-start justify-between mt-1">
                  <FieldError msg={errors.nikAwal ?? ""} />
                  <span className="text-xs ml-auto" style={{ color: nikAwal.length === 16 ? "var(--success)" : "var(--text-muted)" }}>{nikAwal.length}/16</span>
                </div>
              </div>
              <AlamatSelect label="Alamat PBP Awal" value={alamatAwal}
                onChange={v => { setAlamatAwal(v); setErrors(p => ({ ...p, alamatAwal: "" })); }}
                error={errors.alamatAwal} />
            </div>

            <Divider label="Data PBP Pengganti" />

            <div className="px-5 py-4 flex flex-col gap-4">
              <div>
                <label className="label">Nama PBP Pengganti <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" className="input-field"
                  style={{ textTransform: "uppercase", ...(errors.namaPengganti ? { borderColor: "var(--danger)" } : {}) }}
                  placeholder="Nama sesuai KTP"
                  value={namaPengganti}
                  onChange={e => { setNamaPengganti(e.target.value.slice(0, 50)); if (errors.namaPengganti) setErrors(p => ({ ...p, namaPengganti: "" })); }}
                  onBlur={e => setNamaPengganti(e.target.value.toUpperCase())}
                  maxLength={50} />
                <div className="flex items-start justify-between mt-1">
                  <FieldError msg={errors.namaPengganti ?? ""} />
                  <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>{namaPengganti.length}/50</span>
                </div>
              </div>
              <div>
                <label className="label">NIK PBP Pengganti <span style={{ color: "var(--danger)" }}>*</span></label>
                <input type="text" inputMode="numeric" className="input-field font-mono"
                  style={errors.nikPengganti ? { borderColor: "var(--danger)" } : {}}
                  placeholder="16 digit angka" value={nikPengganti}
                  onChange={e => { setNikPengganti(e.target.value.replace(/\D/g, "").slice(0, 16)); if (errors.nikPengganti) setErrors(p => ({ ...p, nikPengganti: "" })); }}
                  maxLength={16} />
                <div className="flex items-start justify-between mt-1">
                  <FieldError msg={errors.nikPengganti ?? ""} />
                  <span className="text-xs ml-auto" style={{ color: nikPengganti.length === 16 ? "var(--success)" : "var(--text-muted)" }}>{nikPengganti.length}/16</span>
                </div>
              </div>
              <AlamatSelect label="Alamat PBP Pengganti" value={alamatPengganti}
                onChange={v => { setAlamatPengganti(v); setErrors(p => ({ ...p, alamatPengganti: "" })); }}
                error={errors.alamatPengganti} />
              <div>
                <label className="label">Sebab Penggantian <span style={{ color: "var(--danger)" }}>*</span></label>
                <select className="input-field" style={errors.sebab ? { borderColor: "var(--danger)" } : {}}
                  value={sebab} onChange={e => { setSebab(e.target.value); if (errors.sebab) setErrors(p => ({ ...p, sebab: "" })); }}>
                  <option value="">— Pilih sebab penggantian —</option>
                  {SEBAB_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <FieldError msg={errors.sebab ?? ""} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Tanda Tangan Pengganti <span style={{ color: "var(--danger)" }}>*</span></label>
                  <button type="button"
                    onClick={() => { sigRef.current?.clear(); setErrors(p => ({ ...p, ttd: "" })); }}
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
                  style={{ border: `1px solid ${errors.ttd ? "var(--danger)" : "var(--border)"}` }}>
                  <SignaturePad ref={sigRef} height={160} />
                </div>
                <FieldError msg={errors.ttd ?? ""} />
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