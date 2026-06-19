import { create } from "zustand";

export type ToastVariant = "error" | "success" | "info";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (message: string, variant: ToastVariant) => void;
  dismissToast: (id: string) => void;
}

const AUTO_DISMISS_MS = 5000;

let toastCounter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (message, variant) => {
    const id = `toast-${++toastCounter}`;
    set({ toasts: [...get().toasts, { id, message, variant }] });

    window.setTimeout(() => {
      get().dismissToast(id);
    }, AUTO_DISMISS_MS);
  },
  dismissToast: (id) => {
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) });
  },
}));

export const toast = {
  error(message: string) {
    useToastStore.getState().addToast(message, "error");
  },
  success(message: string) {
    useToastStore.getState().addToast(message, "success");
  },
  info(message: string) {
    useToastStore.getState().addToast(message, "info");
  },
};
