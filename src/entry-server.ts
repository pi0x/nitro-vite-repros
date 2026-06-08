import { useRuntimeConfig } from 'nitro/runtime-config'
import { render } from './renderer.ts'

export default {
  async fetch (request: Request): Promise<Response> {
    const url = new URL(request.url)
    const config = useRuntimeConfig()
    return new Response(
      [
        `<!doctype html><meta charset="utf-8">`,
        `<h1>${url.pathname}</h1>`,
        `<pre>runtimeConfig=${JSON.stringify(config, null, 2)}</pre>`,
        `<pre>renderer=${await render()}</pre>`,
      ].join(''),
      { headers: { 'content-type': 'text/html; charset=utf-8' } },
    )
  },
}
