"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast as UiToast,
  ToastClose,
  ToastDescription,
  ToastProvider as UiToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <UiToastProvider>
      {toasts.map(({ id, title, description, action }) => (
        <UiToast key={id} onOpenChange={(open) => { if (!open) dismiss(id); }}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </UiToast>
      ))}
      <ToastViewport />
    </UiToastProvider>
  );
}
