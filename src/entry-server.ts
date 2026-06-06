import { useRuntimeConfig } from 'nitro/runtime-config'

export default {
  async fetch (_request: Request): Promise<Response> {
    const config = useRuntimeConfig()
    return new Response(
      `<!doctype html><meta charset="utf-8"><pre>runtimeConfig=${JSON.stringify(config, null, 2)}</pre>`,
      { headers: { 'content-type': 'text/html; charset=utf-8' } },
    )
  },
}
