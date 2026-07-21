# 12 — Unit Tests for Pure Business Logic

**What to build:** Add a test runner and unit tests for all critical pure functions. These prove correctness during defense without needing live infrastructure.

**Blocked by:** 05 (scopeToTargetAudience function exists), 09 (any new pure functions from status refactor)

**Status:** ready-for-agent

- [ ] Add `vitest` to devDependencies (lightweight, fast, TS-native — no config needed for simple tests)
- [ ] Add `"test": "vitest run"` script to package.json
- [ ] Test `matchesTargetAudience`: all=true, programs match/no-match, year_levels match/no-match, both programs+year_levels (AND logic), unrecognized structure (fail-open), null profile fields
- [ ] Test `getNavigationTarget`: emergency tier → emergency, suspension channel → status, valid broadcast_id → detail, fallback → feed, null data → feed
- [ ] Test `formatRelativeTime`: <60s, 60s-60m, 1h-24h, 24h-48h (Yesterday), >48h (MMM D)
- [ ] Test `suspensionAppliesToStudent`: each scope value with matching/non-matching profiles, fail-open on unrecognized scope
- [ ] Test `deriveLevelFromProgram`: all program values map to correct levels
- [ ] Test `scopeToTargetAudience` (new): each scope maps to correct target_audience structure
- [ ] Property test with fast-check: `matchesTargetAudience({all: true}, anyProfile)` always returns true
