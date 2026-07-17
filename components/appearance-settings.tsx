'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { CardDescription, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';

const THEME_OPTIONS = [
  {
    value: 'light',
    label: 'Light',
    icon: Sun,
    description: 'Bright backgrounds with dark text.',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: Moon,
    description: 'Dimmed backgrounds, easier on the eyes.',
  },
  {
    value: 'system',
    label: 'System',
    icon: Monitor,
    description: 'Follows your device preference.',
  },
] as const;

function ThemePreview({ variant }: { variant: 'light' | 'dark' | 'system' }) {
  const panel = (dark: boolean) => (
    <div
      className={cn(
        'h-full w-full space-y-2 p-2',
        dark ? 'bg-neutral-900' : 'bg-neutral-100',
      )}
    >
      <div
        className={cn(
          'space-y-2 rounded-md p-2 shadow-sm',
          dark ? 'bg-neutral-800' : 'bg-white',
        )}
      >
        <div
          className={cn(
            'h-2 w-4/5 rounded-lg',
            dark ? 'bg-neutral-600' : 'bg-neutral-300',
          )}
        />
        <div
          className={cn(
            'h-2 w-full rounded-lg',
            dark ? 'bg-neutral-700' : 'bg-neutral-200',
          )}
        />
      </div>
      <div
        className={cn(
          'flex items-center space-x-2 rounded-md p-2 shadow-sm',
          dark ? 'bg-neutral-800' : 'bg-white',
        )}
      >
        <div
          className={cn(
            'h-4 w-4 rounded-full',
            dark ? 'bg-neutral-600' : 'bg-neutral-300',
          )}
        />
        <div
          className={cn(
            'h-2 w-full rounded-lg',
            dark ? 'bg-neutral-700' : 'bg-neutral-200',
          )}
        />
      </div>
    </div>
  );

  if (variant === 'system') {
    return (
      <div className='flex h-28 w-full overflow-hidden rounded-md border'>
        <div className='w-1/2'>{panel(false)}</div>
        <div className='w-1/2'>{panel(true)}</div>
      </div>
    );
  }

  return (
    <div className='h-28 w-full overflow-hidden rounded-md border'>
      {panel(variant === 'dark')}
    </div>
  );
}

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes only knows the active theme on the client, so wait for
  // mount before highlighting a selection to avoid a hydration mismatch.
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className='flex flex-col gap-4 px-4'>
      <div>
        <CardTitle className='text-base'>Appearance</CardTitle>
        <CardDescription>
          Customize how the dashboard looks. Pick a theme or follow your system
          setting.
        </CardDescription>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl'>
        {THEME_OPTIONS.map((option) => {
          const isActive = mounted && theme === option.value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type='button'
              onClick={() => setTheme(option.value)}
              className={cn(
                'flex flex-col gap-2 border-2 p-3 text-left transition-colors hover:bg-accent',
                isActive ? 'border-primary' : 'border-muted',
              )}
            >
              <ThemePreview variant={option.value} />
              <div className='flex items-center justify-between'>
                <span className='flex items-center gap-2 text-sm font-medium'>
                  <Icon className='h-4 w-4' />
                  {option.label}
                </span>
                {isActive && <Check className='h-4 w-4 text-primary' />}
              </div>
              <CardDescription className='text-xs'>
                {option.description}
              </CardDescription>
            </button>
          );
        })}
      </div>
    </div>
  );
}
