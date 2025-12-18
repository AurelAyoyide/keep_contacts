'use client';

import { useToast, Toast as ToastType } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

// Create a global event system for toasts since context might be overkill for just triggering
// This allow using toast from anywhere without hook if needed, but for now we'll stick to a simple custom event or context
// Actually, let's keep it simple: we'll export a ToastProvider context or just a component that listens to a global store
// For simplicity in this project, I'll make a GlobalToastContext.

import React, { createContext, useContext } from 'react';

interface ToastContextType {
    toasts: ToastType[];
    addToast: (type: ToastType['type'], message: string) => void;
    removeToast: (id: string) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const toastHook = useToast();

    return (
        <ToastContext.Provider value={toastHook}>
            {children}
            <ToastContainer toasts={toastHook.toasts} removeToast={toastHook.removeToast} />
        </ToastContext.Provider>
    );
}

export function useGlobalToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useGlobalToast must be used within a ToastProvider');
    }
    return context;
}

function ToastContainer({ toasts, removeToast }: { toasts: ToastType[]; removeToast: (id: string) => void }) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        'flex min-w-[300px] items-center gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-right-full',
                        {
                            'bg-white border-green-200 text-green-800 dark:bg-zinc-900 dark:border-green-900 dark:text-green-400':
                                toast.type === 'success',
                            'bg-white border-red-200 text-red-800 dark:bg-zinc-900 dark:border-red-900 dark:text-red-400':
                                toast.type === 'error',
                            'bg-white border-yellow-200 text-yellow-800 dark:bg-zinc-900 dark:border-yellow-900 dark:text-yellow-400':
                                toast.type === 'warning',
                            'bg-white border-blue-200 text-blue-800 dark:bg-zinc-900 dark:border-blue-900 dark:text-blue-400':
                                toast.type === 'info',
                        }
                    )}
                >
                    {toast.type === 'success' && <CheckCircle className="h-5 w-5" />}
                    {toast.type === 'error' && <AlertCircle className="h-5 w-5" />}
                    {toast.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
                    {toast.type === 'info' && <Info className="h-5 w-5" />}

                    <p className="flex-1 text-sm font-medium">{toast.message}</p>

                    <button
                        onClick={() => removeToast(toast.id)}
                        className="rounded-full p-1 opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
