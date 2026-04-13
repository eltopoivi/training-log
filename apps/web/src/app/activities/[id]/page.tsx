import { notFound } from 'next/navigation';
import { ActivityChart } from '@/components/activities/ActivityChart';
import { ActivityMap } from '@/components/activities/ActivityMap';
import { LapsTable, type LapDTO } from '@/components/activities/LapsTable';
import { SportBadge } from '@/components/activities/SportBadge';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import type { ActivityStreamData } from '@repo/domain';
import {
  formatAbsoluteDate,
  formatDistance,
  formatDuration,
  formatElevation,
} from '@/lib/format';
import { ResyncButton } from './resync-button';

interface ActivityDetail {
  id: string;
  sport: string;
  name: string;
  startedAt: string;
  duration: number;
  distance: number | null;
  elevationGain: number | null;
  avgHr: number | null;
  maxHr: number | null;
  avgPower: number | null;
  np: number | null;
  tss: number | null;
  calories: number | null;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

export default async function ActivityDetailPage({ params }: { params: { id: string } }) {
  const [activity, streamRes, laps] = await Promise.all([
    apiFetch<ActivityDetail>(`/activities/${params.id}`).catch(() => null),
    apiFetch<{ data: ActivityStreamData; sampleRateSec: number }>(
      `/activities/${params.id}/stream`,
    ).catch(() => ({ data: {} as ActivityStreamData, sampleRateSec: 1 })),
    apiFetch<LapDTO[]>(`/activities/${params.id}/laps`).catch(() => [] as LapDTO[]),
  ]);

  if (!activity) notFound();

  const latlng = streamRes.data.latlng ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <SportBadge sport={activity.sport} />
            <span className="text-xs text-muted-foreground">
              {formatAbsoluteDate(activity.startedAt)}
            </span>
          </div>
          <h1 className="text-2xl font-semibold">{activity.name}</h1>
        </div>
        <ResyncButton id={activity.id} />
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
        <Stat label="Duración" value={formatDuration(activity.duration)} />
        <Stat label="Distancia" value={formatDistance(activity.distance)} />
        <Stat label="D+" value={formatElevation(activity.elevationGain)} />
        <Stat label="Avg HR" value={activity.avgHr != null ? `${activity.avgHr} bpm` : '—'} />
        <Stat label="Max HR" value={activity.maxHr != null ? `${activity.maxHr} bpm` : '—'} />
        <Stat label="Avg Power" value={activity.avgPower != null ? `${activity.avgPower} W` : '—'} />
        <Stat label="TSS" value={activity.tss != null ? String(Math.round(activity.tss)) : '—'} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <ActivityMap latlng={latlng} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ActivityChart stream={streamRes.data} />
        </CardContent>
      </Card>

      {laps.length > 0 && <LapsTable laps={laps} />}
    </div>
  );
}
