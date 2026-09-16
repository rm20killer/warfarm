interface Env {
  WARFRAME_CACHE: KVNamespace; 
}

const KV_TTL_SECONDS = 60 * 60 * 4; 

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const targetPath = url.pathname.replace(/^\/api\/wfm/, '');
  const targetUrl = `https://api.warframe.market${targetPath}${url.search}`;

  const cacheKey = `wfm_proxy_${targetPath}${url.search}`;

  try {
    if (request.method === 'GET') {
      const cachedBody = await env.WARFRAME_CACHE.get(cacheKey);
      
      if (cachedBody) {
        return new Response(cachedBody, {
          status: 200,
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
        'Accept': 'application/json',
        'User-Agent': 'WarfarmTracker/1.0',
      },
    });

    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    headers.set('X-KV-Cache', 'MISS');

    if (request.method === 'GET' && response.ok) {
      const responseBodyText = await response.text();

      context.waitUntil(
        env.WARFRAME_CACHE.put(cacheKey, responseBodyText, {
          expirationTtl: KV_TTL_SECONDS,
        })
      );

      return new Response(responseBodyText, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Proxy Error' }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};