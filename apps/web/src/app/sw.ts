import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, NetworkFirst } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.href.startsWith(`${apiBase}/api`),
      handler: new NetworkFirst({
        cacheName: 'api',
        networkTimeoutSeconds: 5,
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
