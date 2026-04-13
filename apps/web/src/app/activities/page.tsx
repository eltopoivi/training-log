import { ActivityCard, type ActivityDTO } from '@/components/activities/ActivityCard';
import { ActivityFilters } from './filters';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { ALL_SPORTS } from '@repo/domain';

interface ActivitiesResponse {
  items: ActivityDTO[];
  page: number;
  pageSize: number;
  total: number;
}

interface StravaStatus {
  connected: boolean;
}

function rangeToDates(range: string): { from?: string; to?: string } {
  if (range === 'all' || !range) return {};
  const days = Number(range);
  if (!Number.isFinite(days) || days <= 0) return {};
  const to = new Date();
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
}

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: { sport?: string; range?: string; page?: string };
}) {
  const sport = searchParams.sport ?? 'all';
  const range = searchParams.range ?? '30';
  const page = Math.max(1, Number(searchParams.page) || 1);
  const pageSize = 20;

  const { from, to } = rangeToDates(range);
  const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (sport !== 'all') qs.set('sport', sport);
  if (from) qs.set('from', from);
  if (to) qs.set('to', to);

  const [data, status] = await Promise.all([
    apiFetch<ActivitiesResponse>(`/activities?${qs}`).catch(() => ({
      items: [],
      page: 1,
      pageSize,
      total: 0,
    })),
    apiFetch<StravaStatus>('/integrations/strava/status').catch(() => ({ connected: false })),
  ]);

  const totalPages = Math.max(1, Math.ceil(data.total / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Actividades</h1>
        <div className="text-xs text-muted-foreground">
          {data.total} total · página {data.page}/{totalPages}
        </div>
      </div>

      <ActivityFilters sport={sport} range={range} sports={ALL_SPORTS} />

      {data.items.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            {!status.connected ? (
              <div className="space-y-2">
                <p>Conecta Strava para empezar a ver tus actividades.</p>
                <Button asChild>
                  <Link href="/settings">Ir a Settings</Link>
                </Button>
              </div>
            ) : (
              <p>No hay actividades en este rango. Pulsa &quot;Sincronizar últimas 30&quot; en Settings.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.items.map((a) => (
            <ActivityCard key={a.id} a={a} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button asChild variant="outline" size="sm" disabled={page <= 1}>
            <Link
              href={{
                pathname: '/activities',
                query: { sport, range, page: String(Math.max(1, page - 1)) },
              }}
            >
              Anterior
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
            <Link
              href={{
                pathname: '/activities',
                query: { sport, range, page: String(Math.min(totalPages, page + 1)) },
              }}
            >
              Siguiente
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
