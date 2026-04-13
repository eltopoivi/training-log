import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CoachPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Coach</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">Próximamente</CardContent>
    </Card>
  );
}
