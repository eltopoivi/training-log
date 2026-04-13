import { Badge } from '@/components/ui/badge';
import { SPORT_ICONS, sportLabel } from '@/lib/sports';
import type { Sport } from '@repo/domain';

export function SportBadge({ sport }: { sport: string }) {
  const Icon = (SPORT_ICONS as Record<string, (typeof SPORT_ICONS)[Sport]>)[sport] ?? SPORT_ICONS.other;
  return (
    <Badge variant="secondary" className="gap-1">
      <Icon className="h-3 w-3" />
      {sportLabel(sport)}
    </Badge>
  );
}
