export type FilterValue = 'all' | 'owned' | 'missing';

export interface FilterTabsProps {
  /** Currently active filter. */
  value: FilterValue;
  /** Called when the user selects a different tab. */
  onChange: (value: FilterValue) => void;
}

const TABS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'owned', label: 'Owned' },
  { value: 'missing', label: 'Missing' },
];

/**
 * Accessible filter tab bar for the country album page.
 *
 * Uses `role="tablist"` and `role="tab"` with `aria-selected`
 * for screen reader support. Visual style matches the Sport-Pop
 * sticker album aesthetic: heavy black borders, press effect.
 */
export function FilterTabs({ value, onChange }: FilterTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter stickers"
      className="flex flex-wrap gap-2"
    >
      {TABS.map((tab) => {
        const isActive = value === tab.value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`
              font-heading text-sm font-bold uppercase tracking-wider
              px-4 py-2 rounded-comic border-2 border-black
              transition-all duration-150
              focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2
              active:translate-x-0.5 active:translate-y-0.5
              ${
                isActive
                  ? 'bg-ink text-white shadow-[4px_4px_0px_#1A1A2E]'
                  : 'bg-paper-light text-ink-muted hover:bg-paper-dark hover:shadow-[3px_3px_0px_#1A1A2E]'
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
