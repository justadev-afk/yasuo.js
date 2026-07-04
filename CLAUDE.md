---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

# yasuo

yasuo is a modern, **zero-runtime-dependency** TypeScript client for the Riot Games API (LoL, TFT, Riot Account). It is the evolution of the `twisted` library. The full, binding conventions live in [`docs/architecture.md`](docs/architecture.md) — read it before making structural changes. The essentials:

- **Zero runtime dependencies.** Never add to `dependencies`. Small helpers go in `src/core/util`.
- **No magic strings/numbers.** Every Riot constant is an `enum` in `src/enums`. Reference the enum.
- **One declaration per file.** At most one class, or a few closely-related functions, or a cohesive group of types, per file.
- **DTOs mirror the wire (`src/dto`, `*DTO`, `readonly`); entities are the ergonomics (`src/entities`, `*.entity.ts`).** Entities use the interface+class **declaration-merging** pattern to expose DTO fields directly — this is why `noUnsafeDeclarationMerging`/`noEmptyInterface` are off in `biome.json`.
- **Lazy `*-ref.ts` references are thenable** (`implements PromiseLike`) so `byPuuid(...).matchIds()` runs only the final request. Their `then()` carries an intentional `biome-ignore`.
- **The live API is the source of truth over Riot's published docs.** When they drift, type the observed shape, keep the legacy shape optional, and add a normalised accessor (see `ChampionRotationEntity`).
- **Every export is JSDoc'd.** Every network call flows through `RequestExecutor.request()`; namespaces never call `fetch` directly (except `DataDragonNamespace`).

**Before "done":** `bun run typecheck`, `bun run lint`, and `bun test test/unit` must all be green; new logic needs a unit test; new public surface is exported from `src/index.ts`.

## Bun

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";
import { createRoot } from "react-dom/client";

// import .css files directly and it works
import './index.css';

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.
