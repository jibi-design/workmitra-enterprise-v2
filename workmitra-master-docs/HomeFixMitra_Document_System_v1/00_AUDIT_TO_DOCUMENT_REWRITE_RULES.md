# 00_AUDIT_TO_DOCUMENT_REWRITE_RULES.md

Version: 1.0  
Project: HomeFix Mitra  
Status: Active audit and documentation rewrite rule document  
Applies to: Customer, Independent Technician, Shop Owner, Shop Technician, and future shared operational documents

---

# Purpose

This document defines the audit truth rules used to rewrite, correct, and stabilize all HomeFix Mitra architecture and feature documents.

This is a common rule document for:

- Customer
- Independent Technician
- Shop Owner
- Shop Technician
- future shared operational documents

All role-specific architecture documents must follow this document.

---

# 1. Why This Audit Was Started

HomeFix Mitra was initially built in a Phase-0 local/demo-first development stage.

During that phase:

- many screens were designed ahead of fully verified behaviour
- several documents described intended future workflows
- some UI layers looked more complete than the actual verified behaviour
- launch-visible wording became stronger than the currently proven functionality

Because of this, a behaviour-based audit became necessary.

The purpose of the audit is to:

- identify current real application truth
- separate implemented behaviour from future architecture intentions
- prevent launch-visible overclaim
- stop UI existence from being mistaken as full workflow completion
- convert documentation from future-design-heavy into current verified truth

---

# 2. Why The Audit Is Important Now

HomeFix Mitra is no longer intended to remain a fake or hollow demo-style application.

The product direction is now:

- real local-working behaviour
- real phone usability
- real save/load continuity
- realistic application behaviour even without backend/server infrastructure

Backend/server infrastructure may come later.

However, the current Phase-0 application must still behave like a real application locally.

That means:

- users can perform real actions
- records save locally
- records reload correctly
- linked pages reflect saved state
- app close/reopen continuity is respected
- launch wording reflects actual behaviour truthfully

The audit exists to support this transition.

---

# 3. What Real Working Means In Current Phase

A feature is not considered fully working just because UI exists.

Current audit standards require checking:

- UI existence
- real user action
- local save behaviour
- local reload behaviour
- app close/reopen continuity
- linked page reflection
- linked record continuity
- wording safety
- launch-visible honesty

If these are missing, the feature cannot be overclaimed.

---

# 4. Current Technical Reality

Current HomeFix Mitra architecture is:

- local-first
- IndexedDB/local-storage based
- no production backend/server yet
- no live cloud sync yet
- no real notification infrastructure yet
- no real provider/customer messaging infrastructure yet

However, this does not mean the app is allowed to behave like a fake prototype.

The expected standard is:

- real local-working application behaviour

---

# 5. Audit Philosophy

The audit is behaviour-based, not page-based.

The audit does not ask:

```text
Does a screen exist?
```

The audit asks:

```text
Does the feature actually work?
Does user action do something real?
Is local persistence real?
Does reopen continuity exist?
Do linked pages reflect saved data?
Does wording stay truthful?
Is the feature safe to describe publicly?
```

---

# 6. Core Audit Rules

## 6.1 UI existence alone is not completion

A visible page is not automatically a complete feature.

## 6.2 Read-layer is not full workflow

A page that only reads snapshot/local data must not be described as:

- full management system
- live workflow engine
- active lifecycle controller
- real notification infrastructure
- real scheduling system
- verification engine
- provider management system

unless those behaviours are actually verified.

## 6.3 Reopen continuity must be verified separately

If app close/reopen behaviour was not explicitly verified, status must remain:

```text
Needs explicit verification
```

It must never be silently assumed.

## 6.4 Linked detail continuity must be verified separately

If list-to-detail persistence after reopen is not verified, it cannot be claimed complete.

## 6.5 Launch wording must stay truthful

Launch-visible wording must match current verified behaviour only.

Future intentions must not be presented as active behaviour.

---

# 7. Official Audit Classification System

Every audited feature must end with one final classification only.

Allowed classifications:

## UI only

UI exists, but no real working behaviour.

## Local-working partial

Some real local behaviour exists, but workflow depth or continuity is incomplete or unverified.

## Local-working complete

Real local behaviour is verified end-to-end in the current phase.

## Not launch-ready

Feature exists partially or structurally, but current behaviour is unsafe or incomplete for launch claims.

---

# 8. Documentation Rewrite Rules

All future architecture rewrites must follow these rules.

## 8.1 Separate current truth vs future architecture

Documents must clearly separate:

- current implemented truth
- future intended architecture

These must never mix together invisibly.

## 8.2 Remove overclaim

Rewrite must remove wording that falsely implies:

- full lifecycle workflow
- verified continuity
- messaging systems
- scheduling systems
- management systems
- dispute systems
- notification engines
- verification infrastructure

unless verified by audit.

## 8.3 Read-layer wording must stay bounded

If a page is primarily a read layer, documentation must explicitly say so.

## 8.4 Local-first truth must stay visible

Current architecture is local-first.

Documents must not accidentally imply:

- cloud sync
- live backend
- distributed infrastructure
- multi-device continuity
- server-side verification

unless implemented.

---

# 9. Rewrite Status Labels

During document rewrite, each section should internally be classified as:

- Keep
- Soften
- Rewrite
- Move to future phase
- Remove

---

# 10. Common Launch-Safety Risks

The audit identified repeated high-risk wording patterns:

- manage
- control
- review and control
- notification preferences
- privacy controls
- real alerts
- full workflow
- verification
- trusted
- protected
- dispute
- claim management
- reminder engine

These words require strict audit evidence before use.

---

# 11. Current Product Direction

HomeFix Mitra is moving from:

```text
demo-oriented architecture direction
```

to:

```text
truth-based local-working product direction
```

The application must behave like a real usable app on-device even before backend/server infrastructure exists.

This includes:

- local save
- local continuity
- realistic user flow
- truthful UI wording
- linked record reflection
- stable launch-safe behaviour

---

# 12. Evidence Priority Order

Audit conclusions must follow evidence strength.

## Highest-trust evidence

- real device verification
- persisted reopen verification
- linked-flow verification
- actual saved data reflected after app close/reopen

## Medium-trust evidence

- local save evidence
- route/state reflection
- storage inspection
- same-session linked-page reflection

## Lower-trust evidence

- UI existence
- static rendering
- placeholder data
- intended architecture notes

Lower-trust evidence must never be used to claim full workflow completion.

---

# 13. Continuity Warning Rule

A feature must not be classified higher merely because state survives during same-session navigation.

True continuity requires:

- app close
- app reopen
- data reload
- linked-page reflection after reopen

without manual reconstruction.

Same-session React state is not enough to prove real continuity.

---

# 14. Simulated Behaviour Boundary

Temporary simulation is allowed only when:

- behaviour is truthful
- no fake external system claim exists
- user outcome is real locally
- wording clearly stays within current technical reality

Simulation must never pretend to be:

- live backend execution
- real push notification infrastructure
- real cloud synchronization
- real approval workflow
- real provider communication infrastructure

---

# 15. Audit Evidence Format

Every audit should document:

- feature area audited
- files reviewed
- workflow tested
- storage layer checked
- reopen verification state
- linked-page verification state
- wording-risk findings
- final classification
- required fix or future verification need

---

# 16. Local-Working Complete Rule

A feature may only be classified as Local-working complete when:

- user action works
- persistence works
- reopen continuity works
- linked-page continuity works
- wording is launch-safe
- workflow behaves consistently across refresh/reopen conditions

If any of these are missing or unverified, the feature cannot be classified as Local-working complete.

---

# 17. Final Rewrite Objective

The final goal of the rewrite process is:

- enterprise-grade truth-based documentation
- launch-safe wording
- real behaviour alignment
- stable local-working product structure
- future-safe architecture planning
- clear separation between current behaviour, future architecture, and unverified assumptions

---

# Final Core Principle

HomeFix Mitra documentation must describe:

1. verified current product truth first
2. future architecture second
3. assumptions never

---

— END OF 00_AUDIT_TO_DOCUMENT_REWRITE_RULES.md —
