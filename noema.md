# Noema mobile app — implementation guideline

## Objective

Build **Noema**, a phone-first personal cognitive assistant focused on **deep work support**, **quick capture**, **daily planning**, and **end-of-day shutdown**.

The first version should prioritize a calm, directive workflow rather than an open-ended chatbot. The app must help the user:

1. define the most important work for the day,
2. protect deep-work sessions,
3. capture interruptions quickly without breaking focus,
4. batch shallow work for later,
5. review and close the day cleanly.

## Product framing

Noema is not a generic productivity app. It is a **personal cognitive assistant** with a lightweight closed loop:

**Observe → Reason → Act → Learn**

* **Observe**: capture user inputs, tasks, session events, quick notes, and daily outcomes.
* **Reason**: classify notes, prioritize tasks, detect overload, and recommend focus blocks.
* **Act**: present plans, reminders, focus sessions, and structured reviews.
* **Learn**: adapt suggestions from the user’s patterns over time.

## Implementation scope for v0.1

Build only the following core features:

### 1. Daily Focus Brief

A home screen that shows:

* primary deep task
* secondary task
* admin batch
* next focus session
* quick capture entry point

### 2. Focus Session mode

A session screen that lets the user:

* start a focus block
* set or confirm a goal
* see elapsed and remaining time
* add quick captures without leaving focus mode
* finish session with a lightweight reflection

### 3. Quick Capture

Allow fast capture of:

* task
* idea
* reminder
* note

Keep this intentionally frictionless.

### 4. Inbox / Triage

A screen to process captured items into:

* deep task
* shallow task
* note
* archived item

### 5. Shutdown Review

An end-of-day flow that records:

* what was completed
* what remains open
* first important task for tomorrow
* optional reflection note

### 6. Minimal chat screen

Include a simple chat interface only for planning/reflection support. Do not make chat the center of the app.

## Technical stack

Use:

* **Expo + React Native + TypeScript**
* **Expo Router** for navigation
* **Supabase** for auth, storage, and database
* **React Query / TanStack Query** for server state
* **Zustand** for lightweight client state if needed
* **Jest + jest-expo** for unit tests

Prefer a clean and modular architecture. Avoid premature complexity.

## Initial information architecture

Use Expo Router with a tab layout.

Suggested routes:

* `/(tabs)/index` → Home / Daily Focus Brief
* `/(tabs)/focus` → Focus Session
* `/(tabs)/inbox` → Inbox / Triage
* `/(tabs)/review` → Shutdown / Review
* `/(tabs)/chat` → Minimal planning chat
* `/capture` → Modal quick capture
* `/task/[id]` → Task detail
* `/session/[id]` → Session detail

## Data model

Create Supabase tables with RLS enabled.

### profiles

* id (uuid, references auth.users)
* display_name
* timezone
* created_at
* updated_at

### tasks

* id
* user_id
* title
* notes
* type (`deep`, `shallow`, `admin`)
* status (`inbox`, `planned`, `active`, `done`, `archived`)
* priority (`low`, `medium`, `high`)
* scheduled_for (timestamp, nullable)
* due_at (timestamp, nullable)
* source (`manual`, `capture`, `ai`)
* created_at
* updated_at

### captures

* id
* user_id
* content
* kind (`task`, `idea`, `reminder`, `note`, `unknown`)
* processed (boolean)
* created_at

### focus_sessions

* id
* user_id
* task_id (nullable)
* goal
* started_at
* ended_at
* planned_minutes
* actual_minutes
* status (`active`, `completed`, `abandoned`)
* reflection
* interruptions_count
* created_at

### daily_briefs

* id
* user_id
* brief_date
* primary_task_id (nullable)
* secondary_task_id (nullable)
* admin_notes
* next_focus_at (nullable)
* created_at
* updated_at

### shutdown_reviews

* id
* user_id
* review_date
* completed_summary
* open_loops
* first_task_tomorrow
* reflection
* created_at

## AI behavior constraints

The assistant behavior should be:

* calm
* concise
* directive but not annoying
* optimized for reducing fragmentation

Do not implement noisy push behavior.
Do not generate lots of unsolicited advice.
Do not force open-ended chat when a structured interaction is better.

## UX principles

* Default to **structured screens** over chat.
* Keep text short and readable.
* Minimize taps for capture and focus start.
* Use clean spacing and strong hierarchy.
* Use notifications sparingly.
* Prefer “review later” over “interrupt now.”

## Suggested component structure (make sure not conflict with the template structure)

* `components/ui/*` for common primitives
* `components/home/*`
* `components/focus/*`
* `components/inbox/*`
* `components/review/*`
* `components/chat/*`
* `lib/supabase.ts`
* `lib/queryClient.ts`
* `lib/validators/*`
* `hooks/*`
* `store/*`
* `types/*`

## State strategy

Use:

* Supabase + React Query for persisted remote state
* local component state for forms
* lightweight store only for cross-screen transient state such as active session UI state
* allow user to cache their own data in the app (e.g. notes, tasks, etc.)
* for AI, we will use Gemini API, and the API KEY is provided by user on the settings screen

Avoid putting server state into a global store.

## Auth

Implement Supabase auth with email magic link first.
Do not add social auth in v0.1 unless already needed.

## Functional milestones

### Milestone 1 — App skeleton

* create Expo app with TypeScript and Expo Router
* configure tabs and base theme
* set up linting and formatting
* create placeholder screens

### Milestone 2 — Supabase foundation

* configure Supabase client
* implement auth flow
* create tables and policies
* connect app to profile data

### Milestone 3 — Tasks and capture

* implement task list and task creation
* implement quick capture modal
* implement inbox triage flow

### Milestone 4 — Focus sessions

* implement session timer
* link session to task or freeform goal
* save completed sessions
* add simple interruption capture count

### Milestone 5 — Daily brief and shutdown

* implement home brief
* implement daily selection of primary and secondary tasks
* implement shutdown review flow

### Milestone 6 — Testing and release prep

* add unit tests for core logic and hooks
* verify on iOS Simulator
* create development build
* prepare TestFlight build

## Acceptance criteria for v0.1

The app is complete when:

1. a user can sign in,
2. create and triage captures,
3. assign one primary deep task for the day,
4. run and complete a focus session,
5. review the day with a shutdown flow,
6. data persists in Supabase,
7. core flows run in iOS Simulator,
8. a TestFlight beta build can be generated.

## Implementation instructions for Codex

When working on this repository:

1. inspect the current project structure before changing anything;
2. make changes in small, reviewable steps;
3. keep code production-lean and avoid speculative abstractions;
4. prefer typed utilities and explicit interfaces;
5. add tests for non-trivial logic;
6. run lint and tests after each milestone;
7. document any environment variables and setup changes;
8. do not introduce large dependencies unless clearly justified;
9. preserve a clean mobile UX and avoid feature bloat.

## First concrete tasks for Codex

1. Create a new Expo Router app in TypeScript.
2. Add a tab layout with screens: Home, Focus, Inbox, Review, Chat.
3. Add a modal route for Quick Capture.
4. Set up Supabase client with environment variables.
5. Implement email magic-link authentication.
6. Create typed models and API helpers for `tasks`, `captures`, and `focus_sessions`.
7. Build the Home screen with today’s primary task card and quick capture button.
8. Build the Focus screen with a simple timer and completion flow.
9. Build the Inbox screen for capture triage.
10. Add Jest configuration and initial tests for task classification helpers.

## Deliverable expectations from Codex

For each milestone, Codex should produce:

* code changes,
* a short summary of what was implemented,
* setup steps if needed,
* known gaps or follow-up work,
* verification notes describing how the feature was tested.

## Non-goals for v0.1

Do not build these yet:

* advanced multi-agent architecture
* full autonomous planning
* heavy analytics dashboards
* social features
* large-scale notifications system
* complicated gamification
* too many assistant personalities or modes

## Definition of success

The first version is successful if it feels calm, focused, and genuinely useful for daily deep work on a smartphone.
