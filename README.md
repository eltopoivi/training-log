# Tracker — Personal training / wellness / nutrition

Single-user Next.js 14 PWA para registrar entrenamientos, sueño y comida a mano.
Sin backend: los datos se guardan en localStorage del navegador. Despliegue directo
a Vercel como web estática + PWA.

## Stack

- Next.js 14 App Router + TypeScript strict
- Tailwind + shadcn/ui (primitives: button, card, input, label, textarea, select,
  dialog, badge, separator, skeleton)
- Serwist (PWA)
- Persistencia: `localStorage`

## Uso local

```bash
npm install
npm run dev     # http://localhost:3000
```

## Deploy en Vercel

1. Conecta el repo en Vercel → **Import Project**.
2. Framework: **Next.js** (auto-detectado).
3. Root Directory: `/` (raíz del repo).
4. Install command: `npm install`.
5. Build command: `npm run build`.
6. No hace falta ninguna variable de entorno.
7. Deploy.

Tras el primer build, cualquier push a `claude/workout-tracking-mvp-qPHEM` (o el
branch que configures) redeploya.

## Qué hay

- **Home** (`/`): resumen de hoy — wellness, entrenos, nutrición + últimos 5 entrenos.
- **Entrenamientos** (`/training`): CRUD con deporte, duración, distancia, D+, HR, RPE, notas.
- **Wellness** (`/wellness`): una entrada por día (upsert por fecha) con sueño, ánimo,
  energía, agujetas, peso, HR reposo, notas.
- **Nutrición** (`/nutrition`): comidas agrupadas por día y ordenadas por tipo
  (desayuno/comida/snack/cena), con kcal y macros.
- **Coach** (`/coach`): placeholder.
- **Settings** (`/settings`): nombre, exportar/importar JSON, borrar todo.

## Datos

Todo se guarda en `localStorage` bajo las claves:

```
tracker.v1.training
tracker.v1.wellness
tracker.v1.nutrition
tracker.v1.profile
```

Si cambias de dispositivo o de navegador: **Settings → Exportar JSON** y luego
**Importar** en el otro.

## Limitaciones conocidas

- Sin sincronización multi-dispositivo (está en el roadmap).
- Sin Strava / Coros por ahora (el MVP local+backend original vive en el historial).
- Sin autenticación (app personal, 1 usuario).

## PWA

Instálala desde Chrome/Edge (icono "Instalar" en la barra URL) para usarla como app
standalone con su propio icono y pantalla.
