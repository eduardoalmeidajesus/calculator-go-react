# Project specification — Sezzle Calculator

## 1. Objective

Build a full-stack calculator with a React frontend and a Go backend microservice. The frontend must consume the REST API to perform calculations and display results.

Prioritize correctness, clarity, maintainability, and testable architecture. The assignment suggests **2–4 hours of work**, with submission within **5 business days of receiving the invitation**.

The API contract, folder structure, and tools below are project decisions derived from the assignment, not additional Sezzle requirements.

## Execution instructions for Codex

**Target repository:** https://github.com/eduardoalmeidajesus/calculator-sezzle

**Scope:** deliver a small, polished application with the four required operations, tests for both layers, measured coverage, and documentation. Plan **3 hours for essential work and up to 1 hour of contingency**. Advanced operations and Docker remain optional even though the objective mentions basic and advanced arithmetic.

This specification is not evidence that implementation is complete. When asked to implement:

1. Read this entire document and inspect files and Git state. Preserve existing work and verify the remote before publishing.
2. Follow section 11, completing and verifying each stage before advancing. Routine decisions covered here do not require additional approval.
3. Use React with TypeScript and Go. React is required; TypeScript and Go are assignment preferences adopted for this project.
4. Write code, UI text, API messages, README, specifications, and technical documentation in English.
5. Prefer small functions, local React state, fetch, and the Go standard library. Avoid Redux, ORMs, databases, backend frameworks, monorepo tooling, and UI libraries without concrete need.
6. Record actual prompts in PROMPTS.md, identifying translations, summaries, and privacy omissions. Do not invent missing conversations.
7. Execute verification commands and fix failures before declaring completion. Clearly record blockers and checks not performed.
8. Use contingency time for fixes first. Do not trade tests, coverage, or documentation for optional features.
9. Report implemented features, executed commands, measured coverage, limitations, and publication status. Never claim tests, pushes, or recruiter delivery without evidence.

### Assignment traceability

| Requirement | Expected evidence |
| --- | --- |
| Full-stack calculation through backend | React form integrated with POST /api/calculate and verification with both services running |
| Four basic operations | Implementation and tests for add, subtract, multiply, divide |
| Validation and edge cases | Tests for invalid input, zero, decimals, negatives, division by zero |
| Intuitive, responsive UI | Accessible form, clear feedback, desktop and mobile checks |
| Clean, testable code | Arithmetic independent of HTTP; HTTP client separate from UI |
| Tests and coverage report | Both test suites and actual results in docs/coverage.md |
| Setup, execution, API, rationale | English README with reproducible commands |
| Share AI prompts | PROMPTS.md linked from README |
| Publish repository and share link | Published code and link prepared for candidate submission |
| Advanced operations and Docker | Only when implemented and verified within contingency; optional for delivery |

## 2. Scope and priorities

### Required

- Addition, subtraction, multiplication, and division.
- React input and result interface consuming the real backend API.
- Independent input validation and error handling in both layers.
- Responsive layout with basic mobile support.
- REST API returning JSON.
- Organized, readable, idiomatic code.
- Unit tests for key frontend and backend functionality.
- Coverage reports for both layers.
- README with installation, execution, API examples, and design decisions.
- Published GitHub, GitLab, or equivalent repository.
- Record of prompts used with AI tools.

### Optional, after completing required work

- Exponentiation, square root, and percentage.
- Dockerfile to run frontend and backend together.

### Out of scope

Authentication, users, databases, persistent or synchronized history, expression parsing, operator precedence, parentheses, a complete scientific calculator, service orchestration, and production infrastructure.

## 3. Proposed technologies

| Layer | Technology | Rationale |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite | Type safety and minimal setup |
| Styling | Plain CSS | Sufficient for a small responsive interface |
| Frontend tests | Vitest + React Testing Library | Component behavior checks |
| Backend | Go with net/http and encoding/json | Standard library sufficient for API |
| Backend tests | testing + net/http/httptest | Arithmetic and handlers tested without an external server |
| Persistence | None | Independent, stateless operations |

Record versions and prerequisites in README. Commit the frontend lockfile and applicable Go module files.

## 4. Functional requirements

### RF01 — Perform calculations

The user enters two operands, selects an operation, and submits. The frontend sends the values to the backend and displays the returned result.

| Operation | Identifier | Rule | Example |
| --- | --- | --- | --- |
| Addition | add | a + b | 2 + 3 = 5 |
| Subtraction | subtract | a - b | 2 - 3 = -1 |
| Multiplication | multiply | a * b | -2 * 3 = -6 |
| Division | divide | a / b, with b != 0 | 7 / 2 = 3.5 |

Accept integers, decimals, negatives, and zero. Zero is valid and must not be mistaken for an empty field.

### RF02 — Validate input

Require operands appropriate to the operation; reject empty fields, non-finite numbers, unsupported operations, division by positive or negative zero, and non-finite results such as overflow. The backend repeats validation independently of the UI.

### RF03 — Display states and errors

Show loading while requests are pending and prevent duplicate submissions. Display understandable validation, network, and server errors. Clear old results when starting a new attempt. Allow users to correct inputs and retry after errors.

### RF04 — Clear the form

Provide an action to clear inputs, results, and messages. Disable it during requests or cancel/ignore pending responses.

### Explicit behavior decisions

- Initially, both inputs are empty and add is selected. Do not request calculations on page load.
- Store input strings in React state. Apply trim and reject empty input before converting with Number. Do not use parseFloat, which can accept partially invalid strings.
- Use text inputs with inputMode="decimal". Accept signs, decimal points, and scientific notation; reject commas, hexadecimal, and mixed text. Display “Use a dot for decimals, e.g. 1.5”.
- Validate the following decimal grammar before checking Number.isFinite:

~~~text
^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$
~~~

Valid examples: 0, -2, 1.5, .5, 1e-3. Invalid examples: 1,5, 0x10, 12abc, Infinity.

- Disable fields, selector, and buttons during requests. Clear previous results and errors when inputs or the operation change.
- Validate division by zero on both frontend and backend.
- Use a 10-second timeout with AbortController, clear its timer on completion, and display a recoverable error. Do not retry automatically.
- Validate responses: success requires a finite numeric result. Unexpected JSON or invalid bodies must produce friendly errors without crashing.
- Display results with String(result), allowing scientific notation. Document floating-point behavior. Do not use fixed rounding or toFixed(2).
- Clear restores empty inputs, add, and the initial state.

## 5. Interface and accessibility

Use a simple form with two numeric inputs, an operation selector, Calculate and Clear buttons, and a result area. A calculator keypad is not required.

- Associate labels with inputs and use semantic HTML.
- Support keyboard navigation and submission with Enter.
- Provide visible focus and readable contrast.
- Do not communicate errors through color alone.
- Announce results and messages through an accessible region such as aria-live.
- Avoid horizontal scrolling at 320 px viewport width.
- Explain decimal formatting and avoid silently incorrect conversions.

The frontend may validate input and format results but must not calculate an API fallback.

## 6. REST API contract

### Endpoint and request

POST /api/calculate with Content-Type: application/json. A single endpoint reduces duplication across operations.

~~~json
{
  "operation": "add",
  "a": 10,
  "b": 5
}
~~~

- operation is a required string containing a supported identifier.
- a and b are required JSON numbers for basic operations.
- Numeric strings, booleans, arrays, objects, and null are invalid operands.
- Distinguish missing fields from zero.
- Reject unknown fields. Accept exactly one JSON object, optionally followed by whitespace; reject additional JSON values.
- Parse media types and accept application/json parameters such as charset=utf-8.
- Validate method and media type first, then JSON/required fields, then the operation and mathematical rules. Test errors individually without relying on precedence among multiple errors.
- Numeric DTO fields may use *float64 to preserve zero while rejecting absence and null. Use DisallowUnknownFields and check EOF after the first decode.

### Success — HTTP 200

~~~json
{
  "result": 15
}
~~~

### Error response

~~~json
{
  "error": {
    "code": "DIVISION_BY_ZERO",
    "message": "Division by zero is not allowed."
  }
}
~~~

| HTTP status | Error code | Condition |
| --- | --- | --- |
| 400 | INVALID_REQUEST | Malformed JSON, missing fields, invalid types, or trailing content |
| 400 | INVALID_OPERATION | Unsupported operation |
| 400 | DIVISION_BY_ZERO | Zero divisor |
| 400 | NON_FINITE_RESULT | Result outside supported numeric range |
| 405 | METHOD_NOT_ALLOWED | Unsupported method |
| 404 | NOT_FOUND | Unknown API route |
| 415 | UNSUPPORTED_MEDIA_TYPE | Body not sent as JSON |
| 500 | INTERNAL_ERROR | Unexpected server failure |

Return Content-Type: application/json and do not expose internal details. Include Allow: POST on HTTP 405 responses.

### Example calls

Bash examples; adapt or provide PowerShell alternatives in README when necessary.

~~~bash
# Addition: expected result 15
curl -X POST http://localhost:8080/api/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"add","a":10,"b":5}'

# Division: expected result 3.5
curl -X POST http://localhost:8080/api/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"divide","a":7,"b":2}'

# Expected error: HTTP 400 / DIVISION_BY_ZERO
curl -X POST http://localhost:8080/api/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"divide","a":7,"b":0}'
~~~

## 7. Numeric precision and optional operations

Use float64 on the backend and number on the frontend. Document floating-point limitations, including 0.1 + 0.2; do not promise financial or arbitrary precision.

Return the calculated value without business rounding. Document display formatting and avoid converting small valid values to zero.

| Optional operation | Identifier | Operands | Rule |
| --- | --- | --- | --- |
| Exponentiation | power | a, b | a raised to b; reject non-finite results |
| Square root | sqrt | a only | Require a >= 0; reject b if supplied |
| Percentage | percentage | a, b | a percent of b: (a / 100) * b |

A negative square-root input returns HTTP 400 with INVALID_DOMAIN. Update form, documentation, and tests for optional operations. Explain percentage semantics explicitly in the UI.

For power, use math.Pow and document 0^0 = 1. NaN returns INVALID_DOMAIN; infinite results return NON_FINITE_RESULT. For sqrt, the frontend omits b and the backend rejects its presence, including null, requiring presence detection in the optional DTO. Complete basic requirements before adding optional rules.

## 8. Architecture and organization

Separate responsibilities without unnecessary layers:

- React components: form, UI state, presentation.
- HTTP client: request serialization, response interpretation.
- Go handler: HTTP validation, response construction.
- Go calculation logic: mathematical rules independent of HTTP.

Suggested structure:

~~~text
/
├── README.md
├── SPECS.md
├── PROMPTS.md
├── .gitignore
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── App.test.tsx
│       ├── api/calculator.ts
│       └── styles.css
├── backend/
│   ├── go.mod
│   ├── cmd/server/main.go
│   └── internal/
│       ├── calculator/
│       │   ├── calculator.go
│       │   └── calculator_test.go
│       └── httpapi/
│           ├── handler.go
│           └── handler_test.go
└── docs/
    └── coverage.md
~~~

Use frontend port 5173 and backend port 8080 in development. Proxy /api through Vite and use relative client URLs; local CORS middleware is unnecessary.

If Docker is implemented, Go can serve the static frontend build while reserving /api for calculations.

### Minimum runtime configuration

- Go module: github.com/eduardoalmeidajesus/calculator-sezzle/backend. Run go run ./cmd/server from backend/. Support PORT with default 8080 and reasonable HTTP timeouts.
- Use npm scripts dev, build, test, and test:coverage. Build must check TypeScript before bundling; coverage must run once and output text and HTML.
- Enable TypeScript strict mode and jsdom for UI tests. Install a coverage provider compatible with Vitest.
- Run npm ci from frontend/, backend in one terminal, npm run dev in another. Document http://localhost:5173.
- Ignore node_modules, dist, generated coverage HTML, and binaries. Commit the Markdown coverage summary. Do not require Docker to run or evaluate the project.
- CI and public application hosting are not prerequisites. The assignment requires a published repository, not a hosted application.

## 9. Testing strategy

### Backend

Use table-driven arithmetic tests and httptest for the HTTP contract. Cover:

- Four operations with known results.
- Negatives, decimals, and zero.
- Division by positive and negative zero.
- Unsupported operations.
- Missing fields, null, and incorrect types.
- Malformed JSON and multiple JSON values.
- Wrong methods and content types.
- Overflow and non-finite results.
- Status, headers, and success/error JSON structure.

Use floating-point tolerances where appropriate.

### Frontend

Mock the HTTP boundary to test behavior without a running server. Cover accessible controls, correct requests, displayed results including zero, invalid-input rejection, loading, duplicate-submission prevention, API/network errors, recovery, and form clearing.

### Coverage and manual verification

The assignment specifies no minimum percentage. Prioritize critical paths and errors; measure actual coverage without inventing results.

~~~bash
# In backend/
go test ./...
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out
go tool cover -html=coverage.out -o coverage.html

# In frontend/
npm run test -- --run
npm run test:coverage
npm run build
~~~

Record commands, execution date, and percentages in docs/coverage.md. Explain how to generate detailed reports and make them available as deliverable files or accessible repository artifacts.

The versioned Markdown report satisfies the coverage deliverable. Include actual Go statements and Vitest statements, branches, functions, and lines, declaring scope/exclusions. Measure application code without excluding difficult logic to inflate results. Exclude only tests, configuration, and generated artifacts. Committing HTML, enabling CI, or meeting arbitrary thresholds is unnecessary.

Also run gofmt, go vet ./..., and go build ./.... Test response-body validation and request timeout. Prefer behavior assertions over large snapshots or tests that mirror implementation.

Manually verify the four operations with both services running, division by zero, connection failure, and small-screen layout.

## 10. Documentation and delivery

README must include:

1. Purpose and implemented features.
2. Prerequisites and versions.
3. Installation from a clean clone.
4. Frontend/backend startup, ports, and configuration.
5. API contract and success/error examples.
6. Tests, build, and coverage commands.
7. Architecture, decisions, assumptions, and numeric limitations.
8. Optional features implemented and known limitations.
9. Link to PROMPTS.md.
10. Docker instructions if implemented.

PROMPTS.md records actual prompts, including the specification request, tool used, and purpose of relevant interactions. Exclude secrets and unnecessary personal data. Label translations and summaries.

Publish to a repository accessible to evaluators and share the link through the recruitment channel. Verify access before submission. Check actual authentication, branch, and remote before pushing. Preserve history; do not force-push. If credentials or permissions block publication, complete local work and report the exact pending step.

Prepare a short English submission message, but leave sending to the candidate unless explicitly authorized. Distinguish implemented from optional/unimplemented features. Report actual approximate time only if recorded; do not claim four-hour completion without evidence. The five-business-day deadline depends on the invitation date, which has not been supplied.

## 11. Implementation stages and timebox

| Stage | Budget | Completion condition |
| --- | --- | --- |
| 1. Inspection and setup | 15 min | Structure, versions, and basic commands ready |
| 2. Backend and tests | 45 min | Four operations, JSON contract, passing success/error tests |
| 3. Frontend and integration | 45 min | Responsive form consuming real API with all states |
| 4. Tests and review | 35 min | UI/client tests and build pass; real integration checked |
| 5. Documentation and essentials | 40 min | README, prompts, measured coverage, publication file review |
| 6. Final contingency | Up to 60 min | Fixes, possibly one complete optional feature, verified publication |

Plan **3 hours for essentials and a 4-hour planning limit**. Estimates do not guarantee duration; report deviations. Use contingency for remaining requirements at the three-hour mark.

Only start optional work once essentials are verified and at least 30 minutes remain. Prioritize one complete additional operation—API, UI, tests, documentation—before Docker. Only include Docker when its image can be built and run; an untested Dockerfile is incomplete. A polished required-only implementation is acceptable.

After each stage, update docs/implementation-status.md with pending, in progress, done, or blocked; changes; actual checks; and remaining work. Keep the record short so another Codex session can resume without repeating work. Do not build a task-management system.

## 12. Acceptance criteria

- [ ] A reviewer can run the project using README alone.
- [ ] Frontend uses React with TypeScript; backend uses Go.
- [ ] The four required operations work through the API.
- [ ] Integers, decimals, negatives, and zero behave correctly.
- [ ] Invalid input and division by zero produce clear errors.
- [ ] API validates independently of the frontend.
- [ ] UI displays loading, success, and failure.
- [ ] UI supports keyboard navigation and mobile screens.
- [ ] Both test suites and the frontend build pass.
- [ ] Measured coverage and reproduction instructions are available.
- [ ] README and prompt record are complete.
- [ ] Repository contains no credentials, installed dependencies, or unnecessary temporary files.
- [ ] Repository is published and accessible to evaluators.
- [ ] Link was shared within the assignment deadline.
