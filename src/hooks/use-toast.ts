"use client";
import { useToastContext } from "@/components/ui/toast-provider";

type ToastArgs = { title?: string; description?: string; action?: React.ReactNode };

export function useToast() {
  const ctx = useToastContext();
  return {
    toasts: ctx.toasts,
    toast: (args: ToastArgs) => ctx.toast(args),
    dismiss: ctx.dismiss,
    clear: ctx.clear,
  };
}