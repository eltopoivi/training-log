'use client';

import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sportLabel } from '@/lib/sports';

const RANGES = [
  { value: '7', label: 'Últimos 7 días' },
  { value: '30', label: 'Últimos 30 días' },
  { value: '90', label: 'Últimos 90 días' },
  { value: 'all', label: 'Todo' },
];

export function ActivityFilters({
  sport,
  range,
  sports,
}: {
  sport: string;
  range: string;
  sports: readonly string[];
}) {
  const router = useRouter();

  const update = (key: 'sport' | 'range', value: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set(key, value);
    params.set('page', '1');
    router.push(`/activities?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <div className="w-48">
        <Select value={sport} onValueChange={(v) => update('sport', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Deporte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {sports.map((s) => (
              <SelectItem key={s} value={s}>
                {sportLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-48">
        <Select value={range} onValueChange={(v) => update('range', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Rango" />
          </SelectTrigger>
          <SelectContent>
            {RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
