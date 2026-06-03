"use client";
import { Modal } from "./Modal";

interface Props {
  name: string;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export function DeleteConfirmModal({ name, onClose, onConfirm, loading }: Props) {
  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-sm animate-scaleIn card overflow-hidden"
        onClick={e => e.stopPropagation()}>

        <div className="px-5 py-5 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "var(--danger-subtle)", border: "1px solid rgba(220,38,38,0.3)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ color: "var(--danger)" }}>
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Hapus Data?</h3>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Data <span className="font-medium" style={{ color: "var(--text-primary)" }}>{name}</span> akan dihapus
              permanen dan tidak dapat dikembalikan.
            </p>
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
          <button onClick={onClose} className="btn-secondary flex-1 justify-center" disabled={loading}>Batal</button>
          <button onClick={onConfirm} className="btn-danger flex-1 justify-center" disabled={loading}>
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Menghapus...
              </>
            ) : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </Modal>
  );
}