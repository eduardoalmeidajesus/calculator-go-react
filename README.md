# Sezzle Calculator

A small full-stack calculator built for the Sezzle engineering exercise. The React + TypeScript frontend validates user input and calls a stateless Go REST API. The backend owns all arithmetic so the browser and API remain independently testable.

The required operations are implemented: addition, subtraction, multiplication and division. The optional operations from the exercise are also included: power, square root and percentage.

## Prerequisites

- Node.js 20 or newer and npm
- Go 1.22 or newer
- A terminal (the commands below use Bash syntax)

## Run locally

Clone the repository and open two terminals.

```bash
git clone https://github.com/eduardoalmeidajesus/calculator-sezzle.git
cd calculator-sezzle
```

In terminal 1, start the API:

```bash
cd backend
go run ./cmd/server
```

The API listens on `http://localhost:8080` by default. Set `PORT` to use another port.

In terminal 2, install and start the frontend:

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the Go service, so no local CORS configuration is required. The frontend client uses a relative API URL and does not calculate a fallback result in the browser.

## API

### `POST /api/calculate`

Send JSON with `operation`, `a`, and (for binary operations) `b`:

```json
{
  "operation": "add",
  "a": 10,
  "b": 5
}
```

Successful response (`200`):

```json
{
  "result": 15
}
```

Supported operation identifiers are `add`, `subtract`, `multiply`, `divide`, `power`, `sqrt`, and `percentage`. `sqrt` is unary and accepts only `a`. Percentage means “a percent of b”, calculated as `(a / 100) * b`.

Examples:

```bash
# Addition
curl -X POST http://localhost:8080/api/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"add","a":10,"b":5}'

# Division
curl -X POST http://localhost:8080/api/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"divide","a":7,"b":2}'

# Square root (unary)
curl -X POST http://localhost:8080/api/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"sqrt","a":9}'

# Division by zero: HTTP 400
curl -X POST http://localhost:8080/api/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"divide","a":7,"b":0}'
```

Errors use a stable JSON shape:

```json
{
  "error": {
    "code": "DIVISION_BY_ZERO",
    "message": "Division by zero is not allowed."
  }
}
```

The API returns `400` for invalid JSON, missing or invalid fields, unsupported operations, division by zero, invalid square-root domains, and non-finite results. It returns `405` for unsupported methods, `415` for non-JSON requests, and `404` for unknown routes. Unknown fields and multiple JSON values in one request body are rejected.

## Test, build, and coverage

Backend commands:

```bash
cd backend
gofmt -w cmd internal
go test ./...
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out
go vet ./...
go build ./...
```

Frontend commands:

```bash
cd frontend
npm ci
npm run test -- --run
npm run test:coverage
npm run build
```

`npm run test:coverage` writes the detailed HTML report to `frontend/coverage/`. The versioned summary and reproduction notes are in [`docs/coverage.md`](docs/coverage.md). Coverage output is generated locally and ignored by Git.

## Design decisions

- The API has one calculation endpoint with an explicit operation identifier. This keeps the contract small while allowing optional operations without repetitive handlers.
- Go’s standard `net/http` and `encoding/json` packages are sufficient for this stateless service. Mathematical functions have no HTTP dependency, which makes them easy to test.
- The handler rejects unknown fields, missing values, `null`, non-numeric values, malformed JSON, trailing JSON, and non-finite results. Raw JSON inspection preserves the distinction between an absent operand and a valid zero.
- The UI stores raw input as strings, validates a complete numeric grammar before calling `Number`, and sends every calculation to the API. A ten-second abort timeout turns a stalled request into a recoverable message.
- Results use their JavaScript string representation; the application does not claim decimal or financial precision. IEEE-754 behavior such as `0.1 + 0.2` is expected.
- Local development uses the Vite proxy. The form is semantic, keyboard-operable, announces feedback, and adapts to narrow screens.

## Project layout

```text
backend/
  cmd/server/                 HTTP server entrypoint
  internal/calculator/        Pure arithmetic and unit tests
  internal/httpapi/           REST handler and contract tests
frontend/
  src/App.tsx                 Accessible calculator form
  src/api/calculator.ts       Typed API client
  src/*.test.*                UI and API-client tests
docs/coverage.md              Versioned coverage report
PROMPTS.md                   Prompts used during the work
SPECS.md                     Implementation specification
```

## AI prompt record

The prompts used for this assignment are recorded in [`PROMPTS.md`](PROMPTS.md). No credentials, tokens, or private data are included.

## Scope and limitations

There is no persistence, authentication, history, database, expression parser, or Docker image. The optional operations are implemented and tested, while the application remains focused on independent two-operand calculations.

