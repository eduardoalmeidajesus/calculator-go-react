# Coverage report

Coverage was generated from the actual implementation. This file records the commands, tool versions, and measured summaries so the reports can be reproduced.

## Backend

Run from backend/:

```bash
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out
go tool cover -html=coverage.out -o coverage.html
```

Verified locally on 2026-09-16 with Go 1.22.12 (portable toolchain, with GOCACHE redirected to the workspace):

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

Verified locally on 2026-09-16 with Node.js v24.11.0, npm 11.6.1, Vitest 5.0.1, and Vite 7.3.6:

```text
All files       | % Stmts 92.39 | % Branch 82.14 | % Funcs 92.85 | % Lines 95.4
```

The final dependency audit reported no known vulnerabilities with `npm audit --omit=optional`.

## Verification policy

Do not replace this note with guessed numbers. Record the command date, tool versions, and actual summary output after Go and npm dependencies have been installed. The coverage scope should include application code and exclude tests, setup files, and generated artifacts only.
