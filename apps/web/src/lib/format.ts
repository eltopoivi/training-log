import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatDistance(meters: number | null | undefined): string {
  if (meters == null) return '—';
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatElevation(m: number | null | undefined): string {
  if (m == null) return '—';
  return `${Math.round(m)} m`;
}

/** meters per second → min:ss/km */
export function formatPace(mps: number | null | undefined): string {
  if (!mps || mps <= 0) return '—';
  const secPerKm = 1000 / mps;
  const m = Math.floor(secPerKm / 60);
  const s = Math.floor(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}/km`;
}

export function formatRelativeDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
}

export function formatAbsoluteDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
