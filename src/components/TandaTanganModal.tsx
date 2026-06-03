"use client";
import { Modal } from "./Modal";

interface Props {
  item: { namaLengkap: string; nik: string; nomorUrut: number; tandaTangan: string };
  onClose: () => void;
}

export function TandaTanganModal({ item, onClose }: Props) {
  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-md animate-scaleIn card overflow-hidden"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Tanda Tangan</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              #{String(item.nomorUrut).padStart(4, "0")} · {item.namaLengkap}
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

        <div className="px-5 py-5">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="px-3 py-2.5 rounded-lg" style={{ background: "var(--bg)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>NIK</p>
              <p className="text-sm font-mono font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>{item.nik}</p>
            </div>
            <div className="px-3 py-2.5 rounded-lg" style={{ background: "var(--bg)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Nomor Urut</p>
              <p className="text-sm font-mono font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>
                #{String(item.nomorUrut).padStart(4, "0")}
              </p>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)", background: "#fff" }}>
            <img src={item.tandaTangan} alt={`Tanda tangan ${item.namaLengkap}`}
              className="w-full" style={{ maxHeight: "200px", objectFit: "contain" }} />
          </div>
        </div>

        <div className="flex justify-end px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          <button onClick={onClose} className="btn-secondary">Tutup</button>
        </div>
      </div>
    </Modal>
  );
}