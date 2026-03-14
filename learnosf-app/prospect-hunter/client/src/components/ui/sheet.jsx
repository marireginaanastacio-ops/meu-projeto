import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Sheet({ isOpen, onClose, title, children }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement;
    panelRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      prev?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto flex flex-col focus:outline-none"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate pr-2">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar painel"
            className="p-1 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 shrink-0"
          >
            <X className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 p-4">
          {children}
        </div>
      </div>
    </>
  );
}
