import { useEffect, useRef, type ReactNode } from "react";

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  align?: "left" | "right";
}

export function DropdownMenu({
  trigger,
  children,
  isOpen,
  onOpenChange,
  align = "right",
}: DropdownMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onOpenChange]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-surface-hover sm:min-h-0 sm:min-w-0"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!isOpen)}
      >
        {trigger}
      </button>

      {isOpen ? (
        <div
          role="menu"
          className={`absolute top-full z-50 mt-1 min-w-[140px] rounded-lg border border-border bg-surface py-1 shadow-lg ${align === "right" ? "right-0" : "left-0"}`}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
}

export function DropdownMenuItem({ children, onClick }: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className="w-full px-3 py-2 text-left text-sm hover:bg-surface-hover"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
