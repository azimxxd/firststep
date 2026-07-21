type FirstStepLogoProps = {
  size?: number;
  className?: string;
};

export function FirstStepLogo({ size = 30, className }: FirstStepLogoProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="FirstStep"
    >
      <rect x="1" y="1" width="30" height="30" rx="10" fill="currentColor" />
      <path
        d="M9 22V9h5v8h4v-5h5v10H9Z"
        fill="var(--bg-deep)"
      />
      <path d="M9 9h14" stroke="var(--bg-deep)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
