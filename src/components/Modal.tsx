"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  onClose?: () => void;
  children: React.ReactNode;
}

export function Modal({ onClose, children }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={e => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      {children}
    </div>,
    document.body
  );
}