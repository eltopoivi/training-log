'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';

export function ResyncButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      variant="outline"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await apiFetch(`/activities/${id}/resync`, { method: 'POST' });
          toast.success('Reprocesamiento encolado');
        } catch {
          toast.error('No se pudo encolar el reprocesamiento');
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? 'Encolando…' : 'Reprocesar'}
    </Button>
  );
}
