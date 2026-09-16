# Coverage report

Coverage was generated from the actual implementation. This file records the commands, tool versions, and measured summaries so the reports can be reproduced.

## Backend

Run from backend/:

```bash
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out
go tool cover -html=coverage.out -o coverage.html
```

Verified locally on 2026-09-15 with Go 1.22.12 (portable toolchain, with GOCACHE redirected to the workspace):

```text
total: (statements) 83.3%
```

## Frontend

Run from frontend/:

```bash
npm ci
npm run test:coverage
```

Vitest prints statements, branches, functions, and lines and writes the detailed HTML report to frontend/coverage/. The generated directory is ignored by Git.

Verified locally on 2026-09-15 with Node.js v24.11.0 and npm 11.6.1:

```text
All files       | % Stmts 96.81 | % Branch 83.33 | % Funcs 100 | % Lines 96.81
```

## Verification policy

Do not replace this note with guessed numbers. Record the command date, tool versions, and actual summary output after Go and npm dependencies have been installed. The coverage scope should include application code and exclude tests, setup files, and generated artifacts only.
