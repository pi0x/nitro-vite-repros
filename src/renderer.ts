// Renderer module wired into the prerender Nitro as `renderer.handler`
// via the `repro:prerender-handler` plugin in `vite.config.ts`. The
// prerender Nitro builds with standalone rolldown, so any static
// import chain that lands on a virtual id only resolvable by a Vite
// plugin will fail in the prerender bundle.
import app from './app/entry.ts'

export async function render () {
  return `app entry: ${await app()}`
}
