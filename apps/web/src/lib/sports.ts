import { Sport, SPORT_LABELS } from '@repo/domain';
import {
  Bike,
  Dumbbell,
  Footprints,
  Mountain,
  MountainSnow,
  Snowflake,
  Waves,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const SPORT_ICONS: Record<Sport, LucideIcon> = {
  trail_run: Mountain,
  run: Footprints,
  ride: Bike,
  mtb: Bike,
  gym: Dumbbell,
  ski: Snowflake,
  backcountry_ski: MountainSnow,
  hike: Mountain,
  yoga: Zap,
  swim: Waves,
  other: Zap,
};

export function sportLabel(s: string): string {
  return (SPORT_LABELS as Record<string, string>)[s] ?? 'Otros';
}
