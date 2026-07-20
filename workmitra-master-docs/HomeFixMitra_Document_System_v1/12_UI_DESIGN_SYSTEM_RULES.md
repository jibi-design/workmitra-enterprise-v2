# HOMEFIX MITRA — UI DESIGN SYSTEM RULES

## 1. Inherits From

This document inherits the Core Master Truth.

If this document conflicts with `01_CORE_MASTER_TRUTH.md`, Core Master Truth wins.

## 2. Purpose

UI Design System Rules define the shared HomeFix Mitra visual, interaction, readability, page-shell, card, list, CTA, empty-state, icon, trust-strip, first-time UX, microcopy and component-behavior rules.

This file is only for UI / UX / design-system truth.

Product logic belongs in:

- `01_CORE_MASTER_TRUTH.md`
- domain architecture documents
- `11_CROSS_DOMAIN_SYSTEM_RULES.md`

## 3. Core UI Principle

UI is part of trust.

Every HomeFix Mitra screen must help the user understand:

- who they are acting as
- which record they are seeing
- who owns the service
- which bill / receipt is linked
- whether complaint / revisit exists
- what is pending
- what action is safe next
- what is demo/local vs real production

## 4. Visual Identity Direction

HomeFix Mitra should feel:

- premium
- calm
- Kerala dark-theme inspired
- high-readability
- service-memory-first
- trust-first
- privacy-safe
- mobile-first
- enterprise-grade

It must not feel:

- cheap demo app
- messy service directory
- social media app
- payment app in Phase-0
- legal verification portal in Phase-0
- provider surveillance system
- crowded admin tool for normal users

## 5. Premium Kerala Dark Theme Rule

The visual direction should use:

- dark premium base
- warm highlight accents
- calm green / teal trust accents where suitable
- clean cards
- strong contrast
- readable typography
- generous spacing
- polished service-memory feeling

Do not use:

- low contrast grey text
- crowded bright colors
- random decorative symbols
- childish styling
- weak demo-looking cards
- confusing role colors

## 6. Readability Rules

Every screen must maintain:

- clear font hierarchy
- comfortable line height
- high contrast
- readable card spacing
- obvious section headings
- simple labels
- visible status meaning
- tappable actions

Avoid:

- tiny secondary text
- long dense paragraphs inside cards
- cramped list rows
- too many badges
- unclear icon-only actions
- hidden meaning by color only

## 7. Page Shell Rule

Each page should have:

- clear title
- short subtitle
- primary action where needed
- trust / status strip where helpful
- content grouped into readable sections
- empty state when no data exists
- role-safe navigation behavior

Page shell must not show:

- hidden admin controls
- other role actions
- provider-private notes to customer
- customer vault details to provider
- fake production claims

## 8. Role-Safe Visual Behavior

Customer screens must visually feel:

- memory-first
- personal
- privacy-safe
- action-clear

Independent Technician screens must visually feel:

- self-service provider workspace
- receipt-first
- schedule-aware
- complaint-responsible

Shop Owner screens must visually feel:

- shop-control workspace
- team-aware
- receipt / complaint responsible
- customer-continuity focused

Shop Technician screens must visually feel:

- assignment-focused
- limited
- task-clear
- under shop context

Admin screens must stay hidden from normal launch UI.

## 9. Landing / Role Entry Rule

If HomeFix Mitra has a role-entry screen, it must show only launch-approved role contexts:

- Customer
- Independent Technician
- Shop Owner
- Shop Technician under shop context, only if product flow needs separate entry

It must not show:

- Admin
- Support Reviewer
- Complaint Reviewer
- Receipt Integrity Reviewer
- Claim Privacy Reviewer
- hidden governance roles

Role selection wording must be simple.

Suggested examples:

- Customer: I want to manage my home service records.
- Independent Technician: I work independently and issue my own service receipts.
- Shop Owner: I run a shop and manage shop services.
- Shop Technician: I work under my shop and handle assigned service tasks.

## 10. Component Rules

### 10.1 Page Shell

Every page shell should provide:

- page title
- subtitle or context line where needed
- primary action placement consistency
- visible role/context identity
- clean vertical rhythm
- readable section separation

### 10.2 Cards

Cards must feel premium, readable and calm.

Card rules:

- clear title hierarchy
- consistent spacing
- strong but soft separation from background
- visible action zone
- no noisy border clutter
- no decorative overload

Cards must not feel:

- cheap
- cramped
- dashboard-noisy
- template-like

### 10.3 List Rows

List rows must support fast scanning.

List row rules:

- clear primary line
- secondary line only when useful
- status visible without clutter
- tap target comfortable
- no crowded icon pile
- no hidden important state

### 10.4 Trust Strips

Trust strips are short context bars that explain safe record truth.

Trust strips may show:

- source label
- provider context
- receipt state
- complaint/revisit link
- demo/local honesty
- accepted/disputed/corrected signal

Trust strips must not fake:

- government verification
- legal authority
- payment guarantee
- hidden admin truth

### 10.5 Status Chips

Status chips must stay readable and restrained.

Rules:

- status meaning must be obvious
- text must remain readable
- color must not be the only signal
- no excessive badge stacking
- use only meaningful statuses

### 10.6 CTA Hierarchy

Every screen must have clear CTA hierarchy:

1. primary action
2. secondary action
3. low-priority text action

CTA rules:

- only one dominant primary action per main view
- destructive action must never look equal to safe action
- acceptance and dispute actions must be clearly separated
- complaint, correction and reopen flows must remain explicit

### 10.7 Empty States

Every meaningful empty state should include:

- what this place is for
- what will appear here later
- the safest next action
- calm, non-alarming wording

Empty states must not feel like errors.

### 10.8 Form Controls

Forms must stay mobile-first and low-confusion.

Rules:

- clear labels
- simple helper text
- realistic examples
- safe error wording
- no over-dense forms
- no forced jargon
- one decision layer at a time

## 11. First-Time UX Rule

First-touch screens must deliver value before heavy setup.

Customer should quickly feel:

- my bill is safe
- my service is saved
- I can find this later

Independent Technician should quickly feel:

- I can create and send a receipt fast

Shop Owner should quickly feel:

- I can manage shop service workflow clearly

Shop Technician should quickly feel:

- I can see my assigned work clearly

## 12. Non-App Customer UI Boundary Rule

UI wording must not imply that customer app installation is mandatory for complaints, service follow-ups or basic service continuity.

Invite-to-install screens may explain the value of HomeFix Mitra, but they must not block or shame non-app customers.

Safe wording should frame app installation as:

- useful for saving records
- helpful for finding bills later
- optional for easier follow-up
- valuable for service memory

Avoid wording that implies:

- complaint rejected without app
- service follow-up impossible without app
- historical records automatically unlocked by phone number
- provider can access the full customer vault after invite

## 13. Microcopy Rules

Microcopy must remain:

- simple
- calm
- role-safe
- trust-preserving
- globally understandable
- English-only
- not over-corporate
- not legally misleading

Do not use wording that implies production-grade authority when not truly implemented.

Prefer wording such as:

- local record
- customer accepted
- provider-issued receipt
- claim pending review
- revisit scheduled
- correction requested

Avoid wording such as:

- legally verified
- officially approved
- payment guaranteed
- government verified
- fully secured by default
- permanently confirmed

## 14. State-Behavior Matrix Rule

Every important component should define the following states where relevant:

- default
- hover
- active
- focus
- disabled
- loading
- empty
- error
- success

State behavior must remain consistent across roles.

### 14.1 Focus State Rule

Focus must be clearly visible.

It must not rely on color alone.

### 14.2 Disabled State Rule

Disabled actions must still remain understandable.

If possible, explain why action is unavailable.

### 14.3 Loading State Rule

Loading must feel stable and trustworthy.

Prefer:

- skeletons
- progress placeholders
- non-panicking wording

Avoid:

- blank flashes
- unstable layout jumps
- technical loading jargon

### 14.4 Error State Rule

Error messaging must explain what user can do next.

Avoid blame-heavy or technical wording.

### 14.5 Success State Rule

Success must confirm the outcome clearly without over-celebration.

## 15. Role-Specific Visual Depth Rule

### 15.1 Customer Visual Depth

Customer side may use the richest emotional polish.

It should feel:

- safe
- calm
- premium
- personal
- memory-first

### 15.2 Independent Technician Visual Depth

Independent Technician side should feel:

- fast
- practical
- field-friendly
- receipt-first
- work-mode clear

### 15.3 Shop Owner Visual Depth

Shop Owner side should feel:

- operational
- premium
- controlled
- team-aware
- responsibility-clear

### 15.4 Shop Technician Visual Depth

Shop Technician side should feel:

- light
- fast
- task-first
- assignment-centered
- minimally decorative

## 16. Global UI Neutrality, Content Safety and Display Rules

### 16.1 Region-Safe UI Content Rule

Avoid hardcoded city, state or district references in product UI unless user-entered.

Avoid region-only utility assumptions in core UI.

### 16.2 Religion and Culture Neutrality UI Rule

Do not use religion-specific greetings, symbols, examples or holiday assumptions in core UI or demo data.

### 16.3 Neutral Example-Content Rule

Prefer:

- generic provider names
- neutral property labels
- neutral appliance examples
- globally understandable wording

### 16.4 Global Content Clarity Rule

Core UI labels must remain simple English, neutral and globally understandable.

Avoid:

- slang
- local-only abbreviations
- region-specific service assumptions in global UI labels

### 16.5 Currency Display UI Rule

UI must not hardcode one permanent currency symbol.

All money display components must support dynamic currency rendering from stored currency context.

### 16.6 Value-First and Low-Overload UI Caution Rule

Customer home must prioritize immediate value, clarity and action-first simplicity.

Do not overload customer home with too many cards or architecture concepts too early.

### 16.7 Freelancer Speed Rule

Independent Technician flows must stay ultra-fast, low-field, one-thumb realistic and must not become admin-heavy.

## 17. Final Boundary Rule

This file must remain:

- UI-only
- role-safe
- readability-first
- premium
- globally neutral
- Phase-0 honest
- enterprise-grade

Product logic must remain outside this file unless directly required for honest UI behavior.
