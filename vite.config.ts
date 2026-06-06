import { defineConfig } from 'vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  plugins: [
    nitro({
      runtimeConfig: { public: { probe: 'hello-from-runtime-config' } },
    }),
  ],
})
