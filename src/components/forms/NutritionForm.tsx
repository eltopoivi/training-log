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
import { MEAL_LABELS, newId, todayISO, type MealType, type NutritionEntry } from '@/lib/storage';

interface Props {
  initial?: NutritionEntry | null;
  onSubmit: (entry: NutritionEntry) => void;
  onCancel?: () => void;
}

function numOrUndef(v: string): number | undefined {
  if (v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function NutritionForm({ initial, onSubmit, onCancel }: Props) {
  const [date, setDate] = useState(initial?.date ?? todayISO());
  const [meal, setMeal] = useState<MealType>(initial?.meal ?? 'breakfast');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [calories, setCalories] = useState(
    initial?.calories != null ? String(initial.calories) : '',
  );
  const [proteinG, setProteinG] = useState(
    initial?.proteinG != null ? String(initial.proteinG) : '',
  );
  const [carbsG, setCarbsG] = useState(initial?.carbsG != null ? String(initial.carbsG) : '');
  const [fatG, setFatG] = useState(initial?.fatG != null ? String(initial.fatG) : '');
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !description.trim()) return;
    const entry: NutritionEntry = {
      id: initial?.id ?? newId(),
      date,
      meal,
      description: description.trim(),
    };
    const c = numOrUndef(calories);
    if (c != null) entry.calories = c;
    const p = numOrUndef(proteinG);
    if (p != null) entry.proteinG = p;
    const cb = numOrUndef(carbsG);
    if (cb != null) entry.carbsG = cb;
    const f = numOrUndef(fatG);
    if (f != null) entry.fatG = f;
    const n = notes.trim();
    if (n) entry.notes = n;
    onSubmit(entry);
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-2">
          <Label htmlFor="n-date">Fecha</Label>
          <Input
            id="n-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Comida</Label>
          <Select value={meal} onValueChange={(v) => setMeal(v as MealType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(MEAL_LABELS) as MealType[]).map((m) => (
                <SelectItem key={m} value={m}>
                  {MEAL_LABELS[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="n-desc">Descripción</Label>
        <Textarea
          id="n-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Avena con plátano y café"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-2">
          <Label htmlFor="n-kcal">Kcal</Label>
          <Input
            id="n-kcal"
            type="number"
            min={0}
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="n-p">Prot (g)</Label>
          <Input
            id="n-p"
            type="number"
            min={0}
            value={proteinG}
            onChange={(e) => setProteinG(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="n-c">Carb (g)</Label>
          <Input
            id="n-c"
            type="number"
            min={0}
            value={carbsG}
            onChange={(e) => setCarbsG(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="n-f">Grasa (g)</Label>
          <Input
            id="n-f"
            type="number"
            min={0}
            value={fatG}
            onChange={(e) => setFatG(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="n-notes">Notas</Label>
        <Textarea id="n-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
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
