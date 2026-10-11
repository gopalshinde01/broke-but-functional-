import React, { useEffect } from 'react';
import { Undo2, X } from 'lucide-react';
import { Button } from './Button';

export interface ToastProps {
  message: string;
  onUndo?: () => void;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onUndo, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#17201a] border border-[#2e3e33] text-[#f0f4f1] px-4 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
    >
      <span className="text-sm">{message}</span>
      {onUndo && (
        <Button variant="secondary" size="sm" onClick={onUndo} className="h-7 text-xs px-2.5">
          <Undo2 className="w-3.5 h-3.5 mr-1" /> Undo
        </Button>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="text-[#7d8f83] hover:text-[#f0f4f1] p-1 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
