# 05 — Fix Suspension Action (Scope → Target Audience + Message Templates)

**What to build:** The `createSuspension` server action now maps scope to the correct `target_audience` (including `levels` field) and generates human-readable broadcast body using structured templates. Admin can optionally override with a custom message.

**Blocked by:** 01 (level trigger must exist so Edge Function can filter), 03 (Edge Function must support `levels` filtering)

**Status:** ready-for-agent

- [ ] Create `scopeToTargetAudience(scope, scopeDetail)` utility function that maps scope enum → target_audience object with `levels` array
- [ ] Replace `target_audience: { all: true }` in createSuspension with `scopeToTargetAudience(scope, scopeDetail)`
- [ ] Create `generateSuspensionBody(source, reason, scope, duration, suspensionDate, customMessage?)` that produces human-readable templates per source, with scope stated in natural language
- [ ] Replace the robotic body template with the new function
- [ ] Add optional `custom_message` textarea field to the new-suspension-dialog form
- [ ] If custom_message is provided and non-empty, use it as the broadcast body instead of auto-generated
- [ ] Push notification title format: "🔴 Class Suspension — [friendly date]"
