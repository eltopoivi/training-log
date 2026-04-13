'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { newId, todayISO, type WellnessEntry } from '@/lib/storage';

interface Props {
  initial?: WellnessEntry | null;
  onSubmit: (entry: WellnessEntry) => void;
  onCancel?: () => void;
}

function numOrUndef(v: string): number | undefined {
  if (v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function WellnessForm({ initial, onSubmit, onCancel }: Props) {
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [sleepHours, setSleepHours] = useState(
    initial?.sleepHours != null ? String(initial.sleepHours) : '',
  );
  const [sleepQuality, setSleepQuality] = useState(
    initial?.sleepQuality != null ? String(initial.sleepQuality) : '',
  );
  const [mood, setMood] = useState(initial?.mood != null ? String(initial.mood) : '');
  const [energy, setEnergy] = useState(initial?.energy != null ? String(initial.energy) : '');
  const [soreness, setSoreness] = useState(initial?.soreness != null ? String(initial.soreness) : '');
  const [weightKg, setWeightKg] = useState(
    initial?.weightKg != null ? String(initial.weightKg) : '',
  );
  const [restingHr, setRestingHr] = useState(
    initial?.restingHr != null ? String(initial.restingHr) : '',
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    const entry: WellnessEntry = { id: initial?.id ?? newId(), date };
    const sh = numOrUndef(sleepHours);
    if (sh != null) entry.sleepHours = sh;
    const sq = numOrUndef(sleepQuality);
    if (sq != null) entry.sleepQuality = sq;
    const m = numOrUndef(mood);
    if (m != null) entry.mood = m;
    const en = numOrUndef(energy);
    if (en != null) entry.energy = en;
    const so = numOrUndef(soreness);
    if (so != null) entry.soreness = so;
    const w = numOrUndef(weightKg);
    if (w != null) entry.weightKg = w;
    const rh = numOrUndef(restingHr);
    if (rh != null) entry.restingHr = rh;
    const n = notes.trim();
    if (n) entry.notes = n;
    onSubmit(entry);
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="w-date">Fecha</Label>
        <Input id="w-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-2">
          <Label htmlFor="w-sh">Sueño (h)</Label>
          <Input
            id="w-sh"
            type="number"
            step="0.25"
            min={0}
            max={24}
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="w-sq">Calidad sueño (1–5)</Label>
          <Input
            id="w-sq"
            type="number"
            min={1}
            max={5}
            value={sleepQuality}
            onChange={(e) => setSleepQuality(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="w-mood">Ánimo (1–5)</Label>
          <Input
            id="w-mood"
            type="number"
            min={1}
            max={5}
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="w-en">Energía (1–5)</Label>
          <Input
            id="w-en"
            type="number"
            min={1}
            max={5}
            value={energy}
            onChange={(e) => setEnergy(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="w-so">Agujetas (1–5)</Label>
          <Input
            id="w-so"
            type="number"
            min={1}
            max={5}
            value={soreness}
            onChange={(e) => setSoreness(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="w-wt">Peso (kg)</Label>
          <Input
            id="w-wt"
            type="number"
            step="0.1"
            min={0}
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="w-rhr">HR reposo</Label>
          <Input
            id="w-rhr"
            type="number"
            min={0}
            value={restingHr}
            onChange={(e) => setRestingHr(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="w-notes">Notas</Label>
        <Textarea id="w-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
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
