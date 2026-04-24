# Design Document: To-Do Life Dashboard

## Overview

The To-Do Life Dashboard is a single-page, client-side web application built with vanilla HTML, CSS, and JavaScript. It serves as a browser homepage that consolidates four widgets — a greeting/clock, a focus timer, a task list, and a quick-links panel — into one cohesive view. All state is persisted in `localStorage`; there is no backend, no build step, and no external dependencies.

The design follows a **module pattern** in a single JavaScript file: each widget is encapsulated in its own object/namespace with `init`, `render`, and `save` responsibilities. A thin `App` coordinator bootstraps all modules and wires up cross-cutting concerns (theme, storage error handling).

### Key Design Decisions

- **No frameworks**: DOM manipulation is done with plain `document.querySelector` / `createElement`. This keeps the bundle size at zero and avoids any dependency churn.
- **CSS custom properties for theming**: Light/dark mode is implemented by toggling a `data-theme` attribute on `<html>` and defining all colors as CSS variables. No JavaScript style manipulation is needed beyond the attribute toggle.
- **Sort is display-only**: The canonical task order in `localStorage` is always insertion order. Sorting only affects the rendered list, so undo/redo of sort is free.
- **Inline editing**: Task editing replaces the task label with an `<input>` in place, avoiding modal dialogs.
- **Timer uses `setInterval`**: A 1-second interval drives both the clock and the countdown timer. A single shared interval is used for the clock; the timer gets its own interval that is cleared on stop/reset.

---

## Architecture

```
index.html
├── <link> → css/style.css
└── <script> → js/app.js

js/app.js  (single file, module-pattern namespaces)
├── Storage      — safe localStorage read/write with error handling
├── Theme        — light/dark toggle, persistence
├── Greeting     — clock, date, greeting text, name editing
├── Timer        — countdown, start/stop/reset, duration config
├── Tasks        — CRUD, duplicate check, sort, persistence
├── QuickLinks   — add/delete links, persistence
└── App          — bootstrap, wires all modules together
```

### Data Flow

```
User Interaction
      │
      ▼
Widget Handler (e.g. Tasks.addTask)
      │
      ├─► DOM update (render)
      │
      └─► Storage.save(key, data)
                │
                └─► localStorage.setItem(key, JSON.stringify(data))

Page Load
      │
      ▼
App.init()
      │
      ├─► Storage.load(key) → JSON.parse(localStorage.getItem(key))
      │
      └─► Each module.init(savedData) → module.render()
```

### Cross-Cutting Concerns

- **Storage errors**: `Storage.save` and `Storage.load` are wrapped in `try/catch`. On error, a dismissible banner is shown via `App.showWarning(message)`.
- **Timer ↔ Greeting clock**: Both use `setInterval(fn, 1000)`. They are independent intervals; the greeting clock starts once on `App.init()` and never stops.

---

## Components and Interfaces

### Storage Module

Provides safe wrappers around `localStorage`.

```js
Storage = {
  save(key, value)   // JSON.stringify + setItem; shows warning on error
  load(key)          // getItem + JSON.parse; returns null on error/missing
  remove(key)        // removeItem; shows warning on error
}
```

`localStorage` keys (all prefixed with `tld_` to avoid collisions):

| Key                  | Type     | Description                        |
|----------------------|----------|------------------------------------|
| `tld_name`           | string   | User's display name                |
| `tld_tasks`          | Task[]   | Array of task objects              |
| `tld_sort`           | string   | Active sort option identifier      |
| `tld_timer_duration` | number   | Timer duration in minutes          |
| `tld_links`          | Link[]   | Array of quick-link objects        |
| `tld_theme`          | string   | `"light"` or `"dark"`             |

---

### Theme Module

```js
Theme = {
  init()             // load saved preference; apply; wire toggle button
  apply(mode)        // set data-theme on <html>; update toggle icon/label
  toggle()           // flip between light and dark; persist
  current()          // returns "light" or "dark"
}
```

The toggle button is a `<button id="theme-toggle">` in the header. Clicking it calls `Theme.toggle()`.

---

### Greeting Module

```js
Greeting = {
  init()             // load saved name; start clock interval; render
  startClock()       // setInterval 1000ms → updateClock()
  updateClock()      // update #time and #date DOM elements
  getGreetingText()  // returns "Good Morning" | "Good Afternoon" | "Good Evening" | "Good Night"
  renderGreeting()   // compose "[Greeting], [Name]!" or "[Greeting]!" and update #greeting-text
  openNameEditor()   // show inline name input
  saveName(name)     // trim, validate ≤50 chars, persist, re-render
  clearName()        // remove from storage, re-render
}
```

Time-of-day boundaries:

| Hour range  | Greeting       |
|-------------|----------------|
| 05 – 11     | Good Morning   |
| 12 – 17     | Good Afternoon |
| 18 – 21     | Good Evening   |
| 22 – 04     | Good Night     |

---

### Timer Module

```js
Timer = {
  init()                    // load saved duration; render; wire buttons
  start()                   // setInterval 1000ms → tick(); update button states
  stop()                    // clearInterval; update button states
  reset()                   // stop; restore remaining to configured duration; render
  tick()                    // decrement remaining; render; if 0 → onComplete()
  onComplete()              // stop; notify user (Notification API or audio beep)
  setDuration(minutes)      // validate 1–120; update configured duration; persist; reset
  render()                  // format remaining as MM:SS; update #timer-display
  updateButtonStates()      // enable/disable #start-btn, #stop-btn per running state
}
```

Timer state (in-memory only, not persisted):

```js
{
  configuredMinutes: 25,   // persisted in tld_timer_duration
  remainingSeconds: 1500,  // derived from configuredMinutes on load/reset
  intervalId: null,        // setInterval handle
  isRunning: false
}
```

---

### Tasks Module

```js
Tasks = {
  init()                        // load tasks + sort pref; render
  addTask(text)                 // validate non-empty, check duplicate, push, persist, render
  editTask(id, newText)         // validate non-empty, check duplicate (excluding self), update, persist, render
  deleteTask(id)                // filter out by id, persist, render
  toggleComplete(id)            // flip completed flag, persist, render
  isDuplicate(text, excludeId)  // case-insensitive trim comparison against all tasks (except excludeId)
  setSort(option)               // persist sort option, render
  getSortedTasks()              // return tasks array sorted per current option (does not mutate stored array)
  render()                      // clear #task-list; for each sorted task, create task element
  renderTask(task)              // build and return a single task <li> element
  persist()                     // Storage.save('tld_tasks', tasks)
}
```

Sort options:

| Option ID          | Label            | Sort logic                                      |
|--------------------|------------------|-------------------------------------------------|
| `default`          | Default          | Insertion order (index in array)                |
| `az`               | A–Z              | `localeCompare` ascending on text               |
| `za`               | Z–A              | `localeCompare` descending on text              |
| `completed-last`   | Completed last   | incomplete first, then insertion order within   |
| `completed-first`  | Completed first  | complete first, then insertion order within     |

---

### QuickLinks Module

```js
QuickLinks = {
  init()                  // load links; render
  addLink(label, url)     // validate label ≤30 chars, validate URL, push, persist, render
  deleteLink(id)          // filter out by id, persist, render
  validateUrl(url)        // returns bool; uses URL constructor for parsing
  render()                // clear #links-container; for each link, create button element
  persist()               // Storage.save('tld_links', links)
}
```

---

### App (Bootstrap)

```js
App = {
  init()                  // call init() on all modules in order; wire global error banner
  showWarning(message)    // display dismissible #warning-banner with message
}
```

---

## Data Models

### Task

```js
{
  id: string,          // crypto.randomUUID() or Date.now().toString()
  text: string,        // trimmed task description
  completed: boolean,  // false on creation
  createdAt: number    // Date.now() timestamp — used to preserve insertion order after sort
}
```

### Link

```js
{
  id: string,    // crypto.randomUUID() or Date.now().toString()
  label: string, // display label, max 30 chars
  url: string    // full URL string (validated via URL constructor)
}
```

### Persisted State Summary

All values are JSON-serialized strings in `localStorage`:

```
tld_name           → "Alex"
tld_tasks          → [{ id, text, completed, createdAt }, ...]
tld_sort           → "default" | "az" | "za" | "completed-last" | "completed-first"
tld_timer_duration → 25
tld_links          → [{ id, label, url }, ...]
tld_theme          → "light" | "dark"
```

---

## HTML Structure

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Life Dashboard</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- Warning Banner (hidden by default) -->
  <div id="warning-banner" class="warning-banner hidden" role="alert">
    <span id="warning-message"></span>
    <button id="warning-close" aria-label="Dismiss warning">✕</button>
  </div>

  <!-- Header: Greeting Widget -->
  <header class="dashboard-header">
    <div class="greeting-section">
      <div id="time" class="time-display" aria-live="polite"></div>
      <div id="date" class="date-display"></div>
      <div id="greeting-text" class="greeting-text"></div>
      <!-- Inline name editor (hidden until activated) -->
      <div id="name-editor" class="name-editor hidden">
        <input id="name-input" type="text" maxlength="50" placeholder="Your name" aria-label="Display name">
        <button id="name-save">Save</button>
        <button id="name-cancel">Cancel</button>
      </div>
      <button id="edit-name-btn" class="icon-btn" aria-label="Edit name">✏️</button>
    </div>
    <button id="theme-toggle" class="icon-btn" aria-label="Toggle theme">🌙</button>
  </header>

  <!-- Main Content: Two-column layout -->
  <main class="dashboard-main">

    <!-- Left Column: Focus Timer -->
    <section class="widget timer-widget" aria-labelledby="timer-heading">
      <h2 id="timer-heading">Focus Timer</h2>
      <div id="timer-display" class="timer-display" aria-live="polite">25:00</div>
      <div class="timer-controls">
        <button id="start-btn">Start</button>
        <button id="stop-btn" disabled>Stop</button>
        <button id="reset-btn">Reset</button>
      </div>
      <div class="timer-config">
        <label for="duration-input">Duration (min)</label>
        <input id="duration-input" type="number" min="1" max="120" value="25" aria-describedby="duration-error">
        <button id="set-duration-btn">Set</button>
        <span id="duration-error" class="error-msg hidden" role="alert"></span>
      </div>
    </section>

    <!-- Right Column: Task List -->
    <section class="widget tasks-widget" aria-labelledby="tasks-heading">
      <h2 id="tasks-heading">Tasks</h2>
      <div class="task-input-row">
        <input id="task-input" type="text" placeholder="Add a task…" aria-label="New task" aria-describedby="task-error">
        <button id="add-task-btn">Add</button>
      </div>
      <span id="task-error" class="error-msg hidden" role="alert"></span>
      <div class="task-sort-row">
        <label for="sort-select">Sort:</label>
        <select id="sort-select" aria-label="Sort tasks">
          <option value="default">Default</option>
          <option value="az">A–Z</option>
          <option value="za">Z–A</option>
          <option value="completed-last">Completed last</option>
          <option value="completed-first">Completed first</option>
        </select>
      </div>
      <ul id="task-list" class="task-list" aria-label="Task list"></ul>
    </section>

  </main>

  <!-- Footer: Quick Links -->
  <footer class="dashboard-footer">
    <section class="widget links-widget" aria-labelledby="links-heading">
      <h2 id="links-heading">Quick Links</h2>
      <div class="link-input-row">
        <input id="link-label-input" type="text" maxlength="30" placeholder="Label" aria-label="Link label">
        <input id="link-url-input" type="url" placeholder="https://…" aria-label="Link URL" aria-describedby="link-error">
        <button id="add-link-btn">Add</button>
      </div>
      <span id="link-error" class="error-msg hidden" role="alert"></span>
      <div id="links-container" class="links-container"></div>
    </section>
  </footer>

  <script src="js/app.js"></script>
</body>
</html>
```

---

## CSS Design

### File: `css/style.css`

#### CSS Custom Properties (Theming)

All colors are defined as CSS variables on `:root` (light mode defaults) and overridden under `[data-theme="dark"]`:

```css
:root {
  --color-bg: #f5f5f5;
  --color-surface: #ffffff;
  --color-header-bg: #6b21a8;       /* purple gradient start */
  --color-header-bg-end: #4f46e5;   /* purple gradient end */
  --color-text: #1a1a1a;
  --color-text-muted: #6b7280;
  --color-text-on-header: #ffffff;
  --color-accent: #7c3aed;
  --color-border: #e5e7eb;
  --color-error: #dc2626;
  --color-success: #16a34a;
  --color-task-done: #9ca3af;
  --color-btn-primary: #7c3aed;
  --color-btn-primary-text: #ffffff;
  --color-btn-danger: #dc2626;
  --shadow: 0 2px 8px rgba(0,0,0,0.08);
}

[data-theme="dark"] {
  --color-bg: #111827;
  --color-surface: #1f2937;
  --color-text: #f9fafb;
  --color-text-muted: #9ca3af;
  --color-border: #374151;
  --color-task-done: #6b7280;
  --color-btn-primary: #8b5cf6;
  --shadow: 0 2px 8px rgba(0,0,0,0.4);
}
```

#### Layout

```css
/* Two-column main grid */
.dashboard-main {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header spans full width */
.dashboard-header {
  background: linear-gradient(135deg, var(--color-header-bg), var(--color-header-bg-end));
  color: var(--color-text-on-header);
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

/* Footer quick links */
.dashboard-footer {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
```

#### Responsive Breakpoint

At `max-width: 768px`, the two-column grid collapses to a single column:

```css
@media (max-width: 768px) {
  .dashboard-main {
    grid-template-columns: 1fr;
  }
}
```

#### Task Item Styling

Completed tasks use `text-decoration: line-through` and `color: var(--color-task-done)`. The class `task-item--done` is toggled on the `<li>` element.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Time formatting produces valid HH:MM output

*For any* `Date` object, the time-formatting function SHALL return a string matching the pattern `HH:MM` where HH is a zero-padded hour in [00, 23] and MM is a zero-padded minute in [00, 59].

**Validates: Requirements 1.1**

---

### Property 2: Date formatting produces human-readable output

*For any* `Date` object, the date-formatting function SHALL return a string that contains a valid day-of-week name, a numeric day, a month name, and a four-digit year.

**Validates: Requirements 1.2**

---

### Property 3: Greeting text is correct for every hour of the day

*For any* integer hour in [0, 23], `getGreetingText(hour)` SHALL return exactly one of the four greeting strings, and the returned greeting SHALL match the correct time-of-day partition:
- hours 5–11 → "Good Morning"
- hours 12–17 → "Good Afternoon"
- hours 18–21 → "Good Evening"
- hours 22–23 and 0–4 → "Good Night"

**Validates: Requirements 1.3, 1.4, 1.5, 1.6**

---

### Property 4: Greeting format includes name when name is present

*For any* non-empty greeting string and any non-empty name string, `renderGreeting(greeting, name)` SHALL return a string of the form `"[greeting], [name]!"`.

**Validates: Requirements 2.3**

---

### Property 5: Name persistence round-trip

*For any* valid name string (1–50 characters), calling `Greeting.saveName(name)` followed by `Storage.load('tld_name')` SHALL return the same trimmed name string.

**Validates: Requirements 2.2**

---

### Property 6: Timer format produces valid MM:SS output

*For any* integer number of seconds in [0, 7200], `formatTime(seconds)` SHALL return a string matching `MM:SS` where MM is a zero-padded minute value and SS is a zero-padded seconds value in [00, 59], and the total represented time equals the input seconds.

**Validates: Requirements 3.1**

---

### Property 7: Timer reset always restores configured duration

*For any* configured duration in [1, 120] minutes, calling `Timer.reset()` SHALL set `remainingSeconds` to exactly `configuredMinutes × 60`, regardless of how much time has elapsed.

**Validates: Requirements 3.4**

---

### Property 8: Duration validation accepts exactly the range [1, 120]

*For any* integer input `n`, `Timer.setDuration(n)` SHALL accept the input (update `configuredMinutes` and persist) if and only if `n` is in [1, 120]. For any `n` outside this range, the function SHALL reject the input, leave `configuredMinutes` unchanged, and produce a validation error message.

**Validates: Requirements 4.1, 4.6**

---

### Property 9: Whitespace-only task text is always rejected

*For any* string composed entirely of whitespace characters (spaces, tabs, newlines), `Tasks.addTask(text)` SHALL reject the input and leave the task array unchanged.

**Validates: Requirements 5.9**

---

### Property 10: Task completion toggle is a round-trip

*For any* task in the task list, calling `Tasks.toggleComplete(id)` twice SHALL leave the task's `completed` field equal to its original value.

**Validates: Requirements 5.3, 5.4**

---

### Property 11: Duplicate task detection is case-insensitive and whitespace-agnostic

*For any* existing task with text `T`, submitting a new task whose text, after trimming whitespace and lowercasing, equals `T.trim().toLowerCase()` SHALL be rejected by `Tasks.addTask` and by `Tasks.editTask` (when editing a different task). The task array SHALL remain unchanged.

**Validates: Requirements 6.1, 6.3**

---

### Property 12: Sort never mutates the stored task array

*For any* task array and any sort option from the five defined options, calling `Tasks.setSort(option)` followed by `Tasks.getSortedTasks()` SHALL leave the underlying `tasks` array (as persisted in `localStorage`) in its original insertion order.

**Validates: Requirements 7.2**

---

### Property 13: Invalid quick-link input is always rejected

*For any* input where the label is empty or the URL is not parseable by the `URL` constructor, `QuickLinks.addLink(label, url)` SHALL reject the input and leave the links array unchanged.

**Validates: Requirements 8.6**

---

### Property 14: localStorage persistence round-trip for all data categories

*For any* valid value of each data category (tasks array, links array, timer duration, user name, sort option, theme), saving via the appropriate module method and then loading via `Storage.load(key)` SHALL return a value deeply equal to the saved value.

**Validates: Requirements 2.2, 4.3, 5.7, 7.3, 8.4, 9.4, 10.2**

---

## Error Handling

### localStorage Unavailability

`Storage.save` and `Storage.load` are each wrapped in `try/catch`:

```js
Storage = {
  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      App.showWarning('Could not save data. Changes may not persist.');
    }
  },
  load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : null;
    } catch (e) {
      App.showWarning('Could not load saved data. Using defaults.');
      return null;
    }
  }
}
```

The warning banner (`#warning-banner`) is a fixed-position, dismissible element that does not block interaction with the rest of the page.

### Input Validation Errors

Each widget displays inline error messages in a dedicated `<span role="alert">` element adjacent to the relevant input. Errors are cleared when the user modifies the input or successfully submits.

| Widget      | Error element ID   | Triggers                                              |
|-------------|--------------------|-------------------------------------------------------|
| Timer       | `#duration-error`  | Duration outside [1, 120]                             |
| Tasks       | `#task-error`      | Empty/whitespace text; duplicate task                 |
| Quick Links | `#link-error`      | Empty label; invalid URL                              |

### Timer Completion Notification

When the countdown reaches zero, the app attempts `Notification.requestPermission()` and fires a browser notification if granted. As a fallback (permission denied or API unavailable), it plays a short audio beep using the Web Audio API:

```js
function beep() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  osc.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}
```

---

## Testing Strategy

### Overview

The testing approach uses two complementary layers:

1. **Unit / example-based tests** — verify specific behaviors, edge cases, and error conditions with concrete inputs
2. **Property-based tests** — verify universal properties across hundreds of generated inputs

For a vanilla JS project with no build tooling, tests can be run directly in the browser using a lightweight test runner (e.g., [fast-check](https://fast-check.io/) loaded via CDN for property tests, and plain assertion functions for unit tests), or via Node.js with `--experimental-vm-modules` if a test file is desired.

**Recommended PBT library**: [fast-check](https://fast-check.io/) — works in both browser and Node.js, no build step required when loaded via CDN or ESM import.

### Unit Tests

Focus on:
- Specific examples that demonstrate correct behavior (e.g., timer at exactly 00:00 stops)
- Integration points between modules (e.g., `Tasks.init()` correctly reads from `Storage`)
- Edge cases not covered by property generators (e.g., name exactly 50 characters, duration exactly 1 and 120)
- UI state checks (e.g., button enabled/disabled states after start/stop)
- Default value initialization (e.g., 25-minute default, light mode default)

### Property-Based Tests

Each property test MUST:
- Run a minimum of **100 iterations**
- Be tagged with a comment referencing the design property:
  `// Feature: todo-life-dashboard, Property N: <property_text>`
- Use `fast-check` arbitraries to generate inputs

| Property | fast-check Arbitraries                                                                 |
|----------|----------------------------------------------------------------------------------------|
| 1        | `fc.date()` → extract hours/minutes                                                    |
| 2        | `fc.date()`                                                                            |
| 3        | `fc.integer({ min: 0, max: 23 })`                                                      |
| 4        | `fc.string({ minLength: 1 }), fc.string({ minLength: 1, maxLength: 50 })`             |
| 5        | `fc.string({ minLength: 1, maxLength: 50 })`                                           |
| 6        | `fc.integer({ min: 0, max: 7200 })`                                                    |
| 7        | `fc.integer({ min: 1, max: 120 })`                                                     |
| 8        | `fc.integer()` (full integer range to test boundary)                                   |
| 9        | `fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'))`                                  |
| 10       | `fc.record({ id: fc.uuid(), text: fc.string(), completed: fc.boolean() })`             |
| 11       | `fc.string({ minLength: 1 })` with case/whitespace mutations                           |
| 12       | `fc.array(taskArbitrary), fc.constantFrom('default','az','za','completed-last','completed-first')` |
| 13       | `fc.oneof(fc.constant(''), fc.string())` for label; `fc.string()` for URL              |
| 14       | Arbitraries for each data type per category                                            |

### Test File Structure

```
tests/
  unit/
    greeting.test.js
    timer.test.js
    tasks.test.js
    quicklinks.test.js
    storage.test.js
  property/
    greeting.property.js
    timer.property.js
    tasks.property.js
    quicklinks.property.js
    storage.property.js
  index.html   ← loads all test files via <script> tags for in-browser execution
```

### Coverage Goals

- All 14 correctness properties covered by property-based tests
- All error paths covered by unit tests
- All default-value initialization paths covered by unit tests
- All five sort options verified to produce correct ordering
