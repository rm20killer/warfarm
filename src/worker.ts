/**
 * Cloudflare Worker Entry Point for Warfarm Tracker
 * Handles:
 * 1. Warframe Market API Reverse Proxy with KV Caching (/api/wfm/*)
 *    - Caches successful 200 OK responses in KV
 *    - Caches 404 / untradeable / not-found responses in KV (negative caching) to prevent repeated requests
 * 2. Static Asset delivery & Single-Page Application (SPA) routing fallback
 */

export interface Env {
  WARFRAME_CACHE?: {
    get(key: string): Promise<string | null>;
    put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  };
  ASSETS: {
    fetch(request: Request | string): Promise<Response>;
  };
}

export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const KV_TTL_SECONDS = 60 * 60 * 4; // 4 hours
const KV_NEGATIVE_TTL_SECONDS = 60 * 60 * 24; // 24 hours for 404 / untradeable items

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Handle Warframe.market API proxy
    if (url.pathname.startsWith('/api/wfm')) {
      const targetPath = url.pathname.replace(/^\/api\/wfm/, '');
      const targetUrl = `https://api.warframe.market${targetPath}${url.search}`;

      const cacheKey = `wfm_proxy_${targetPath}${url.search}`;
      const skipCache = url.searchParams.get('nocache') === '1';

      try {
        if (request.method === 'GET' && !skipCache && env.WARFRAME_CACHE) {
          const cachedBody = await env.WARFRAME_CACHE.get(cacheKey);

          if (cachedBody) {
            let isNotFound = false;
            try {
              const parsed = JSON.parse(cachedBody);
              isNotFound = Boolean(parsed && parsed.notFound);
            } catch {
              // Ignore JSON parse check
            }

            return new Response(cachedBody, {
              status: isNotFound ? 404 : 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                'Cache-Control': 'public, max-age=300, s-maxage=300',
                'X-KV-Cache': 'HIT',
              },
            });
          }
        }

        const response = await fetch(targetUrl, {
          method: request.method,
          headers: {
            Accept: 'application/json',
            'User-Agent': 'WarfarmTracker/1.0',
          },
        });

        const headers = new Headers(response.headers);
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
        headers.set('X-KV-Cache', 'MISS');

        // Handle successful 200 OK responses -> Cache in KV
        if (request.method === 'GET' && response.ok) {
          const responseBodyText = await response.text();

          if (env.WARFRAME_CACHE) {
            ctx.waitUntil(
              env.WARFRAME_CACHE.put(cacheKey, responseBodyText, {
                expirationTtl: KV_TTL_SECONDS,
              })
            );
          }

          return new Response(responseBodyText, {
            status: response.status,
            statusText: response.statusText,
            headers,
          });
        }

        // Handle 404 Not Found (item untradeable / no marketplace data) -> Cache negative result in KV
        if (request.method === 'GET' && response.status === 404) {
          const negativeBody = JSON.stringify({
            error: 'Item not found on Warframe.market',
            notFound: true,
            data: [],
          });

          if (env.WARFRAME_CACHE) {
            ctx.waitUntil(
              env.WARFRAME_CACHE.put(cacheKey, negativeBody, {
                expirationTtl: KV_NEGATIVE_TTL_SECONDS,
              })
            );
          }

          return new Response(negativeBody, {
            status: 404,
            statusText: 'Not Found',
            headers,
          });
        }

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Proxy Error';
        return new Response(JSON.stringify({ error: errorMsg }), {
          status: 502,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // Pass all other requests through to Static Assets (SPA)
    return env.ASSETS.fetch(request);
  },
};
