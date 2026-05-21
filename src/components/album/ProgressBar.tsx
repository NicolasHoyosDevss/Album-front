export interface ProgressBarProps {
  /** Current progress value. */
  value: number;
  /** Maximum value. */
  max: number;
  /** Optional label shown after the percentage. */
  label?: string;
}

/**
 * Pill-shaped progress bar with neon green fill.
 * Meets WCAG: role="progressbar" with aria-valuenow/min/max.
 */
export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-sm">
        <span className="font-body text-ink-muted font-medium">
          {value} / {max}
        </span>
        <span className="font-body text-ink font-semibold tabular-nums">
          {pct}%{label ? ` ${label}` : ''}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? `Progress: ${value} of ${max} (${pct}%)`}
        className="h-6 w-full rounded-full border-2 border-black bg-paper-dark overflow-hidden"
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: '#22c55e',
          }}
        />
      </div>
    </div>
  );
}
