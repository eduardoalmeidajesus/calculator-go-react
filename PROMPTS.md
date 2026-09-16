# AI collaboration and prompt record

Tool: OpenAI Codex.

This document explains the context supplied to the agent and the requests that guided development. The original messages were in Portuguese. The English translations and summaries below preserve their intent; they are not verbatim English messages.

## 1. Requirements planning

**Context:** The Sezzle assignment email, including required operations, technology preferences, deliverables, and time limit.

**User request — English translation:**

> Please generate a Markdown file with the specifications for implementing this project.

**Agent contribution:** Proposed the scope, architecture, API contract, validation rules, testing strategy, and checklist in [SPECS.md](SPECS.md).

## 2. Refine scope and repository instructions

**User request — translated summary:**

> Make the specification clear and detailed enough for Codex to follow during implementation, according to the assignment email. Choose a scope suitable for 3–4 hours. I created the repository at https://github.com/eduardoalmeidajesus/calculator-sezzle. Organize the work into stages if appropriate and adjust the plan for this hiring exercise.

**Agent contribution:** Expanded SPECS.md and created [AGENTS.md](AGENTS.md) with implementation priorities, repository conventions, verification requirements, and progress tracking.

**Context management:** The documents became inputs to the implementation request. Detailed technical choices were proposed by the agent, rather than individually specified in the user's messages.

## 3. Implement from repository context

**User request — English translation:**

> Please read AGENTS.md and SPECS.md and implement the application.

**Agent contribution:** Implemented the React + TypeScript frontend, Go API, automated tests, and documentation. The agent executed checks and revised code in response to failures.

The delivered scope includes the four required operations plus power, square root, and percentage. Docker was not included. This scope description is not evidence that every planned stage was followed in order.

## 4. Run and test the application

**User request — English translation:**

> How do I test the application?

**Agent contribution:** Provided startup instructions, manual calculation scenarios, a PowerShell API example, and automated test commands. This request does not establish that the candidate subsequently performed those checks.

## Verification and iteration

During implementation, the agent addressed a Go compilation error, missing cleanup between UI tests, coverage configuration that included generated files, and malformed/null API response handling.

Most recent local results:

| Check | Recorded result |
| --- | --- |
| Frontend tests | 15 passed |
| Frontend production build | Passed |
| Frontend coverage | 92.39% statements, 82.14% branches, 92.85% functions, 95.4% lines |
| Backend tests, vet, and build | Passed (the local build used `-buildvcs=false` because the checkout ownership prevented VCS stamping) |
| Backend formatting | gofmt executed |
| Backend statement coverage | 83.3% |

See [docs/coverage.md](docs/coverage.md) for commands and measurement details. Interactive browser verification with both services running was not completed in this environment.

## Documentation revision

This record was subsequently translated and reorganized for readability. It distinguishes user instructions from agent-generated decisions and verification work.

## Reusable prompt examples — drafted after implementation

These examples illustrate a more explicit workflow for a future iteration. They were not used in the recorded implementation.

### Planning example

> Read the assignment and inspect the repository. Propose a three-hour implementation plan with one hour of contingency. Prioritize the four required operations, independent backend validation, tests for both layers, measured coverage, and a reproducible README. Identify assumptions and optional features before implementation.

### Implementation example

> Implement the agreed API contract using React with TypeScript and the Go standard library. Keep arithmetic independent of HTTP and the frontend client separate from presentation. Verify each stage before moving on and report deviations from the specification.

### Review example

> Review the implementation against SPECS.md. Check empty inputs versus zero, negative and decimal values, division by zero, non-finite results, malformed responses, loading behavior, and recovery after failures. Run relevant tests and build commands. Report evidence and unverified requirements without assuming that passing tests prove complete coverage.
