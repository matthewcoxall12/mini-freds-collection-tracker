"use client";
import type { CatalogueFilters, SortOption, CollectFilter } from "@/types";
import { MANUFACTURERS } from "@/lib/constants";
import { cn } from "@/lib/cn";

const SCALES = ["1:43", "1:76", "1:64"];
const STATUSES = ["confirmed", "uncertain", "kit", "non-1:43", "duplicate"] as const;
const RARITIES = ["common", "uncommon", "rare", "epic", "legendary"] as const;
const SORT_OPTIONS = [
  { value: "manufacturer|asc", label: "Manufacturer A–Z" },
  { value: "manufacturer|desc", label: "Manufacturer Z–A" },
  { value: "reference_number|asc", label: "Reference A–Z" },
  { value: "name|asc", label: "Name A–Z" },
  { value: "status|asc", label: "Status" },
  { value: "rarity|asc", label: "Rarity" },
  { value: "updated_at|desc", label: "Recently updated" },
];

interface FilterBarProps {
  filters: CatalogueFilters;
  sort: SortOption;
  onFilterChange: (f: Partial<CatalogueFilters>) => void;
  onSortChange: (s: SortOption) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function ChipList<T extends string>({
  options, selected, onChange, label,
}: { options: readonly T[]; selected: T[]; onChange: (v: T[]) => void; label?: (v: T) => string }) {
  const toggle = (v: T) =>
    onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button key={o} type="button" onClick={() => toggle(o)}
          className={cn("text-[11px] px-2 py-0.5 rounded-full border transition",
            selected.includes(o)
              ? "bg-accent border-accent text-white"
              : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground")}>
          {label ? label(o) : o}
        </button>
      ))}
    </div>
  );
}

export function FilterBar({ filters, sort, onFilterChange, onSortChange }: FilterBarProps) {
  const sortValue = `${sort.field}|${sort.direction}`;
  const activeCount = filters.manufacturers.length + filters.scales.length + filters.statuses.length + filters.rarities.length + (filters.collectFilter !== "all" ? 1 : 0);

  const clearAll = () => onFilterChange({ manufacturers: [], scales: [], statuses: [], rarities: [], collectFilter: "all", query: "" });

  return (
    <aside className="rounded-lg border border-border bg-surface p-4 space-y-5 sticky top-[3.75rem]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        {activeCount > 0 && (
          <button type="button" onClick={clearAll} className="text-[10px] text-accent hover:underline">
            Clear {activeCount}
          </button>
        )}
      </div>

      <Section title="Collection">
        <div className="flex gap-1">
          {(["all", "owned", "missing"] as CollectFilter[]).map(v => (
            <button key={v} type="button"
              onClick={() => onFilterChange({ collectFilter: v })}
              className={cn("flex-1 text-[11px] py-1 rounded border transition capitalize",
                filters.collectFilter === v
                  ? "bg-accent border-accent text-white"
                  : "border-border text-muted-foreground hover:border-accent/50")}>
              {v}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Manufacturer">
        <ChipList
          options={MANUFACTURERS as unknown as string[]}
          selected={filters.manufacturers}
          onChange={v => onFilterChange({ manufacturers: v })}
        />
      </Section>

      <Section title="Scale">
        <ChipList options={SCALES} selected={filters.scales} onChange={v => onFilterChange({ scales: v })} />
      </Section>

      <Section title="Status">
        <ChipList options={STATUSES} selected={filters.statuses as string[] as typeof STATUSES[number][]} onChange={v => onFilterChange({ statuses: v })} />
      </Section>

      <Section title="Rarity">
        <ChipList options={RARITIES} selected={filters.rarities as string[] as typeof RARITIES[number][]} onChange={v => onFilterChange({ rarities: v })} />
      </Section>

      <Section title="Sort">
        <select
          value={sortValue}
          onChange={e => {
            const [field, direction] = e.target.value.split("|") as [SortOption["field"], SortOption["direction"]];
            onSortChange({ field, direction });
          }}
          className="w-full text-xs bg-surface border border-border rounded px-2 py-1.5 text-foreground focus:outline-none focus:border-accent"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Section>
    </aside>
  );
}
