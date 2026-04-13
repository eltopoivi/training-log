'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SPORT_ICONS, sportLabel } from '@/lib/sports';
import {
  MEAL_LABELS,
  STORAGE_KEYS,
  todayISO,
  useLocalStore,
  useProfile,
  type NutritionEntry,
  type TrainingEntry,
  type WellnessEntry,
} from '@/lib/storage';
import { formatDuration } from '@/lib/format';

export default function HomePage() {
  const today = todayISO();
  const training = useLocalStore<TrainingEntry>(STORAGE_KEYS.training);
  const wellness = useLocalStore<WellnessEntry>(STORAGE_KEYS.wellness);
  const nutrition = useLocalStore<NutritionEntry>(STORAGE_KEYS.nutrition);
  const { profile } = useProfile();

  const todayTrainings = training.data.filter((t) => t.date === today);
  const todayWellness = wellness.data.find((w) => w.date === today) ?? null;
  const todayNutrition = nutrition.data.filter((n) => n.date === today);
  const totalKcal = todayNutrition.reduce((s, n) => s + (n.calories ?? 0), 0);
  const recent = [...training.data]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Hola{profile.name ? `, ${profile.name}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground">Resumen de hoy</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Wellness hoy</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/wellness">Abrir</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todayWellness ? (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {todayWellness.sleepHours != null && (
                  <span>
                    <b>{todayWellness.sleepHours}h</b> sueño
                  </span>
                )}
                {todayWellness.sleepQuality != null && (
                  <span>calidad {todayWellness.sleepQuality}/5</span>
                )}
                {todayWellness.mood != null && <span>ánimo {todayWellness.mood}/5</span>}
                {todayWellness.energy != null && <span>energía {todayWellness.energy}/5</span>}
                {todayWellness.weightKg != null && <span>{todayWellness.weightKg} kg</span>}
                {todayWellness.restingHr != null && <span>{todayWellness.restingHr} bpm</span>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aún no has registrado hoy.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Entreno hoy</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/training">Abrir</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todayTrainings.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin sesiones registradas.</p>
            ) : (
              <div className="space-y-2">
                {todayTrainings.map((t) => {
                  const Icon = SPORT_ICONS[t.sport] ?? SPORT_ICONS.other;
                  return (
                    <div key={t.id} className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="gap-1">
                        <Icon className="h-3 w-3" />
                        {sportLabel(t.sport)}
                      </Badge>
                      <span className="font-medium">{t.name}</span>
                      <span className="text-muted-foreground">
                        {formatDuration(t.durationMin * 60)}
                        {t.distanceKm != null ? ` · ${t.distanceKm.toFixed(2)} km` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Nutrición hoy</CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/nutrition">Abrir</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todayNutrition.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin comidas registradas.</p>
            ) : (
              <div className="space-y-1 text-sm">
                {todayNutrition.map((n) => (
                  <div key={n.id} className="flex gap-2">
                    <Badge variant="secondary">{MEAL_LABELS[n.meal]}</Badge>
                    <span className="flex-1 truncate">{n.description}</span>
                    {n.calories != null && (
                      <span className="text-muted-foreground">{n.calories} kcal</span>
                    )}
                  </div>
                ))}
                {totalKcal > 0 && (
                  <div className="pt-1 text-xs text-muted-foreground">
                    Total: {totalKcal} kcal
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Últimos entrenamientos</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ve a{' '}
                <Link href="/training" className="underline">
                  Entrenamientos
                </Link>{' '}
                y añade el primero.
              </p>
            ) : (
              <div className="space-y-2">
                {recent.map((t) => {
                  const Icon = SPORT_ICONS[t.sport] ?? SPORT_ICONS.other;
                  return (
                    <div
                      key={t.id}
                      className="flex flex-wrap items-center gap-2 border-b py-2 text-sm last:border-b-0"
                    >
                      <Badge variant="secondary" className="gap-1">
                        <Icon className="h-3 w-3" />
                        {sportLabel(t.sport)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{t.date}</span>
                      <span className="font-medium">{t.name}</span>
                      <span className="ml-auto text-muted-foreground">
                        {formatDuration(t.durationMin * 60)}
                        {t.distanceKm != null ? ` · ${t.distanceKm.toFixed(2)} km` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
