import { cn } from '../../lib/utils';

export function Select({ value, onChange, options, className, id, 'aria-label': ariaLabel }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className={cn(
        'flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
