import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { SportBadge } from './SportBadge';
import {
  formatAbsoluteDate,
  formatDistance,
  formatDuration,
  formatElevation,
  formatRelativeDate,
} from '@/lib/format';

export interface ActivityDTO {
  id: string;
  sport: string;
  name: string;
  startedAt: string;
  duration: number;
  distance: number | null;
  elevationGain: number | null;
  avgHr: number | null;
  tss: number | null;
}

export function ActivityCard({ a }: { a: ActivityDTO }) {
  return (
    <Link href={`/activities/${a.id}`}>
      <Card className="p-4 transition-colors hover:border-primary/40 hover:bg-accent/30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SportBadge sport={a.sport} />
            <span title={formatAbsoluteDate(a.startedAt)} className="text-xs text-muted-foreground">
              {formatRelativeDate(a.startedAt)}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{formatDuration(a.duration)}</span>
            <span>{formatDistance(a.distance)}</span>
            <span>D+ {formatElevation(a.elevationGain)}</span>
            {a.avgHr != null && <span>{a.avgHr} bpm</span>}
            {a.tss != null && <span>TSS {Math.round(a.tss)}</span>}
          </div>
        </div>
        <div className="mt-2 font-medium">{a.name}</div>
      </Card>
    </Link>
  );
}
