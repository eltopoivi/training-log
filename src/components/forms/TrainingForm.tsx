'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ALL_SPORTS, Sport, sportLabel } from '@/lib/sports';
import { newId, todayISO, type TrainingEntry } from '@/lib/storage';

interface Props {
  initial?: TrainingEntry | null;
  onSubmit: (entry: TrainingEntry) => void;
  onCancel?: () => void;
}

function numOrUndef(v: string): number | undefined {
  if (v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function TrainingForm({ initial, onSubmit, onCancel }: Props) {
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [sport, setSport] = useState<Sport>(initial?.sport ?? Sport.TrailRun);
  const [name, setName] = useState(initial?.name ?? '');
  const [durationMin, setDurationMin] = useState(
    initial?.durationMin != null ? String(initial.durationMin) : '',
  );
  const [distanceKm, setDistanceKm] = useState(
    initial?.distanceKm != null ? String(initial.distanceKm) : '',
  );
  const [elevationM, setElevationM] = useState(
    initial?.elevationM != null ? String(initial.elevationM) : '',
  );
  const [avgHr, setAvgHr] = useState(initial?.avgHr != null ? String(initial.avgHr) : '');
  const [rpe, setRpe] = useState(initial?.rpe != null ? String(initial.rpe) : '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = numOrUndef(durationMin);
    if (!date || !name.trim() || duration == null || duration <= 0) return;
    const entry: TrainingEntry = {
      id: initial?.id ?? newId(),
      date,
      sport,
      name: name.trim(),
      durationMin: duration,
    };
    const dist = numOrUndef(distanceKm);
    if (dist != null) entry.distanceKm = dist;
    const elev = numOrUndef(elevationM);
    if (elev != null) entry.elevationM = elev;
    const hr = numOrUndef(avgHr);
    if (hr != null) entry.avgHr = hr;
    const r = numOrUndef(rpe);
    if (r != null) entry.rpe = r;
    const n = notes.trim();
    if (n) entry.notes = n;
    onSubmit(entry);
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="t-date">Fecha</Label>
        <Input id="t-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label>Deporte</Label>
        <Select value={sport} onValueChange={(v) => setSport(v as Sport)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_SPORTS.map((s) => (
              <SelectItem key={s} value={s}>
                {sportLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="t-name">Nombre</Label>
        <Input
          id="t-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Rodaje suave 60'"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-2">
          <Label htmlFor="t-dur">Duración (min)</Label>
          <Input
            id="t-dur"
            type="number"
            min={1}
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="t-dist">Distancia (km)</Label>
          <Input
            id="t-dist"
            type="number"
            step="0.01"
            min={0}
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="t-elev">D+ (m)</Label>
          <Input
            id="t-elev"
            type="number"
            min={0}
            value={elevationM}
            onChange={(e) => setElevationM(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="t-hr">Avg HR</Label>
          <Input
            id="t-hr"
            type="number"
            min={0}
            value={avgHr}
            onChange={(e) => setAvgHr(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="t-rpe">RPE (1–10)</Label>
          <Input
            id="t-rpe"
            type="number"
            min={1}
            max={10}
            value={rpe}
            onChange={(e) => setRpe(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="t-notes">Notas</Label>
        <Textarea id="t-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">{initial ? 'Guardar' : 'Añadir'}</Button>
      </div>
    </form>
  );
}
