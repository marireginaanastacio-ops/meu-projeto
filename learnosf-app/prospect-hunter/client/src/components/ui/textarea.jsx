import { cn } from '../../lib/utils';

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors',
        'placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50 resize-none',
        className
      )}
      {...props}
    />
  );
}
