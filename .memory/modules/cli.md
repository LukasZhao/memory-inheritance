# CLI Architecture

This file stores detailed memory about CLI command behavior.

## Scope

Read this file only when changing CLI commands.

## Criticality

8

## Notes

- `init` creates memory files.
- `sync` updates generated sections.
- `status` reports current memory state.
- `inspect <section>` reads a section from `PROJECT_MEMORY.md`.
- `score <reference-id> <score>` updates memory reference criticality.
