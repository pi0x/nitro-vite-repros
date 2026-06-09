import app from './app/entry.ts'

export async function render () {
  return `app entry: ${await app()}`
}
