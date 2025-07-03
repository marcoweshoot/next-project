"use client" ;
import { useToastContext } from "@/components/ui/toast-provider"

export const useToast = () => {
  const { toast, toasts } = useToastContext()
  return { toast, toasts }
}

export const toast = (args: { title?: string; description?: string }) => {
  const ctx = useToastContext()
  ctx.toast(args)
}
