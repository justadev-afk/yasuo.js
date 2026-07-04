import type { HttpClient, HttpRequest, HttpResponse } from '../../src/core/http/http-client'

/** A canned response for {@link MockHttpClient}. */
export interface MockResponse {
  status?: number
  ok?: boolean
  headers?: Record<string, string>
  body?: unknown
}

/**
 * A deterministic {@link HttpClient} for tests. Records every request and
 * replays a queue of canned responses; once the queue is down to its last
 * entry, that entry is returned for all subsequent calls.
 */
export class MockHttpClient implements HttpClient {
  /** Every request the client has been asked to send, in order. */
  readonly requests: HttpRequest[] = []
  private readonly queue: MockResponse[]

  constructor(responses: MockResponse[] = [{}]) {
    this.queue = responses.length > 0 ? [...responses] : [{}]
  }

  /** How many requests have been sent so far. */
  get callCount(): number {
    return this.requests.length
  }

  /** The URL of the most recently sent request, or `undefined`. */
  get lastUrl(): string | undefined {
    return this.requests.at(-1)?.url
  }

  send(request: HttpRequest): Promise<HttpResponse> {
    this.requests.push(request)
    const next = this.queue.length > 1 ? this.queue.shift() : this.queue[0]
    const status = next?.status ?? 200
    return Promise.resolve({
      status,
      ok: next?.ok ?? (status >= 200 && status < 300),
      headers: next?.headers ?? {},
      body: next?.body,
    })
  }
}
