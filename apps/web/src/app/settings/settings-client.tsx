'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { formatAbsoluteDate } from '@/lib/format';

interface StravaStatus {
  connected: boolean;
  connectedSince: string | null;
  externalUserId: string | null;
  lastSyncAt: string | null;
}

export function SettingsClient({
  status: initialStatus,
  connectUrl,
  strava,
  reason,
}: {
  status: StravaStatus;
  connectUrl: string;
  strava: string | null;
  reason: string | null;
}) {
  const [status, setStatus] = useState<StravaStatus>(initialStatus);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (strava === 'connected') toast.success('Strava conectada');
    else if (strava === 'error') toast.error(`Error conectando Strava: ${reason ?? 'desconocido'}`);
  }, [strava, reason]);

  const disconnect = async () => {
    setBusy('disconnect');
    try {
      await apiFetch('/integrations/strava/disconnect', { method: 'POST' });
      setStatus({ connected: false, connectedSince: null, externalUserId: null, lastSyncAt: null });
      toast.success('Strava desconectada');
    } catch {
      toast.error('No se pudo desconectar');
    } finally {
      setBusy(null);
    }
  };

  const syncNow = async () => {
    setBusy('sync');
    try {
      const r = await apiFetch<{ enqueued: number }>('/integrations/strava/sync-now', {
        method: 'POST',
      });
      toast.success(`Encoladas ${r.enqueued} actividades`);
    } catch {
      toast.error('No se pudo sincronizar');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integraciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-medium">Strava</div>
            {status.connected ? (
              <div className="text-xs text-muted-foreground">
                Conectada desde{' '}
                {status.connectedSince ? formatAbsoluteDate(status.connectedSince) : '—'}
                {status.lastSyncAt ? (
                  <> · último sync {formatAbsoluteDate(status.lastSyncAt)}</>
                ) : null}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">No conectada</div>
            )}
          </div>
          <div className="flex gap-2">
            {status.connected ? (
              <>
                <Button variant="outline" disabled={busy !== null} onClick={syncNow}>
                  {busy === 'sync' ? 'Sincronizando…' : 'Sincronizar últimas 30'}
                </Button>
                <Button variant="destructive" disabled={busy !== null} onClick={disconnect}>
                  {busy === 'disconnect' ? 'Desconectando…' : 'Desconectar'}
                </Button>
              </>
            ) : (
              <Button asChild>
                <a href={connectUrl}>Conectar Strava</a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
