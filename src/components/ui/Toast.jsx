import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside ToastProvider');
    return ctx;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const toast = useCallback(({ message, type = 'info', duration = 3500 }) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }, []);

    const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    const icons = {
        success: <CheckCircle size={18} className="text-green-500 flex-shrink-0" />,
        error: <XCircle size={18} className="text-red-500 flex-shrink-0" />,
        info: <Info size={18} className="text-blue-500 flex-shrink-0" />,
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
                <AnimatePresence>
                    {toasts.map(t => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 20, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className="pointer-events-auto flex items-center gap-3 bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/15 rounded-2xl shadow-xl px-4 py-3 min-w-[260px] max-w-sm"
                        >
                            {icons[t.type]}
                            <p className="text-sm font-medium text-black dark:text-white flex-1">{t.message}</p>
                            <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors ml-1">
                                <X size={15} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
