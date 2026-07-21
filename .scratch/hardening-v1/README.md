# CampusCurrents v1 Hardening — Ticket Index

## Dependency Graph

```
01 Database Schema     02 Security Fixes
 │                      │
 ├──────────┬───────────┤
 │          │           │
 ▼          ▼           │
03 Push Edge Function ◄─┘
 │
 ├──────────┐
 ▼           ▼
04 Receipt   05 Suspension Action
Checker      │
             │
         06 Emergency Hardening
             │
             ▼
         07 Accountability Dashboard

08 Delivery Denominator Fix (independent)

09 Mobile Status Screen ◄── 01, 05
10 Mobile Auth Guard + Feed ◄── 01
11 Mobile Notif Preferences ◄── 01, 03
12 Unit Tests ◄── 05, 09
13 Final Cleanup ◄── all
```

## Parallelizable Work

These can run simultaneously:
- **01** and **02** (no dependencies between them)
- **08** (independent of everything)
- **09**, **10**, **11** (all depend on 01 being done, but not on each other)

## Frontier (Start Here)

Tickets with zero blockers:
1. **01 — Database Schema Additions**
2. **02 — Security Fixes**
3. **08 — Delivery Denominator Fix**

## Credit-Saving Strategy

- Tickets 01 and 02 are pure SQL — can be done via Supabase MCP tools in one turn each
- Ticket 03 is one file (Edge Function rewrite) — single context window
- Tickets 08, 09, 10, 11 are focused on specific files — minimal file reads needed
- Ticket 12 is pure function tests — no infrastructure needed, one context window
- Ticket 13 is admin tasks + one small UI addition — quick

Estimated total: ~13 agent turns (one per ticket). Each ticket is sized to complete without re-reading the full codebase.
