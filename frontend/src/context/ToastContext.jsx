import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {t.type === 'success' && <CheckCircle size={20} strokeWidth={2.5} />}
              {t.type === 'error' && <XCircle size={20} strokeWidth={2.5} />}
              {t.type === 'info' && <Info size={20} strokeWidth={2.5} />}
            </div>
            <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
            <button 
              onClick={() => removeToast(t.id)} 
              className="toast-close"
              style={{ 
                marginLeft: '8px', 
                opacity: 0.5, 
                color: 'white', 
                display: 'flex',
                padding: '4px',
                borderRadius: '50%',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.background = 'transparent'; }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
