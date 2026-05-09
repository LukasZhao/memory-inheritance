# Testing Notes

This file stores detailed memory about validation and packaging behavior.

## Scope

Read this file only when editing tests.

## Criticality

6

## Notes

- Test packaged behavior in a real local project.
- Commands must operate on `process.cwd()`.
- Memory files should be generated in the target project root.
- Packaged tests should cover `sync --recent <n>` inside a target Git repository.
- Manual notes, module files, and criticality scores must survive sync.
