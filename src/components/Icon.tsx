// Lightweight inline icon set (Feather-style, 24×24, stroke = currentColor).
// Keeps custom UI crisp and theme-aware without pulling icon fonts into non-UI5 parts.
type IconName =
  | 'timeline' | 'analytics' | 'wallet' | 'coins' | 'piggy' | 'target' | 'layers'
  | 'alert' | 'calendar' | 'building' | 'download' | 'plus' | 'sun' | 'moon'
  | 'close' | 'up' | 'down' | 'flag' | 'clock' | 'check' | 'chart'

const PATHS: Record<IconName, React.ReactNode> = {
  timeline: <><rect x="3" y="5" width="11" height="3" rx="1.5" /><rect x="7" y="10.5" width="13" height="3" rx="1.5" /><rect x="5" y="16" width="9" height="3" rx="1.5" /></>,
  analytics: <><path d="M4 20V4" /><rect x="6.5" y="12" width="3.2" height="6" rx="1" /><rect x="11.5" y="8" width="3.2" height="10" rx="1" /><rect x="16.5" y="5" width="3.2" height="13" rx="1" /></>,
  chart: <><path d="M4 19h16" /><path d="M4 15l4-4 4 3 6-7" /></>,
  wallet: <><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /><circle cx="16.5" cy="14" r="1.3" fill="currentColor" stroke="none" /></>,
  coins: <><ellipse cx="9" cy="7" rx="6" ry="2.6" /><path d="M3 7v5c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6V7" /><ellipse cx="15" cy="15" rx="6" ry="2.6" /><path d="M9 15v2c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6v-4" /></>,
  piggy: <><path d="M4 12a6 6 0 016-6h3a6 6 0 016 6v1a3 3 0 01-3 3v2h-3v-2H9v2H6v-2.4A6 6 0 014 13z" /><circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" /></>,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></>,
  layers: <><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></>,
  alert: <><path d="M12 4l9 16H3l9-16z" /><path d="M12 10v4" /><circle cx="12" cy="17" r=".6" fill="currentColor" stroke="none" /></>,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2.5" /><path d="M4 9h16M9 3v4M15 3v4" /></>,
  building: <><rect x="5" y="4" width="14" height="17" rx="1.5" /><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h6" /></>,
  download: <><path d="M12 4v10m0 0l-4-4m4 4l4-4" /><path d="M5 19h14" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></>,
  moon: <><path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" /></>,
  close: <><path d="M6 6l12 12M18 6L6 18" /></>,
  up: <><path d="M5 15l7-7 7 7" /></>,
  down: <><path d="M5 9l7 7 7-7" /></>,
  flag: <><path d="M5 21V4" /><path d="M5 5h11l-2 3 2 3H5" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  check: <><path d="M4 12.5l5 5L20 6.5" /></>,
}

export function Icon({ name, size = 18, className, strokeWidth = 1.8 }: {
  name: IconName; size?: number; className?: string; strokeWidth?: number
}) {
  return (
    <svg
      className={className}
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}

export type { IconName }
