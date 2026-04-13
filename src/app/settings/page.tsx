'use client';

import { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { clearAll, dumpAll, restoreAll, useProfile } from '@/lib/storage';

export default function SettingsPage() {
  const { profile, loading, save } = useProfile();
  const [name, setName] = useState('');
  const [importText, setImportText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) setName(profile.name);
  }, [loading, profile.name]);

  const exportNow = () => {
    const data = dumpAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export descargado');
  };

  const onFile = async (f: File) => {
    try {
      const text = await f.text();
      setImportText(text);
    } catch {
      toast.error('No se pudo leer el archivo');
    }
  };

  const importNow = () => {
    if (!importText.trim()) return;
    if (!confirm('Esto sobrescribe todos los datos actuales. ¿Seguro?')) return;
    try {
      const parsed: unknown = JSON.parse(importText);
      restoreAll(parsed);
      toast.success('Datos restaurados. Recarga para verlos.');
      setImportText('');
      setTimeout(() => window.location.reload(), 500);
    } catch (e) {
      toast.error(`Error: ${e instanceof Error ? e.message : 'JSON inválido'}`);
    }
  };

  const wipe = () => {
    if (!confirm('Borra TODOS tus datos (entrenamientos, wellness, nutrición). ¿Seguro?')) return;
    clearAll();
    toast.success('Todo borrado. Recarga.');
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid max-w-sm gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ivan"
            />
          </div>
          <Button
            onClick={() => {
              save({ name: name.trim() });
              toast.success('Guardado');
            }}
          >
            Guardar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportNow}>
              Exportar JSON
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              Elegir archivo…
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onFile(f);
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="import">Pegar JSON para importar</Label>
            <Textarea
              id="import"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={6}
              placeholder='{"training":[],"wellness":[],"nutrition":[]}'
            />
            <div>
              <Button onClick={importNow} disabled={!importText.trim()}>
                Importar y reemplazar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zona peligrosa</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={wipe}>
            Borrar todo
          </Button>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Los datos se guardan en localStorage de este navegador. Si cambias de dispositivo, usa
        Exportar/Importar. En el futuro se puede sincronizar con un backend.
      </p>
    </div>
  );
}
