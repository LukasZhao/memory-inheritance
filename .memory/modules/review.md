# Memory Readiness Review

This file stores detailed memory about the review command.

## Scope

Read this file only when implementing or modifying the review command.

## Criticality

7

## Notes

- `review` checks whether a brand new AI coding agent can take over immediately.
- Readiness status is `Ready`, `Usable`, or `Incomplete`; do not add numeric scoring.
- The command is local-only and should not call external AI APIs.
- Review inspects memory files and reports issues, but never auto-fixes content.
- Checks cover structure, agent adapters, context richness, token-aware organization, and freshness.
- Failed and warning checks should include concise impact messages.
