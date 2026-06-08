import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { nitro } from 'nitro/vite'
import type { Nitro } from 'nitro/types'

const rendererEntry = fileURLToPath(new URL('./src/renderer.ts', import.meta.url))
const globalCss = fileURLToPath(new URL('./src/app/assets/global.css', import.meta.url))

export default defineConfig({
  plugins: [
    nitro({
      runtimeConfig: { public: { probe: 'hello-from-runtime-config' } },
      prerender: { routes: ['/', '/prerendered'] },
    }),
    {
      // A Vite plugin that owns a custom virtual-module scheme, scoped
      // to server-consumer envs. The ssr env build resolves these via
      // the plugin pipeline; the deployable's nitro env rebundle does
      // the same. The prerender Nitro does not, because it builds with
      // standalone rolldown (see https://github.com/nitrojs/nitro/pull/4152
      // for the related `nitro/*` proxy plumbing in service envs).
      name: 'repro:virtual-fs',
      enforce: 'pre',
      applyToEnvironment: env => env.config.consumer === 'server',
      resolveId: {
        filter: { id: /^#virtual\// },
        handler (id) { return '\0' + id },
      },
      load: {
        filter: { id: /^\0#virtual\// },
        handler (id) {
          if (id === '\0#virtual/entry') return 'export default "live-entry-content"'
          if (id === '\0#virtual/css') {
            return `import ${JSON.stringify(globalCss)}\nexport default "css-loaded"`
          }
        },
      },
    },
    {
      // Mirror of the proxy plumbing landed in
      // https://github.com/nitrojs/nitro/pull/4152: service environments
      // must not bundle their own copy of `nitro/*` runtime modules,
      // otherwise the ssr entry gets stub instances instead of sharing
      // the Nitro environment's runtime state. The PR externalises
      // `/^nitro(\/|$)/` from service envs in prod and proxies them via
      // `__VITE_ENVIRONMENT_RUNNER_IMPORT__` in dev.
      //
      // In dev, Vite's env-runner short-circuits externalised
      // bare-specifier imports to Node before the proxy plugin runs.
      // `noExternal` here forces `nitro/*` through the plugin pipeline
      // so the proxy can claim them. Without this, `useRuntimeConfig()`
      // in dev returns `{ app: {}, nitro: {} }` (the stub at
      // `nitro/dist/runtime/virtual/runtime-config.mjs`).
      name: 'repro:noExternal-nitro',
      configEnvironment (name) {
        if (name !== 'ssr') return
        return { resolve: { noExternal: [/^nitro(\/|$)/] } }
      },
    },
    {
      // Wire `src/renderer.ts` as the prerender Nitro's `/**` handler
      // via a `.nitro` module hook (the shape `nitro/vite` scans for in
      // `nitro/dist/vite.mjs`).
      //
      // The prerender Nitro spins up via
      // `createNitro(prerendererConfig)` and builds with standalone
      // rolldown when the main builder is `vite`, so none of the Vite
      // plugins above reach it. The static chain
      // `renderer.ts -> app/entry.ts -> #virtual/css` is unresolved in
      // the prerender bundle; rolldown leaves the bare specifier in the
      // output and Node errors at prerender runtime with
      // `ERR_PACKAGE_IMPORT_NOT_DEFINED`. See README for the trace.
      //
      // Comment this plugin out to make the build succeed (without any
      // prerendering — every prerender route 404s instead of 500ing).
      name: 'repro:prerender-handler',
      nitro: (nitroInstance: Nitro) => {
        nitroInstance.hooks.hook('prerender:config', (prerendererConfig) => {
          if (prerendererConfig.renderer) return
          prerendererConfig.renderer = { handler: rendererEntry }
        })
      },
    },
  ],
})
