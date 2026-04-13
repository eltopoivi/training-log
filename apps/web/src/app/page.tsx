import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityCard, type ActivityDTO } from '@/components/activities/ActivityCard';
import { apiFetch } from '@/lib/api';

interface ActivitiesResponse {
  items: ActivityDTO[];
  page: number;
  pageSize: number;
  total: number;
}

async function fetchLatest(): Promise<ActivityDTO | null> {
  try {
    const r = await apiFetch<ActivitiesResponse>('/activities?page=1&pageSize=1');
    return r.items[0] ?? null;
  } catch {
    return null;
  }
}

function SoonCard({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">Próximamente</CardContent>
    </Card>
  );
}

export default async function HomePage() {
  const latest = await fetchLatest();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Hoy</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SoonCard title="Wellness hoy" />
        <SoonCard title="Estado de forma" />
        <SoonCard title="Qué toca hoy" />
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Última actividad</CardTitle>
          </CardHeader>
          <CardContent>
            {latest ? (
              <ActivityCard a={latest} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Aún no hay actividades. Conecta Strava en Settings y sincroniza.
              </p>
            )}
          </CardContent>
        </Card>
        <SoonCard title="Progreso objetivo" />
        <SoonCard title="Coach" />
      </div>
    </div>
  );
}
