"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

type Toast = {
  id: string
  title?: string
  description?: string
}

type ToastContextType = {
  toasts: Toast[]
  toast: (toast: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const newToast: Toast = { id: crypto.randomUUID(), ...t }
    setToasts((prev) => [...prev, newToast])
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== newToast.id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
      <div style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        zIndex: 9999
      }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: "12px 16px",
              background: "#333",
              color: "white",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              minWidth: "200px"
            }}
          >
            <strong>{t.title}</strong>
            {t.description && <div>{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToastContext = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToastContext must be used inside <ToastProvider>")
  return ctx
}
