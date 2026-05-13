Memory Inheritance — README v0.5 Update Draft

What is Memory Inheritance?

Memory Inheritance is a lightweight local-first context management system for AI coding agents.

It helps AI tools like Codex, Claude, Cursor, Gemini, and ChatGPT inherit project context across sessions instead of repeatedly re-learning the repository from scratch.

The project focuses on:

* Persistent project memory
* AI handoff readiness
* Token-aware context routing
* Marker-safe synchronization
* Machine-readable review diagnostics
* Local-first workflows

It intentionally does NOT try to become:

* an autonomous agent runtime
* an AI operating system
* a background daemon platform
* an auto-commit / auto-push workflow
* a swarm orchestration framework

⸻

Core Concepts

Canonical Project Memory

PROJECT_MEMORY.md is the canonical long-term project memory.

It stores:

* current development state
* architecture decisions
* manual notes
* AI collaboration rules
* generated project scan data
* generated Git development memory

⸻

Marker-Safe Sync

Generated sections are fenced using markers:

<!-- AUTO-START:SECTION -->
...
<!-- AUTO-END:SECTION -->

This allows:

* automatic regeneration
* preservation of manual notes
* safe incremental syncs
* deterministic updates

Human-written knowledge outside markers is preserved.

⸻

AI Agent Adapters

Memory Inheritance provides lightweight adapter files:

* AGENTS.md
* CLAUDE.md

These files instruct AI agents to:

* read PROJECT_MEMORY.md
* use .memory/index.json
* follow project collaboration rules

⸻

Token-Aware Context Routing

.memory/index.json acts as a structured reference index.

Instead of loading every document every session, agents can selectively load:

* relevant memory modules
* architectural context
* workflow guidance
* testing notes
* Git memory

This reduces token waste and lowers AI context drift.

⸻

Review System

Memory Inheritance includes a local review system for evaluating AI handoff readiness.

Human Review Output

mem-extract review

Example:

Memory Readiness Review
────────────────────────────────────────
Status: Ready — agent can take over immediately

The review checks:

* project structure
* adapter readiness
* context richness
* token-aware organization
* freshness

⸻

Machine-Readable Review

mem-extract review --json

Outputs structured diagnostics:

{
  "overallStatus": "Ready — agent can take over immediately",
  "categories": [...],
  "suggestedNextSteps": [...]
}

This enables:

* IDE integrations
* MCP tooling
* CI validation
* automated diagnostics
* external AI tooling

⸻

Current Architecture

src/
  commands/
    review.ts
  review/
    checks.ts
    format.ts
    types.ts

Review logic is split into:

* check generation
* formatting
* shared typed structures

This separation keeps review behavior stable while allowing future expansion.

⸻

Testing

The project now includes deterministic fixture-based tests.

Current coverage includes:

* Ready review status
* Usable review status
* Incomplete review status
* marker-safe sync preservation
* exact CLI output stability
* JSON review output

Run tests:

npm test

Build:

npm run build

⸻

Local-First Philosophy

Memory Inheritance is intentionally local-first.

The system avoids:

* external AI APIs
* background daemons
* auto-sync services
* hidden network behavior
* autonomous commit pipelines

Project memory should remain transparent, inspectable, and developer-controlled.

⸻

Ruflo Integration

Ruflo is supported as a development-time advisory layer.

Recommended usage:

* architecture review
* diff risk analysis
* planning assistance
* testing strategy review

Not recommended:

* autonomous swarms
* persistent agents
* auto-commit hooks
* daemonized workflows

Recommended workflow:

Codex → implement
Ruflo → analyze_diff
Human → final decision

⸻

Current v0.5 Status

Completed

* marker-safe sync
* canonical project memory
* structured memory routing
* deterministic review system
* machine-readable review output
* fixture-based tests
* safe AI-assisted workflow

In Progress

* memory freshness semantics
* reference validation
* token-aware memory scoring
* stale context detection
* memory optimization heuristics

Explicit Non-Goals

* autonomous AI organizations
* swarm runtimes
* memory graphs
* hidden automation
* AI operating systems

⸻

Vision

Memory Inheritance aims to make project memory reliable enough for AI handoff.

The long-term goal is not autonomous coding.

The goal is stable context inheritance:

A new AI session should feel like a developer continuing work,
not a new developer joining the project from zero.
