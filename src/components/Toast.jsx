import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

export const Toast = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 80, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 80, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className={`pointer-events-auto flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl border min-w-[280px] max-w-sm
                            ${toast.type === 'success'
                                ? 'bg-card border-emerald-500/30 shadow-emerald-500/10'
                                : 'bg-card border-destructive/30 shadow-destructive/10'
                            }`}
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        ) : (
                            <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-bold text-foreground">{toast.title}</p>
                            {toast.message && (
                                <p className="text-xs text-muted-foreground mt-0.5">{toast.message}</p>
                            )}
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
