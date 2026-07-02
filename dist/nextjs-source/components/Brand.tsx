export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#E5322B" />
      <rect x="8.5" y="9" width="15" height="3.4" rx="1.7" fill="#fff" />
      <rect x="8.5" y="14.6" width="15" height="3.4" rx="1.7" fill="#fff" opacity=".66" />
      <rect x="8.5" y="20.2" width="9.5" height="3.4" rx="1.7" fill="#fff" opacity=".4" />
    </svg>
  );
}

export function Brand() {
  return (
    <span className="inline-flex items-center gap-[11px] font-extrabold text-[19px] tracking-tight">
      <BrandMark />
      Presa
    </span>
  );
}
