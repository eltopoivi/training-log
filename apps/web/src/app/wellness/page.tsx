import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WellnessPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wellness</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">Próximamente</CardContent>
    </Card>
  );
}
