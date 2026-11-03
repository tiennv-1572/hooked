import type { ProjectFilterOption } from "@/components/projects/project-content";
import { cn } from "@/lib/utils";

type ProjectFilterChipsProps = {
  filters: ProjectFilterOption[];
  /** Id of the active chip (`ALL_PROJECTS` or a category slug). */
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/**
 * Service filters (FilteredGallery "Service filters", 2221:2628 desktop / 2221:2842 mobile) built from
 * Projects / FilterChip (2218:484): 44px pill, Default = surface + muted text, Hover = accent + ivory text,
 * Active = accent + ink text, ActiveHover = Active at 86% opacity.
 *
 * Single-select toggle buttons (`aria-pressed`). Chips wrap onto several rows when they are wider than the column
 * (10px gaps both ways, as in the mobile frame).
 */
export function ProjectFilterChips({ filters, value, onChange, className }: ProjectFilterChipsProps) {
  return (
    <div role="group" aria-label="Lọc dự án theo dịch vụ" className={cn("flex flex-wrap gap-2.5", className)}>
      {filters.map((filter) => {
        const active = filter.id === value;
        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.id)}
            className={cn(
              "h-11 shrink-0 rounded-[23px] border px-4.25 text-sm leading-4.5 font-semibold whitespace-nowrap",
              "transition-[background-color,border-color,color,opacity] duration-150",
              active
                ? "border-transparent bg-accent text-ink hover:border-accent hover:opacity-86"
                : "border-transparent bg-surface text-muted hover:border-accent hover:bg-accent hover:text-ivory",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
