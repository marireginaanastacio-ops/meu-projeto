import { useEffect } from 'react';
import { cn } from '../../lib/utils';

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, description, confirmLabel = 'Confirmar', danger = false }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-lg shadow-xl p-6 w-full max-w-sm"
      >
        <h3 id="confirm-dialog-title" className="text-base font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p id="confirm-dialog-desc" className="text-sm text-gray-500 mb-5">
          {description}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus-visible:ring-2',
              danger
                ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400'
                : 'bg-gray-900 text-white hover:bg-gray-800 focus-visible:ring-gray-400'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}
