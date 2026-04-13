import { formatDistance, formatDuration } from '@/lib/format';

export interface LapDTO {
  id: string;
  index: number;
  duration: number;
  distance: number | null;
  avgHr: number | null;
  avgPower: number | null;
}

export function LapsTable({ laps }: { laps: LapDTO[] }) {
  if (!laps.length) return null;
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-medium">#</th>
            <th className="px-3 py-2 text-left font-medium">Duración</th>
            <th className="px-3 py-2 text-left font-medium">Distancia</th>
            <th className="px-3 py-2 text-left font-medium">Avg HR</th>
            <th className="px-3 py-2 text-left font-medium">Avg Power</th>
          </tr>
        </thead>
        <tbody>
          {laps.map((l) => (
            <tr key={l.id} className="border-t">
              <td className="px-3 py-2">{l.index + 1}</td>
              <td className="px-3 py-2">{formatDuration(l.duration)}</td>
              <td className="px-3 py-2">{formatDistance(l.distance)}</td>
              <td className="px-3 py-2">{l.avgHr != null ? `${l.avgHr} bpm` : '—'}</td>
              <td className="px-3 py-2">{l.avgPower != null ? `${l.avgPower} W` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
