# Repository instructions for agents

## Source of truth

Before implementing or modifying the application, read [SPECS.md](SPECS.md) in full. It records the Sezzle requirements, adopted decisions, API contract, 3–4 hour plan, and acceptance criteria.

For documentation-only tasks, restrict changes to documentation. When implementation is requested, follow section 11 of the specification.

## Priorities

1. Correct execution of the four required operations through the Go backend.
2. React with TypeScript, validation, error handling, and responsiveness.
3. Meaningful tests for both layers and measured coverage.
4. A reproducible English README and accurate prompt record.
5. Publication to the supplied repository when authorized.

Advanced operations and Docker are optional. Do not sacrifice the priorities above for extras. Do not introduce a database, authentication, expression parser, or unnecessary infrastructure.

## Working approach

- Inspect files, instructions, and Git state; preserve existing changes.
- Use English in code, UI, API messages, and all repository documentation.
- Keep mathematical logic independent of HTTP and execute calculations on the backend.
- Follow SPECS.md and document reasons for necessary adjustments.
- Complete and verify each stage before advancing. Maintain docs/implementation-status.md during implementation.
- Record actual prompts in PROMPTS.md without inventing history. Label translations and hypothetical examples.
- Run tests, coverage, type checking/build, formatting, and go vet as specified.
- Never invent test results, coverage, elapsed time, publication, or recruiter delivery.
- Use https://github.com/eduardoalmeidajesus/calculator-sezzle as the supplied target. Verify remote and authentication before publishing and preserve history.

## Completion

Check all applicable acceptance criteria in SPECS.md. Report delivered features, executed checks, coverage, limitations, and external dependencies. Documentation or a checked checklist does not replace implementation and verification.
