import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('Calculator app', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders an accessible form with an empty initial state', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Calculator' })).toBeInTheDocument()
    expect(screen.getByLabelText('First number')).toHaveValue('')
    expect(screen.getByLabelText('Second number')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Calculate' })).toBeEnabled()
    expect(screen.getByText('Your result will appear here.')).toBeInTheDocument()
  })

  it('submits values to the API and displays a zero result', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ result: 0 }), { status: 200 }),
    )
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('First number'), '5')
    await user.type(screen.getByLabelText('Second number'), '-5')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('0'))
    expect(fetchMock).toHaveBeenCalledWith('/api/calculate', expect.objectContaining({
      body: JSON.stringify({ operation: 'add', a: 5, b: -5 }),
    }))
  })

  it('disables the form while a request is pending', async () => {
    let resolveRequest: ((response: Response) => void) | undefined
    const pendingRequest = new Promise<Response>((resolve) => { resolveRequest = resolve })
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockReturnValue(pendingRequest)
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('First number'), '1')
    await user.type(screen.getByLabelText('Second number'), '2')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'Calculating…' })).toBeDisabled())
    expect(screen.getByLabelText('Operation')).toBeDisabled()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    resolveRequest?.(new Response(JSON.stringify({ result: 3 }), { status: 200 }))
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('3'))
  })

  it('prevents invalid input from reaching the API', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('First number'), '12abc')
    await user.type(screen.getByLabelText('Second number'), '2')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))

    expect(screen.getByRole('alert')).toHaveTextContent('First number must be a valid number')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('shows a friendly division by zero validation error', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('First number'), '10')
    await user.type(screen.getByLabelText('Second number'), '0')
    await user.selectOptions(screen.getByLabelText('Operation'), 'divide')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))

    expect(screen.getByRole('alert')).toHaveTextContent('divisor must not be zero')
  })

  it('supports square root as a unary operation', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ result: 4 }), { status: 200 }),
    )
    const user = userEvent.setup()
    render(<App />)

    await user.selectOptions(screen.getByLabelText('Operation'), 'sqrt')
    expect(screen.queryByLabelText('Second number')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('First number'), '16')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('4'))
    expect(fetchMock).toHaveBeenCalledWith('/api/calculate', expect.objectContaining({
      body: JSON.stringify({ operation: 'sqrt', a: 16 }),
    }))
  })

  it('shows API errors and can clear the form', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'DIVISION_BY_ZERO', message: 'Division by zero is not allowed.' } }), { status: 400 }),
    )
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('First number'), '10')
    await user.type(screen.getByLabelText('Second number'), '2')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Division by zero'))

    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(screen.getByLabelText('First number')).toHaveValue('')
    expect(screen.getByLabelText('Second number')).toHaveValue('')
    expect(screen.getByText('Your result will appear here.')).toBeInTheDocument()
  })

  it('shows a network error when the service cannot be reached', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'))
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('First number'), '1')
    await user.type(screen.getByLabelText('Second number'), '2')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Unable to reach'))
  })

  it('clears feedback when an input changes', async () => {
    const user = userEvent.setup()
    render(<App />)
    fireEvent.change(screen.getByLabelText('First number'), { target: { value: 'bad' } })
    fireEvent.change(screen.getByLabelText('Second number'), { target: { value: '2' } })
    await user.click(screen.getByRole('button', { name: 'Calculate' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await user.clear(screen.getByLabelText('First number'))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
