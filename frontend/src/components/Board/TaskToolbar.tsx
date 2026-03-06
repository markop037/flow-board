import { Search, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export type SortOption =
  | 'date_desc'
  | 'date_asc'
  | 'priority_desc'
  | 'priority_asc'
  | 'name_asc'
  | 'name_desc'

const SORT_LABELS: Record<SortOption, string> = {
  date_desc: 'Newest first',
  date_asc: 'Oldest first',
  priority_desc: 'Priority: High → Low',
  priority_asc: 'Priority: Low → High',
  name_asc: 'Name: A → Z',
  name_desc: 'Name: Z → A',
}

interface TaskToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  sortOption: SortOption
  onSortChange: (value: SortOption) => void
  placeholder?: string
  className?: string
}

export function TaskToolbar({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  placeholder = 'Search tasks…',
  className,
}: TaskToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="relative flex-1 sm:max-w-xs lg:max-w-sm">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
          aria-hidden
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-4 text-sm text-stone-800 placeholder:text-stone-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          aria-label="Search tasks"
        />
      </div>
      <div className="relative w-full sm:w-auto">
        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="w-full appearance-none rounded-xl border border-stone-200 bg-white py-2.5 pl-4 pr-10 text-sm text-stone-700 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          aria-label="Sort tasks"
        >
          {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
          aria-hidden
        />
      </div>
    </div>
  )
}
