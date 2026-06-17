interface WalletIconProps {
  className?: string;
}

export function WalletIcon({ className = "h-[18px] w-[18px]" }: WalletIconProps) {
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
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
      <path d="M16.5 12h4.25" />
      <circle cx="17.75" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}
