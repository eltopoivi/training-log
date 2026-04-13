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
import { WellnessForm } from '@/components/forms/WellnessForm';
import { STORAGE_KEYS, useLocalStore, type WellnessEntry } from '@/lib/storage';
import { formatAbsoluteDate } from '@/lib/format';

function Stat({ label, value }: { label: string; value: string | number | undefined }) {
  if (value == null || value === '') return null;
  return (
    <span className="text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{value}</span> {label}
    </span>
  );
}

export default function WellnessPage() {
  const { data, loading, set } = useLocalStore<WellnessEntry>(STORAGE_KEYS.wellness);
  const [editing, setEditing] = useState<WellnessEntry | null>(null);
  const [open, setOpen] = useState(false);

  const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));

  const save = (entry: WellnessEntry) => {
    set((prev) => {
      const idx = prev.findIndex((x) => x.id === entry.id);
      if (idx >= 0) {
        const copy = prev.slice();
        copy[idx] = entry;
        return copy;
      }
      const sameDateIdx = prev.findIndex((x) => x.date === entry.date);
      if (sameDateIdx >= 0) {
        const copy = prev.slice();
        copy[sameDateIdx] = { ...entry, id: copy[sameDateIdx]!.id };
        return copy;
      }
      return [...prev, entry];
    });
    toast.success(editing ? 'Wellness actualizado' : 'Wellness añadido');
    setEditing(null);
    setOpen(false);
  };

  const remove = (id: string) => {
    if (!confirm('¿Borrar esta entrada?')) return;
    set((prev) => prev.filter((x) => x.id !== id));
    toast.success('Borrado');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Wellness</h1>
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
              <DialogTitle>{editing ? 'Editar wellness' : 'Nueva entrada wellness'}</DialogTitle>
            </DialogHeader>
            <WellnessForm
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
          Sin registros. Anota cómo has dormido, ánimo, energía…
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((w) => (
            <Card key={w.id} className="flex items-start justify-between gap-3 p-4">
              <div className="flex-1 space-y-2">
                <div className="text-sm font-medium">{formatAbsoluteDate(w.date)}</div>
                <div className="flex flex-wrap gap-4">
                  <Stat label="h sueño" value={w.sleepHours} />
                  <Stat label="calidad" value={w.sleepQuality} />
                  <Stat label="ánimo" value={w.mood} />
                  <Stat label="energía" value={w.energy} />
                  <Stat label="agujetas" value={w.soreness} />
                  <Stat label="kg" value={w.weightKg} />
                  <Stat label="bpm reposo" value={w.restingHr} />
                </div>
                {w.notes && <div className="text-sm text-muted-foreground">{w.notes}</div>}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditing(w);
                    setOpen(true);
                  }}
                  aria-label="editar"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => remove(w.id)} aria-label="borrar">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
