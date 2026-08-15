/** Job Mitra | HomeStatusStripIcons.tsx | Micro icons for home status strips */

type IconProps = {
  readonly size?: 12 | 13;
};

export function HomeStatusStripClockIcon({ size = 13 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z"
      />
      <path fill="currentColor" d="M12.8 7h-1.6v6.4l5 3 .9-1.4-4.3-2.6Z" />
    </svg>
  );
}

export function HomeStatusStripBellIcon({ size = 13 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.71V3a2 2 0 0 0-4 0v1.29A7 7 0 0 0 5 11v5l-2 2v1h20v-1l-2-2Z"
      />
    </svg>
  );
}

export function HomeStatusStripChevronIcon({ size = 12 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M9.3 6.3 14.9 12l-5.6 5.7 1.4 1.4L17.7 12 10.7 4.9Z" />
    </svg>
  );
}
