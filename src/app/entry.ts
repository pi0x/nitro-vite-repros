// @ts-expect-error virtual
import virtualCss from '#virtual/css'

// @ts-expect-error virtual
import virtualEntry from '#virtual/entry'

export default async function app () {
  return `entry=${virtualEntry} css.length=${virtualCss.length}`
}
