interface UserAvatarIconProps {
  className?: string;
}

export function UserAvatarIcon({ className = "h-8 w-8" }: UserAvatarIconProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-surface-hover text-muted ${className}`}
      aria-hidden="true"
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1.5-3.5 4.5-5 7-5s5.5 1.5 7 5" />
      </svg>
    </span>
  );
}
