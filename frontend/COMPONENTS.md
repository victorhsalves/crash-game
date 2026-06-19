# UI Components

## Stack decision

The challenge README lists **Tailwind CSS v4 + shadcn/ui** as an accepted stack. This project uses **Tailwind v4 with a custom `components/ui/` layer** instead of installing shadcn/ui.

### Why custom primitives

- The UI surface is small (Button, Card, Modal, DropdownMenu, LoadingSpinner, Toast, Skeleton).
- Theme tokens are already defined in `src/index.css` via `@theme` and match the casino dark aesthetic.
- No functional gap for the crash game demo; migration would be mostly alignment work.

### What we ship

| Primitive | Location | Notes |
|-----------|----------|-------|
| Button | `components/ui/button.tsx` | primary / secondary / danger |
| Card | `components/ui/card.tsx` | title + children |
| Modal | `components/ui/modal.tsx` | overlay + Escape to close |
| DropdownMenu | `components/ui/dropdown-menu.tsx` | controlled open state |
| LoadingSpinner | `components/ui/loading-spinner.tsx` | short-lived loads (auth, verification) |
| Skeleton | `components/ui/skeleton.tsx` | layout-stable loading placeholders |
| ToastContainer | `components/ui/toast-container.tsx` | Zustand-driven toasts |

Domain-specific UI lives under `components/validation/` and `components/layout/`.

### Post-delivery: optional shadcn adoption

If aligning with the documented stack becomes important:

1. Run `npx shadcn@latest init` and map `@theme` tokens to shadcn CSS variables.
2. Migrate **Dialog** and **DropdownMenu** first (focus trap, portal, better a11y).
3. Keep Toast/Skeleton custom unless Sonner is desired.
4. Estimate: ~0.5–1 day for minimal init + primitive swap; 1–2 days for full alignment.

No shadcn migration is required for delivery; the custom layer follows the same compositional pattern as shadcn (`components/ui/`).
