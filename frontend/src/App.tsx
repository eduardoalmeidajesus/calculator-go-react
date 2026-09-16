import { FormEvent, useRef, useState } from 'react'
import { calculate, CalculatorApiError, Operation } from './api/calculator'

const NUMBER_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/

const OPERATION_LABELS: Record<Operation, string> = {
  add: 'Addition (+)',
  subtract: 'Subtraction (−)',
  multiply: 'Multiplication (×)',
  divide: 'Division (÷)',
  power: 'Power (xʸ)',
  sqrt: 'Square root (√)',
  percentage: 'Percentage (%)',
}

function parseNumber(value: string, label: string): number {
  const normalized = value.trim()
  if (!normalized) {
    throw new Error(`${label} is required.`)
  }
  if (!NUMBER_PATTERN.test(normalized)) {
    throw new Error(`${label} must be a valid number. Use a dot for decimals, e.g. 1.5.`)
  }

  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a finite number.`)
  }
  return parsed
}

function isUnary(operation: Operation): boolean {
  return operation === 'sqrt'
}

function App() {
  const [operation, setOperation] = useState<Operation>('add')
  const [firstValue, setFirstValue] = useState('')
  const [secondValue, setSecondValue] = useState('')
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const requestController = useRef<AbortController | null>(null)

  const resetFeedback = () => {
    setResult(null)
    setError('')
  }

  const handleOperationChange = (nextOperation: Operation) => {
    setOperation(nextOperation)
    resetFeedback()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isLoading) return

    resetFeedback()
    let a: number
    let b: number | undefined
    try {
      a = parseNumber(firstValue, 'First number')
      if (!isUnary(operation)) {
        b = parseNumber(secondValue, 'Second number')
      }
      if (operation === 'divide' && b === 0) {
        throw new Error('The divisor must not be zero.')
      }
      if (operation === 'sqrt' && a < 0) {
        throw new Error('Square root is only defined for zero and positive numbers.')
      }
    } catch (validationError) {
      setError(validationError instanceof Error ? validationError.message : 'Please check your input.')
      return
    }

    const controller = new AbortController()
    requestController.current = controller
    const timeout = window.setTimeout(() => controller.abort(), 10_000)
    setIsLoading(true)

    try {
      const response = await calculate({ operation, a, b }, controller.signal)
      setResult(response.result)
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') {
        setError('The request timed out. Please try again.')
      } else if (requestError instanceof CalculatorApiError) {
        setError(requestError.message)
      } else {
        setError('Unable to reach the calculator service. Please try again.')
      }
    } finally {
      window.clearTimeout(timeout)
      requestController.current = null
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    if (isLoading) return
    setOperation('add')
    setFirstValue('')
    setSecondValue('')
    resetFeedback()
  }

  return (
    <main className="app-shell">
      <section className="calculator-card" aria-labelledby="page-title">
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true">÷</div>
          <span className="eyebrow">SEZZLE ENGINEERING</span>
        </div>
        <h1 id="page-title">Calculator</h1>
        <p className="intro">A focused arithmetic workspace powered by a Go service.</p>

        <form className="calculator-form" onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="field-group">
              <label htmlFor="first-number">First number</label>
              <input
                id="first-number"
                name="first-number"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="e.g. 12.5"
                value={firstValue}
                onChange={(event) => { setFirstValue(event.target.value); resetFeedback() }}
                disabled={isLoading}
                aria-describedby="number-help"
              />
            </div>

            <div className="field-group operation-field">
              <label htmlFor="operation">Operation</label>
              <select
                id="operation"
                value={operation}
                onChange={(event) => handleOperationChange(event.target.value as Operation)}
                disabled={isLoading}
              >
                {Object.entries(OPERATION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {!isUnary(operation) && (
              <div className="field-group">
                <label htmlFor="second-number">Second number</label>
                <input
                  id="second-number"
                  name="second-number"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="e.g. 4"
                  value={secondValue}
                  onChange={(event) => { setSecondValue(event.target.value); resetFeedback() }}
                  disabled={isLoading}
                  aria-describedby="number-help"
                />
              </div>
            )}
          </div>

          <p id="number-help" className="field-help">
            {isUnary(operation) ? 'Enter a zero or positive number.' : 'Use a dot for decimals, e.g. 1.5.'}
          </p>

          <div className="button-row">
            <button className="primary-button" type="submit" disabled={isLoading}>
              {isLoading ? 'Calculating…' : 'Calculate'}
            </button>
            <button className="secondary-button" type="button" onClick={handleClear} disabled={isLoading}>
              Clear
            </button>
          </div>
        </form>

        <div className={`feedback-panel${error ? ' has-error' : ''}`} aria-live="polite" aria-atomic="true">
          {error ? (
            <p className="error-message" role="alert">{error}</p>
          ) : result !== null ? (
            <div className="result-content">
              <span className="result-label">Result</span>
              <output className="result-value" role="status" htmlFor="first-number second-number">{String(result)}</output>
            </div>
          ) : (
            <p className="empty-message">Your result will appear here.</p>
          )}
        </div>
      </section>
      <p className="footer-note">Calculations are performed by the backend API.</p>
    </main>
  )
}

export { NUMBER_PATTERN, parseNumber }
export default App
