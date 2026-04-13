'use client';

import { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import type { ActivityStreamData } from '@repo/domain';
import { formatDuration } from '@/lib/format';

interface Point {
  t: number;
  hr?: number;
  power?: number;
  alt?: number;
}

function downsample<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  const step = Math.ceil(arr.length / max);
  const out: T[] = [];
  for (let i = 0; i < arr.length; i += step) {
    const item = arr[i];
    if (item !== undefined) out.push(item);
  }
  return out;
}

export function ActivityChart({ stream }: { stream: ActivityStreamData }) {
  const [showHr, setShowHr] = useState(true);
  const [showPower, setShowPower] = useState(true);
  const [showAlt, setShowAlt] = useState(true);

  const hasHr = !!stream.hr?.length;
  const hasPower = !!stream.power?.length;
  const hasAlt = !!stream.altitude?.length;

  const data = useMemo<Point[]>(() => {
    const len = Math.max(
      stream.time?.length ?? 0,
      stream.hr?.length ?? 0,
      stream.power?.length ?? 0,
      stream.altitude?.length ?? 0,
    );
    if (!len) return [];
    const raw: Point[] = new Array(len);
    for (let i = 0; i < len; i++) {
      const t = stream.time?.[i] ?? i;
      const p: Point = { t };
      if (stream.hr?.[i] != null) p.hr = stream.hr[i];
      if (stream.power?.[i] != null) p.power = stream.power[i];
      if (stream.altitude?.[i] != null) p.alt = stream.altitude[i];
      raw[i] = p;
    }
    return downsample(raw, 2000);
  }, [stream]);

  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
        Sin datos de stream
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {hasHr && (
          <Button
            size="sm"
            variant={showHr ? 'default' : 'outline'}
            onClick={() => setShowHr((v) => !v)}
          >
            HR
          </Button>
        )}
        {hasPower && (
          <Button
            size="sm"
            variant={showPower ? 'default' : 'outline'}
            onClick={() => setShowPower((v) => !v)}
          >
            Power
          </Button>
        )}
        {hasAlt && (
          <Button
            size="sm"
            variant={showAlt ? 'default' : 'outline'}
            onClick={() => setShowAlt((v) => !v)}
          >
            Altitud
          </Button>
        )}
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis
              dataKey="t"
              tickFormatter={(v: number) => formatDuration(v)}
              minTickGap={40}
              stroke="#6b7280"
            />
            <YAxis yAxisId="hr" stroke="#ef4444" domain={['auto', 'auto']} />
            <YAxis yAxisId="power" orientation="right" stroke="#3b82f6" />
            <Tooltip labelFormatter={(v) => formatDuration(Number(v))} />
            <Legend />
            {hasAlt && showAlt && (
              <Area
                yAxisId="hr"
                type="monotone"
                dataKey="alt"
                stroke="none"
                fill="#9ca3af"
                fillOpacity={0.2}
                name="Altitud (m)"
              />
            )}
            {hasHr && showHr && (
              <Line
                yAxisId="hr"
                type="monotone"
                dataKey="hr"
                stroke="#ef4444"
                dot={false}
                name="HR (bpm)"
              />
            )}
            {hasPower && showPower && (
              <Line
                yAxisId="power"
                type="monotone"
                dataKey="power"
                stroke="#3b82f6"
                dot={false}
                name="Power (W)"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
