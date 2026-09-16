import { afterEach, describe, expect, it, vi } from 'vitest'
import { calculate } from './calculator'

describe('calculate API client', () => {
  afterEach(() => vi.restoreAllMocks())

  it('sends a calculation request and returns its result', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ result: 15 }), { status: 200 }),
    )

    await expect(calculate({ operation: 'add', a: 10, b: 5 })).resolves.toEqual({ result: 15 })
    expect(fetchMock).toHaveBeenCalledWith('/api/calculate', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'add', a: 10, b: 5 }),
    }))
  })

  it('omits b for unary operations', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ result: 3 }), { status: 200 }),
    )

    await calculate({ operation: 'sqrt', a: 9 })
    expect(fetchMock.mock.calls[0]?.[1]).toEqual(expect.objectContaining({
      body: JSON.stringify({ operation: 'sqrt', a: 9 }),
    }))
  })

  it('translates API errors into a typed error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'DIVISION_BY_ZERO', message: 'Division by zero is not allowed.' } }), { status: 400 }),
    )

    await expect(calculate({ operation: 'divide', a: 1, b: 0 })).rejects.toMatchObject({
      code: 'DIVISION_BY_ZERO',
      status: 400,
    })
  })

  it('rejects malformed success responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ result: '15' }), { status: 200 }))

    await expect(calculate({ operation: 'add', a: 1, b: 2 })).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })

  it('rejects malformed JSON responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('not json', { status: 502 }))

    await expect(calculate({ operation: 'add', a: 1, b: 2 })).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })

  it('rejects a null response body', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('null', { status: 200 }))

    await expect(calculate({ operation: 'add', a: 1, b: 2 })).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })
})
