'use client';

import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { NutritionForm } from '@/components/forms/NutritionForm';
import {
  MEAL_LABELS,
  STORAGE_KEYS,
  useLocalStore,
  type NutritionEntry,
} from '@/lib/storage';
import { formatAbsoluteDate } from '@/lib/format';

export default function NutritionPage() {
  const { data, loading, set } = useLocalStore<NutritionEntry>(STORAGE_KEYS.nutrition);
  const [editing, setEditing] = useState<NutritionEntry | null>(null);
  const [open, setOpen] = useState(false);

  const byDate = useMemo(() => {
    const map = new Map<string, NutritionEntry[]>();
    for (const e of data) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => {
        const totalKcal = items.reduce((s, i) => s + (i.calories ?? 0), 0);
        return { date, items, totalKcal };
      });
  }, [data]);

  const save = (entry: NutritionEntry) => {
    set((prev) => {
      const idx = prev.findIndex((x) => x.id === entry.id);
      if (idx >= 0) {
        const copy = prev.slice();
        copy[idx] = entry;
        return copy;
      }
      return [...prev, entry];
    });
    toast.success(editing ? 'Comida actualizada' : 'Comida añadida');
    setEditing(null);
    setOpen(false);
  };

  const remove = (id: string) => {
    if (!confirm('¿Borrar esta comida?')) return;
    set((prev) => prev.filter((x) => x.id !== id));
    toast.success('Borrado');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Nutrición</h1>
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
              <DialogTitle>{editing ? 'Editar comida' : 'Nueva comida'}</DialogTitle>
            </DialogHeader>
            <NutritionForm
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
      ) : byDate.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">
          Sin comidas registradas. Empieza con lo que desayunes.
        </Card>
      ) : (
        <div className="space-y-4">
          {byDate.map(({ date, items, totalKcal }) => (
            <div key={date} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{formatAbsoluteDate(date)}</div>
                {totalKcal > 0 && (
                  <div className="text-xs text-muted-foreground">{totalKcal} kcal totales</div>
                )}
              </div>
              {items
                .slice()
                .sort((a, b) => {
                  const order = ['breakfast', 'lunch', 'snack', 'dinner'];
                  return order.indexOf(a.meal) - order.indexOf(b.meal);
                })
                .map((n) => (
                  <Card key={n.id} className="flex items-start justify-between gap-3 p-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{MEAL_LABELS[n.meal]}</Badge>
                        {n.calories != null && (
                          <span className="text-xs text-muted-foreground">{n.calories} kcal</span>
                        )}
                      </div>
                      <div className="font-medium">{n.description}</div>
                      {(n.proteinG != null || n.carbsG != null || n.fatG != null) && (
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          {n.proteinG != null && <span>P {n.proteinG}g</span>}
                          {n.carbsG != null && <span>C {n.carbsG}g</span>}
                          {n.fatG != null && <span>G {n.fatG}g</span>}
                        </div>
                      )}
                      {n.notes && <div className="text-sm text-muted-foreground">{n.notes}</div>}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(n);
                          setOpen(true);
                        }}
                        aria-label="editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(n.id)}
                        aria-label="borrar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
