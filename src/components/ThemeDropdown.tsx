import { useState } from 'react';
import type { ComponentType } from 'react';
import { useCloseOnOutsideClick } from '../hooks/useCloseOnOutsideClick';
import { cn } from '../lib/utils';

interface ThemeDropdownOption<T extends string> {
  value: T;
  label: string;
}

interface ThemeDropdownProps<T extends string> {
  value: T;
  options: ThemeDropdownOption<T>[];
  onChange: (value: T) => void;
  icon: ComponentType<{ className?: string }>;
  title: string;
  isLight: boolean;
}

export function ThemeDropdown<T extends string>({
  value,
  options,
  onChange,
  icon: Icon,
  title,
  isLight,
}: ThemeDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useCloseOnOutsideClick(() => setOpen(false));

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        title={title}
        aria-label={title}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md border transition-colors',
          isLight
            ? 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
            : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:bg-neutral-800',
        )}
      >
        <Icon className="h-4 w-4" />
      </button>
      {open && (
        <div
          className={cn(
            'absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-md border py-1 shadow-xl',
            isLight ? 'border-neutral-200 bg-white' : 'border-neutral-800 bg-neutral-900',
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center px-3 py-2 text-left text-sm transition-colors',
                option.value === value
                  ? 'text-blue-500'
                  : isLight
                    ? 'text-neutral-700 hover:bg-neutral-50'
                    : 'text-neutral-300 hover:bg-white/5',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}