import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import { nitro } from 'nitro/vite'

const globalCss = fileURLToPath(new URL('./src/app/assets/global.css', import.meta.url))

const ssrVirtuals: Plugin = {
  name: 'ssr-virtuals',
  enforce: 'pre',
  sharedDuringBuild: true,
  applyToEnvironment: env => env.name === "ssr",
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
}

export default defineConfig({
  environments: {
    ssr: {
      build: {
        rolldownOptions: {
          input: './src/entry-server.ts',
          plugins: [ssrVirtuals] // handles vite build
        }
      }
    }
  },
  plugins: [
    ssrVirtuals, // handles vite dev
    nitro({
      runtimeConfig: { public: { probe: 'hello-from-runtime-config' } },
      prerender: { routes: ['/', '/prerendered'], failOnError: true },
    }),
  ],
})
