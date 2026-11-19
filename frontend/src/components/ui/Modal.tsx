import { ReactNode } from "react";
import { Check, X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X />
        </button>
        <div className="success-mark">
          <Check />
        </div>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
