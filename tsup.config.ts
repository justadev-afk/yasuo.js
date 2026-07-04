import { defineConfig } from 'tsup'

/**
 * Bundles the library into `dist/` as both ESM (`index.js`) and CommonJS
 * (`index.cjs`) plus a rolled-up `index.d.ts`.
 *
 * Yasuo ships with **zero runtime dependencies** (it only uses the platform's
 * native `fetch`), so there is nothing to mark external. Tree-shaking and
 * minification keep the published bundle as small as possible.
 */
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  target: 'node18',
  dts: true,
  clean: true,
  minify: true,
  treeshake: true,
  sourcemap: false,
  splitting: false,
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' }
  },
})
