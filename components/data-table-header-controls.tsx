'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowDown, ArrowUp, ArrowUpDown, ListFilter } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function useUpdateParam() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };
}

export function SortableDateHead() {
  const searchParams = useSearchParams();
  const updateParam = useUpdateParam();
  const sort = searchParams.get('sort') ?? '';
  const month = searchParams.get('month') ?? '';

  const Icon =
    sort === 'date_asc' ? ArrowUp : sort === 'date_desc' ? ArrowDown : ArrowUpDown;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className={`-ml-3 h-8 ${sort || month ? 'text-primary font-semibold' : ''}`}
        >
          Date Range <Icon className='h-3.5 w-3.5' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        <DropdownMenuLabel>Sort</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={sort}
          onValueChange={(v) => updateParam('sort', v || null)}
        >
          <DropdownMenuRadioItem value=''>Default</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='date_asc'>
            Oldest first
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value='date_desc'>
            Newest first
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Month</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={month}
          onValueChange={(v) => updateParam('month', v || null)}
        >
          <DropdownMenuRadioItem value=''>All months</DropdownMenuRadioItem>
          {MONTHS.map((name, index) => (
            <DropdownMenuRadioItem key={name} value={String(index + 1)}>
              {name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface FilterableHeadProps {
  label: string;
  param: string;
  options: string[];
}

export function FilterableHead({ label, param, options }: FilterableHeadProps) {
  const searchParams = useSearchParams();
  const updateParam = useUpdateParam();
  const value = searchParams.get(param) ?? '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className={`-ml-3 h-8 ${value ? 'text-primary font-semibold' : ''}`}
        >
          {label} <ListFilter className='h-3.5 w-3.5' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(v) => updateParam(param, v || null)}
        >
          <DropdownMenuRadioItem value=''>All</DropdownMenuRadioItem>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {option}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
