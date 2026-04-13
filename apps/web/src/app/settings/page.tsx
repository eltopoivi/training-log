import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch, API_BASE } from '@/lib/api';
import { SettingsClient } from './settings-client';

interface StravaStatus {
  connected: boolean;
  connectedSince: string | null;
  externalUserId: string | null;
  lastSyncAt: string | null;
}

interface MeResponse {
  id: string;
  email: string;
  name: string;
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { strava?: string; reason?: string };
}) {
  const [status, me] = await Promise.all([
    apiFetch<StravaStatus>('/integrations/strava/status').catch(() => ({
      connected: false,
      connectedSince: null,
      externalUserId: null,
      lastSyncAt: null,
    })),
    apiFetch<MeResponse>('/me').catch(() => null),
  ]);

  const connectUrl = `${API_BASE}/api/integrations/strava/connect`;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <SettingsClient
        status={status}
        connectUrl={connectUrl}
        strava={searchParams.strava ?? null}
        reason={searchParams.reason ?? null}
      />

      <Card>
        <CardHeader>
          <CardTitle>Usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {me ? (
            <>
              <div>
                <span className="text-muted-foreground">Nombre: </span>
                {me.name}
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                {me.email}
              </div>
              <div className="font-mono text-xs text-muted-foreground">id: {me.id}</div>
            </>
          ) : (
            <span className="text-muted-foreground">No se pudo cargar el usuario.</span>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
