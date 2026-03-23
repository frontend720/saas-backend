import { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const toast = useCallback(({ message, type = 'success', duration = 3000 }) => {
    const id = ++nextId;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 border px-4 py-3 font-mono text-xs uppercase shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] bg-white animate-in slide-in-from-right-4 duration-200 ${
              t.type === 'error'
                ? 'border-[#FF4500] text-[#FF4500]'
                : 'border-[#111111] text-[#111111]'
            }`}
          >
            <span className={`w-2 h-2 shrink-0 ${t.type === 'error' ? 'bg-[#FF4500]' : 'bg-[#111111]'}`} />
            <span>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="ml-2 opacity-40 hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
