const SUGA_ORIGIN = 'https://ldcfjmuj2inb-production-lvp437ch.us-central1.suga.run'

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const targetUrl = SUGA_ORIGIN + url.pathname + url.search

    const proxyReq = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    })
    proxyReq.headers.set('Host', new URL(SUGA_ORIGIN).host)

    return fetch(proxyReq)
  },
}
