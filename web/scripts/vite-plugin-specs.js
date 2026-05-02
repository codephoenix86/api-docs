import path from 'node:path'
import { buildAll, PATHS } from './build-specs.js'

/**
 * Vite plugin that runs the spec build before dev/build, and on dev triggers a full reload
 * whenever a file under /specs changes (markdown, YAML, or meta.json).
 */
export function specsPlugin() {
  return {
    name: 'fastchat-docs:specs',
    enforce: 'pre',
    async buildStart() {
      try {
        await buildAll({ quiet: false })
      } catch (err) {
        this.error(`[specs] ${err.stack || err.message || String(err)}`)
      }
    },
    configureServer(server) {
      server.watcher.add(path.join(PATHS.SPECS_DIR, '**/*'))
      const onChange = async (file) => {
        if (!file.startsWith(PATHS.SPECS_DIR)) return
        try {
          await buildAll({ quiet: true })
          server.ws.send({ type: 'full-reload' })
          server.config.logger.info(`[specs] rebuilt after change: ${path.relative(PATHS.REPO_ROOT, file)}`)
        } catch (err) {
          server.config.logger.error(`[specs] rebuild failed: ${err.stack || err.message}`)
        }
      }
      server.watcher.on('change', onChange)
      server.watcher.on('add', onChange)
      server.watcher.on('unlink', onChange)
    },
  }
}
