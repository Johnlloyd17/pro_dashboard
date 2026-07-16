'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface StatCard {
  id: string;
  title: string;
  value: number | string;
  description: string;
}

interface OverviewStatCardsProps {
  topRow: StatCard[];
  bottomRow: StatCard[];
}

export function OverviewStatCards({ topRow, bottomRow }: OverviewStatCardsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeStat = searchParams.get('stat');

  const handleClick = (statId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeStat === statId) {
      params.delete('stat');
    } else {
      params.set('stat', statId);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const renderCard = (item: StatCard) => (
    <Card
      key={item.id}
      className={`col-span-1 cursor-pointer transition-colors ${
        activeStat === item.id
          ? 'border-primary bg-primary/5'
          : 'hover:bg-muted/50'
      }`}
      onClick={() => handleClick(item.id)}
    >
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardTitle className='text-3xl'>{item.value}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className='grid grid-cols-4 gap-4'>
        {topRow.map(renderCard)}
      </div>
      <div className='grid grid-cols-4 gap-4'>
        {bottomRow.map(renderCard)}
      </div>
    </>
  );
}
