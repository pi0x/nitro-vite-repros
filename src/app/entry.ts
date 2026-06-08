// App entry that imports virtual modules served by `repro:virtual-fs`
// in `vite.config.ts`. The Vite ssr env resolves these correctly via
// the plugin pipeline; the prerender Nitro does not.
// @ts-expect-error virtual
import virtualCss from '#virtual/css'
// @ts-expect-error virtual
import virtualEntry from '#virtual/entry'

export default async function app () {
  return `entry=${virtualEntry} css.length=${virtualCss.length}`
}
