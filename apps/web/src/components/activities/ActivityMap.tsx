'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export function ActivityMap({ latlng }: { latlng: [number, number][] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || latlng.length < 2) return;

    const coords: [number, number][] = latlng.map(([lat, lng]) => [lng, lat]);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
      center: coords[0],
      zoom: 12,
    });

    map.on('load', () => {
      map.addSource('track', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: coords },
        },
      });
      map.addLayer({
        id: 'track-line',
        type: 'line',
        source: 'track',
        paint: {
          'line-color': '#3b82f6',
          'line-width': 3,
        },
      });

      // Start + end markers
      const start = coords[0];
      const end = coords[coords.length - 1];
      if (start) new maplibregl.Marker({ color: '#22c55e' }).setLngLat(start).addTo(map);
      if (end) new maplibregl.Marker({ color: '#ef4444' }).setLngLat(end).addTo(map);

      // Fit bounds
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0]),
      );
      map.fitBounds(bounds, { padding: 40, duration: 0 });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [latlng]);

  if (latlng.length < 2) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
        Sin datos de GPS
      </div>
    );
  }

  return <div ref={containerRef} className="h-96 w-full overflow-hidden rounded-md border" />;
}
