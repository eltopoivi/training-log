'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TrainingForm } from '@/components/forms/TrainingForm';
import { SPORT_ICONS, sportLabel } from '@/lib/sports';
import { STORAGE_KEYS, useLocalStore, type TrainingEntry } from '@/lib/storage';
import { formatAbsoluteDate, formatDuration } from '@/lib/format';

export default function TrainingPage() {
  const { data, loading, set } = useLocalStore<TrainingEntry>(STORAGE_KEYS.training);
  const [editing, setEditing] = useState<TrainingEntry | null>(null);
  const [open, setOpen] = useState(false);

  const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));

  const save = (entry: TrainingEntry) => {
    set((prev) => {
      const idx = prev.findIndex((x) => x.id === entry.id);
      if (idx >= 0) {
        const copy = prev.slice();
        copy[idx] = entry;
        return copy;
      }
      return [...prev, entry];
    });
    toast.success(editing ? 'Entrenamiento actualizado' : 'Entrenamiento añadido');
    setEditing(null);
    setOpen(false);
  };

  const remove = (id: string) => {
    if (!confirm('¿Borrar este entrenamiento?')) return;
    set((prev) => prev.filter((x) => x.id !== id));
    toast.success('Borrado');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Entrenamientos</h1>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              Añadir
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar entrenamiento' : 'Nuevo entrenamiento'}</DialogTitle>
            </DialogHeader>
            <TrainingForm
              initial={editing}
              onSubmit={save}
              onCancel={() => {
                setEditing(null);
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card className="p-6 text-sm text-muted-foreground">Cargando…</Card>
      ) : sorted.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">
          Aún no hay entrenamientos. Pulsa &quot;Añadir&quot;.
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((t) => {
            const Icon = SPORT_ICONS[t.sport] ?? SPORT_ICONS.other;
            return (
              <Card key={t.id} className="flex items-start justify-between gap-3 p-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Icon className="h-3 w-3" />
                      {sportLabel(t.sport)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatAbsoluteDate(t.date)}
                    </span>
                  </div>
                  <div className="font-medium">{t.name}</div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>{formatDuration(t.durationMin * 60)}</span>
                    {t.distanceKm != null && <span>{t.distanceKm.toFixed(2)} km</span>}
                    {t.elevationM != null && <span>D+ {Math.round(t.elevationM)} m</span>}
                    {t.avgHr != null && <span>{t.avgHr} bpm</span>}
                    {t.rpe != null && <span>RPE {t.rpe}</span>}
                  </div>
                  {t.notes && <div className="text-sm text-muted-foreground">{t.notes}</div>}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(t);
                      setOpen(true);
                    }}
                    aria-label="editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(t.id)}
                    aria-label="borrar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
