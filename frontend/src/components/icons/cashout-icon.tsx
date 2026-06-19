interface CashoutIconProps {
  className?: string;
}

export function CashoutIcon({ className = "h-4 w-4" }: CashoutIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10h6" />
      <path d="M12 14v5" />
      <path d="M9.5 16.5 12 19l2.5-2.5" />
    </svg>
  );
}
