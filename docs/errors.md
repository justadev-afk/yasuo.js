# Error handling

Every failure yasuo raises is a typed class, so you can `catch` exactly as
narrowly — or as broadly — as you like. There are no thrown strings, no bare
`Error`s, and no `{ error }` result envelopes to unpack: a request either
resolves to an entity or throws one of the classes below.

```ts
import { NotFoundError, RateLimitError } from 'yasuo'

try {
  const summoner = await yasuo.lol.summoner.byPuuid(puuid, Region.KR)
} catch (err) {
  if (err instanceof NotFoundError)  { /* the PUUID does not exist */ }
  if (err instanceof RateLimitError) { /* err.rateLimits.retryAfterSeconds */ }
}
```

## The hierarchy

Everything yasuo throws descends from **`YasuoError`**. Every *HTTP* failure
descends from **`ApiError`**, which is itself a `YasuoError`. The specific
status codes get their own subclasses:

```
YasuoError                     // base for everything yasuo throws
├── ApiKeyMissingError         // no key configured — thrown before any request
└── ApiError                   // base for every non-2xx Riot response
    ├── UnauthorizedError      // 401
    ├── ForbiddenError         // 403
    ├── NotFoundError          // 404
    ├── RateLimitError         // 429
    └── ServiceUnavailableError// 502 / 503 / 504
```

`instanceof` is reliable in every build target. `YasuoError` restores its
prototype chain in the constructor, so the checks work after transpilation to
ES5, in CommonJS, and across bundle boundaries — not just in native ESM.

## `ApiKeyMissingError`

Thrown at request time when **no API key is configured** — neither passed to the
constructor nor present as `RIOT_API_KEY` in the environment. Because no HTTP
call is ever made, it extends `YasuoError` directly, **not** `ApiError`: there
is no status, url, or rate-limit data to attach.

```ts
import { ApiKeyMissingError } from 'yasuo'

const yasuo = new Yasuo({})              // no key, and RIOT_API_KEY unset

try {
  await yasuo.lol.summoner.byPuuid(puuid, Region.KR)
} catch (err) {
  if (err instanceof ApiKeyMissingError) {
    // Fix your configuration: `new Yasuo({ key })` or set RIOT_API_KEY.
  }
}
```

## HTTP errors

For a non-2xx response, yasuo builds the most specific subclass for the status
code and throws it once retries are exhausted:

| Status        | Class                     | Meaning                                                             |
| ------------- | ------------------------- | ------------------------------------------------------------------- |
| `401`         | `UnauthorizedError`       | The API key is missing, invalid, or expired.                        |
| `403`         | `ForbiddenError`          | The key lacks access to this endpoint (or is blacklisted/expired).  |
| `404`         | `NotFoundError`           | The requested resource does not exist.                              |
| `429`         | `RateLimitError`          | Rate limited — inspect `rateLimits.retryAfterSeconds`.              |
| `502`·`503`·`504` | `ServiceUnavailableError` | Riot-side outage — check the API status page.                   |
| anything else | `ApiError`                | Any other non-2xx status, thrown as the base class.                 |

## What every `ApiError` carries

The context of the failed request travels *with* the error — the same idea as an
entity's `.meta`, but for the path that threw:

```ts
import { ApiError } from 'yasuo'

try {
  await yasuo.lol.match.get('KR_404', RegionGroup.ASIA)
} catch (err) {
  if (err instanceof ApiError) {
    err.status                       // 404 — the HTTP status code
    err.url                          // final request URL, query string included
    err.method                       // rate-limit method id of the endpoint that failed
    err.rateLimits.app               // [{ limit, intervalSeconds, count }]
    err.rateLimits.retryAfterSeconds // number | null — set on 429s
    err.body                         // parsed Riot error body, e.g. { status: { message, status_code } }
    err.headers                      // raw, lower-cased response headers
  }
}
```

| Property      | Type                              | Notes                                                       |
| ------------- | --------------------------------- | ----------------------------------------------------------- |
| `.status`     | `number`                          | HTTP status code returned by Riot.                          |
| `.url`        | `string`                          | Final request URL, query string included.                   |
| `.method`     | `string`                          | Rate-limit method key of the endpoint (for diagnostics).    |
| `.rateLimits` | `RateLimits`                      | Parsed rate-limit headers; `retryAfterSeconds` on a `429`.  |
| `.body`       | `unknown`                         | Parsed response body, when Riot returned one.               |
| `.headers`    | `Record<string, string>`          | Raw, lower-cased response headers.                          |

## Catching patterns

Pick the altitude that matches how much you care:

```ts
import { ApiError, YasuoError, NotFoundError, RateLimitError, ForbiddenError } from 'yasuo'

try {
  const ids = await yasuo.lol.summoner.byPuuid(puuid, Region.KR).matchIds({ count: 20 })
  return ids
} catch (err) {
  if (err instanceof NotFoundError) {
    return []                                    // no such summoner — treat as empty
  }
  if (err instanceof RateLimitError) {
    const wait = err.rateLimits.retryAfterSeconds ?? 1
    await sleep(wait * 1000)                      // back off, then let the caller retry
    throw err
  }
  if (err instanceof ForbiddenError) {
    throw new Error('Your key cannot access this endpoint — check its scopes.')
  }
  if (err instanceof ApiError) {
    // Any other HTTP failure: log status + url and move on.
    console.error(`Riot ${err.status} on ${err.url}`)
  }
  throw err
}
```

- **Catch `ApiError`** to handle *any* HTTP failure uniformly (status, url, body
  are all available).
- **Catch a specific subclass** (`NotFoundError`, `RateLimitError`, …) when a
  status deserves distinct handling.
- **Catch `YasuoError`** to trap *anything* originating from yasuo — including
  `ApiKeyMissingError`, which is not an `ApiError` — and let unrelated errors
  propagate:

```ts
try {
  await yasuo.lol.summoner.byPuuid(puuid, Region.KR)
} catch (err) {
  if (err instanceof YasuoError) { /* it came from yasuo */ }
  else throw err                  /* something else — don't swallow it */
}
```

## Retries happen before the throw

`429` and `503`/`502`/`504` are **retried automatically** according to the retry
policy (with `retry-after` honoured, then bounded exponential backoff). The
`RateLimitError` or `ServiceUnavailableError` you catch is thrown **only once
retries are exhausted** (or disabled) — so by the time you see it, yasuo has
already waited and tried again on your behalf. Tune this with the `retry` option;
see [rate-limiting.md](./rate-limiting.md).

## Some endpoints return `null` instead of throwing

Where a `404` is an expected, non-exceptional outcome, the namespace converts it
to `null` rather than throwing. The clearest case is a player's live game — not
being in a match is normal, not an error:

```ts
const live = await yasuo.lol.spectator.active(puuid, Region.KR) // CurrentGameEntity | null

if (live === null) {
  // The player is not currently in a game.
} else {
  console.log(live.gameId)
}
```

Only `404` is absorbed this way — every other status (`403`, `429`, `503`, …)
still throws its usual `ApiError` subclass.
