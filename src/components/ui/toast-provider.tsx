"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  // opzionale: duration?: number
};

type ToastContextType = {
  toasts: ToastItem[];
  toast: (t: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
  clear: () => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// 👇 rinominato per non collidere con shadcn/ui
export function ToastStateProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const clear = useCallback(() => setToasts([]), []);

  const toast = useCallback((t: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    const newToast: ToastItem = { id, ...t };
    setToasts((prev) => [...prev, newToast]);

    // auto-dismiss dopo 3s (opzionale)
    setTimeout(() => dismiss(id), 3000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, clear }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used inside <ToastStateProvider>");
  return ctx;
}
