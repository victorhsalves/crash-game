import { useToastStore, type ToastVariant } from "@/stores/toast.store";

const variantClass: Record<ToastVariant, string> = {
  error: "border-danger/40 bg-danger/10 text-danger",
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  info: "border-primary/40 bg-primary/10 text-primary",
};

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg ${variantClass[item.variant]}`}
          role="alert"
        >
          <div className="flex items-start justify-between gap-3">
            <p>{item.message}</p>
            <button
              type="button"
              className="shrink-0 text-xs opacity-70 hover:opacity-100"
              aria-label="Fechar notificacao"
              onClick={() => dismissToast(item.id)}
            >
              X
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
