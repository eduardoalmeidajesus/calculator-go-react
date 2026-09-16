export const OPERATIONS = ['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt', 'percentage'] as const

export type Operation = (typeof OPERATIONS)[number]

export interface CalculateInput {
  operation: Operation
  a: number
  b?: number
}

export interface CalculateResponse {
  result: number
}

export interface ApiErrorPayload {
  error?: {
    code?: string
    message?: string
  }
}

export class CalculatorApiError extends Error {
  readonly code: string
  readonly status: number

  constructor(message: string, code: string, status: number) {
    super(message)
    this.name = 'CalculatorApiError'
    this.code = code
    this.status = status
  }
}

export async function calculate(input: CalculateInput, signal?: AbortSignal): Promise<CalculateResponse> {
  const payload: Record<string, number | string> = {
    operation: input.operation,
    a: input.a,
  }
  if (input.b !== undefined) {
    payload.b = input.b
  }

  const response = await fetch('/api/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  let body: CalculateResponse | ApiErrorPayload | null = null
  try {
    body = await response.json() as CalculateResponse | ApiErrorPayload
  } catch {
    throw new CalculatorApiError('The server returned an invalid response.', 'INVALID_RESPONSE', response.status)
  }

  if (!response.ok) {
    const error = (body as ApiErrorPayload).error
    throw new CalculatorApiError(
      error?.message ?? 'The calculation could not be completed.',
      error?.code ?? 'REQUEST_FAILED',
      response.status,
    )
  }

  const result = (body as CalculateResponse).result
  if (typeof result !== 'number' || !Number.isFinite(result)) {
    throw new CalculatorApiError('The server returned an invalid result.', 'INVALID_RESPONSE', response.status)
  }

  return { result }
}
