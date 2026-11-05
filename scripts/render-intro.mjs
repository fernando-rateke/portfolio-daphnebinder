#!/usr/bin/env node
/**
 * Renderiza o filme de introdução (src/film) quadro a quadro e gera os vídeos
 * em public/intro/ com ffmpeg.
 *
 * Requisitos: ffmpeg no PATH e Playwright com Chromium
 *   (npm i -D playwright && npx playwright install chromium)
 *
 * Uso:
 *   npm run render:intro                    # horizontal + vertical
 *   npm run render:intro -- --only=landscape
 *   npm run render:intro -- --preview       # só alguns quadros PNG para conferir
 */
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createServer } from 'vite'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  }),
)
const FPS = Number(args.fps || 30)
const DURATION = 10
const root = resolve(import.meta.dirname, '..')
const outDir = resolve(root, 'public/intro')
const tmp = resolve(root, '.film-frames')

const FORMATS = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1920 },
}
const only = args.only ? [args.only] : Object.keys(FORMATS)

const ff = (...a) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...a], { stdio: 'inherit' })

const server = await createServer({ root, server: { port: 5299, strictPort: true }, logLevel: 'error' })
await server.listen()
const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})

try {
  for (const name of only) {
    const { width, height } = FORMATS[name]
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
    page.on('pageerror', (e) => console.error('[page]', e.message))
    await page.goto('http://localhost:5299/film.html?capture=1', { waitUntil: 'networkidle' })
    await page.waitForFunction(() => window.__ready === true && window.__badgeReady === true, null, { timeout: 120_000 })
    // aquece shaders/texturas
    for (const t of [0, 3, 6, 9]) await page.evaluate((t) => window.__frame(t), t)

    const dir = resolve(tmp, name)
    rmSync(dir, { recursive: true, force: true })
    mkdirSync(dir, { recursive: true })

    if (args.preview) {
      for (const t of [0.6, 1.6, 2.4, 3.1, 4.2, 5.4, 6.3, 7.0, 8.3, 9.2]) {
        await page.evaluate((t) => window.__frame(t), t)
        await page.screenshot({ path: resolve(dir, `preview-${t.toFixed(1)}.png`) })
      }
      console.log(`preview ${name}: ${dir}`)
      await page.close()
      continue
    }

    const total = Math.round(FPS * DURATION)
    const t0 = Date.now()
    for (let i = 0; i < total; i++) {
      await page.evaluate((t) => window.__frame(t), i / FPS)
      await page.screenshot({ path: resolve(dir, `f_${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 94 })
      if (i % 30 === 0) console.log(`${name}: ${i}/${total} (${((Date.now() - t0) / 1000).toFixed(0)}s)`)
    }
    await page.close()

    mkdirSync(outDir, { recursive: true })
    const input = ['-framerate', String(FPS), '-i', resolve(dir, 'f_%04d.jpg')]
    const h264 = ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-movflags', '+faststart']
    if (name === 'landscape') {
      ff(...input, ...h264, '-crf', '19', resolve(outDir, 'intro-1080.mp4'))
      ff(...input, ...h264, '-crf', '24', '-vf', 'scale=1280:720:flags=lanczos', resolve(outDir, 'intro-720.mp4'))
      ff('-i', resolve(dir, 'f_0000.jpg'), '-vf', 'scale=1280:720', '-q:v', '4', resolve(outDir, 'poster.jpg'))
      ff('-i', resolve(dir, `f_${String(Math.round(FPS * 8.4)).padStart(4, '0')}.jpg`), '-vf', 'scale=1200:675', '-q:v', '3', resolve(root, 'public/og.jpg'))
    } else {
      ff(...input, ...h264, '-crf', '19', resolve(outDir, 'intro-vertical-1080.mp4'))
      ff(...input, ...h264, '-crf', '24', '-vf', 'scale=720:1280:flags=lanczos', resolve(outDir, 'intro-vertical-720.mp4'))
      ff('-i', resolve(dir, 'f_0000.jpg'), '-vf', 'scale=720:1280', '-q:v', '4', resolve(outDir, 'poster-vertical.jpg'))
    }
    console.log(`${name}: pronto`)
  }
  if (!args.preview && !args.keep) rmSync(tmp, { recursive: true, force: true })
} finally {
  await browser.close()
  await server.close()
}
