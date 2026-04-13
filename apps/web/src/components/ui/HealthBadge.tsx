'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { HealthStatus } from '@repo/domain';
import { cn } from '@/lib/utils';

export function HealthBadge() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const tick = () =>
      apiFetch<HealthStatus>('/health')
        .then((s) => {
          if (!cancelled) {
            setStatus(s);
            setErr(false);
          }
        })
        .catch(() => {
          if (!cancelled) setErr(true);
        });
    tick();
    const id = setInterval(tick, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const ok = !err && status?.status === 'ok';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs',
        ok ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800',
      )}
      title={status ? JSON.stringify(status.services) : 'loading'}
    >
      <span className={cn('h-2 w-2 rounded-full', ok ? 'bg-green-500' : 'bg-red-500')} />
      {ok ? 'API ok' : 'API caída'}
    </div>
  );
}
