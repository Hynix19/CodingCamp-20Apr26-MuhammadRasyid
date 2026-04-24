# Implementation Plan: To-Do Life Dashboard

## Overview

Build a single-page, vanilla HTML/CSS/JS dashboard with no build tools or external dependencies. Implementation proceeds module-by-module, each building on the shared scaffold and Storage foundation established in the first tasks. All state is persisted in `localStorage` via a central `Storage` module.

## Tasks

- [x] 1. Create project scaffold
  - Create `index.html` at the repository root with the full HTML structure defined in the design: `<header>`, `<main>` (two-column grid), `<footer>`, warning banner, and all widget sections with their IDs and ARIA attributes
  - Create `css/style.css` as an empty file (populated in task 2)
  - Create `js/app.js` as an empty file (populated in task 3 onward)
  - Wire `<link rel="stylesheet" href="css/style.css">` and `<script src="js/app.js">` in `index.html`
  - _Requirements: 11.2, 11.3_

- [x] 2. Implement CSS custom properties and theming styles
  - [x] 2.1 Define CSS custom properties for light mode and dark mode
    - Add `:root` block with all `--color-*` and `--shadow` variables for light mode
    - Add `[data-theme="dark"]` override block with dark-mode variable values
    - _Requirements: 9.2, 9.3, 9.7_
  - [x] 2.2 Implement two-column grid layout and base widget styles
    - Style `.dashboard-header` (full-width, gradient background, flex layout)
    - Style `.dashboard-main` with `grid-template-columns: 1fr 2fr` and gap/padding
    - Style `.dashboard-footer` with padding and max-width
    - Style `.widget` cards (background, border-radius, padding, shadow)
    - Style `.error-msg`, `.warning-banner`, `.hidden` utility class
    - Style task items including `.task-item--done` (strikethrough, muted color)
    - Style timer display, buttons, and input controls
    - Style quick-links buttons
    - _Requirements: 11.1, 9.7_
  - [x] 2.3 Implement responsive breakpoint
    - Add `@media (max-width: 768px)` rule that sets `grid-template-columns: 1fr`
    - _Requirements: 11.1_

- [x] 3. Implement Storage module
  - [x] 3.1 Implement `Storage.save`, `Storage.load`, and `Storage.remove`
    - Write `Storage` object in `js/app.js` with `save(key, value)`, `load(key)`, and `remove(key)` methods
    - Wrap each method in `try/catch`; on error call `App.showWarning(message)` (stub `App.showWarning` as a no-op initially)
    - Use `tld_` prefix for all keys as defined in the design key table
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  - [ ]* 3.2 Write property test for localStorage persistence round-trip (Property 14)
    - **Property 14: localStorage persistence round-trip for all data categories**
    - **Validates: Requirements 2.2, 4.3, 5.7, 7.3, 8.4, 9.4, 10.2**
    - Create `tests/property/storage.property.js`; use `fast-check` arbitraries for each data type; verify `Storage.load(key)` returns a deeply equal value after `Storage.save(key, value)`
  - [ ]* 3.3 Write unit tests for Storage error handling
    - Create `tests/unit/storage.test.js`
    - Test that `Storage.load` returns `null` and calls `App.showWarning` when `localStorage.getItem` throws
    - Test that `Storage.save` calls `App.showWarning` when `localStorage.setItem` throws
    - _Requirements: 10.3, 10.4_

- [x] 4. Implement Theme module
  - [x] 4.1 Implement `Theme.init`, `Theme.apply`, `Theme.toggle`, and `Theme.current`
    - Write `Theme` object with all four methods
    - `Theme.init()`: call `Storage.load('tld_theme')`; default to `"light"` if null; call `Theme.apply(mode)`; wire `#theme-toggle` click → `Theme.toggle()`
    - `Theme.apply(mode)`: set `data-theme` attribute on `<html>`; update toggle button icon/label (🌙 for light mode, ☀️ for dark mode)
    - `Theme.toggle()`: flip current mode; call `Theme.apply`; call `Storage.save('tld_theme', mode)`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 5. Implement Greeting module (clock, date, greeting text)
  - [x] 5.1 Implement clock, date display, and greeting text logic
    - Write `Greeting` object with `init()`, `startClock()`, `updateClock()`, `getGreetingText()`, and `renderGreeting()`
    - `updateClock()`: format current time as HH:MM (zero-padded) and update `#time`; format date as "Weekday, DD Month YYYY" and update `#date`
    - `getGreetingText()`: return correct greeting string based on hour boundaries from the design
    - `renderGreeting()`: compose "[Greeting], [Name]!" or "[Greeting]!" and update `#greeting-text`
    - `startClock()`: call `setInterval(updateClock, 1000)` and call `updateClock()` immediately
    - `init()`: load saved name from `Storage.load('tld_name')`; call `startClock()`; call `renderGreeting()`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.3, 2.4_
  - [ ]* 5.2 Write property test for time formatting (Property 1)
    - **Property 1: Time formatting produces valid HH:MM output**
    - **Validates: Requirements 1.1**
    - Create `tests/property/greeting.property.js`; use `fc.date()` to generate arbitrary dates; assert output matches `/^[0-2]\d:[0-5]\d$/` and hour is in [00, 23]
  - [ ]* 5.3 Write property test for date formatting (Property 2)
    - **Property 2: Date formatting produces human-readable output**
    - **Validates: Requirements 1.2**
    - Use `fc.date()`; assert output contains a day-of-week name, numeric day, month name, and four-digit year
  - [ ]* 5.4 Write property test for greeting text correctness (Property 3)
    - **Property 3: Greeting text is correct for every hour of the day**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
    - Use `fc.integer({ min: 0, max: 23 })`; assert `getGreetingText(hour)` returns the correct greeting for each partition
  - [ ]* 5.5 Write property test for greeting format with name (Property 4)
    - **Property 4: Greeting format includes name when name is present**
    - **Validates: Requirements 2.3**
    - Use `fc.string({ minLength: 1 })` for greeting and `fc.string({ minLength: 1, maxLength: 50 })` for name; assert output equals `"[greeting], [name]!"`

- [x] 6. Implement custom name editing in Greeting module
  - [x] 6.1 Implement `Greeting.openNameEditor`, `Greeting.saveName`, and `Greeting.clearName`
    - `openNameEditor()`: show `#name-editor`, hide `#edit-name-btn`, populate `#name-input` with current name; wire `#name-save` → `saveName`, `#name-cancel` → close editor
    - `saveName(name)`: trim input; validate ≤50 chars (show inline error if exceeded); call `Storage.save('tld_name', trimmedName)`; call `renderGreeting()`; close editor
    - `clearName()`: call `Storage.remove('tld_name')`; clear in-memory name; call `renderGreeting()`
    - Wire `#edit-name-btn` click → `openNameEditor()`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ]* 6.2 Write property test for name persistence round-trip (Property 5)
    - **Property 5: Name persistence round-trip**
    - **Validates: Requirements 2.2**
    - Use `fc.string({ minLength: 1, maxLength: 50 })`; call `Greeting.saveName(name)` then `Storage.load('tld_name')`; assert returned value equals trimmed name

- [x] 7. Implement Timer module
  - [x] 7.1 Implement timer core: `init`, `render`, `start`, `stop`, `reset`, `tick`, `updateButtonStates`
    - Write `Timer` object with all methods and in-memory state (`configuredMinutes`, `remainingSeconds`, `intervalId`, `isRunning`)
    - `init()`: load `Storage.load('tld_timer_duration')`; default to 25 if null; set `configuredMinutes` and `remainingSeconds`; call `render()`; call `updateButtonStates()`; wire button click handlers
    - `render()`: format `remainingSeconds` as MM:SS (zero-padded) and update `#timer-display`
    - `start()`: set `isRunning = true`; call `setInterval(tick, 1000)`; call `updateButtonStates()`
    - `stop()`: call `clearInterval`; set `isRunning = false`; call `updateButtonStates()`
    - `reset()`: call `stop()`; restore `remainingSeconds = configuredMinutes * 60`; call `render()`
    - `tick()`: decrement `remainingSeconds`; call `render()`; if `remainingSeconds === 0` call `onComplete()`
    - `updateButtonStates()`: disable `#start-btn` and enable `#stop-btn` when running; reverse when not running
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7_
  - [ ]* 7.2 Write property test for timer format (Property 6)
    - **Property 6: Timer format produces valid MM:SS output**
    - **Validates: Requirements 3.1**
    - Create `tests/property/timer.property.js`; use `fc.integer({ min: 0, max: 7200 })`; assert `formatTime(seconds)` matches `/^\d{2}:[0-5]\d$/` and total seconds represented equals input
  - [ ]* 7.3 Write property test for timer reset (Property 7)
    - **Property 7: Timer reset always restores configured duration**
    - **Validates: Requirements 3.4**
    - Use `fc.integer({ min: 1, max: 120 })`; set `configuredMinutes`, call `Timer.reset()`; assert `remainingSeconds === configuredMinutes * 60`
  - [ ]* 7.4 Write unit tests for timer button states
    - Create `tests/unit/timer.test.js`
    - Test that `#start-btn` is disabled and `#stop-btn` is enabled after `Timer.start()`
    - Test that `#start-btn` is enabled and `#stop-btn` is disabled after `Timer.stop()`
    - Test that timer stops automatically when `remainingSeconds` reaches 0
    - _Requirements: 3.5, 3.6, 3.7_

- [x] 8. Implement timer duration configuration and completion notification
  - [x] 8.1 Implement `Timer.setDuration` with validation and persistence
    - `setDuration(minutes)`: parse input as integer; if outside [1, 120] show error in `#duration-error` and return; otherwise clear error, update `configuredMinutes`, persist to `Storage.save('tld_timer_duration', minutes)`, call `reset()`
    - Wire `#set-duration-btn` click → read `#duration-input` value → call `setDuration()`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [ ]* 8.2 Write property test for duration validation (Property 8)
    - **Property 8: Duration validation accepts exactly the range [1, 120]**
    - **Validates: Requirements 4.1, 4.6**
    - Use `fc.integer()` (full range); assert `setDuration(n)` accepts and persists when `n` is in [1, 120], and rejects (leaves `configuredMinutes` unchanged, shows error) for all other integers
  - [x] 8.3 Implement `Timer.onComplete` with Notification API and Web Audio fallback
    - `onComplete()`: call `stop()`; attempt `Notification.requestPermission()` and fire a browser notification if granted; as fallback use Web Audio API `beep()` function from the design
    - _Requirements: 3.5_
  - [ ]* 8.4 Write unit tests for timer completion
    - Test that `onComplete()` calls `stop()` (timer is no longer running after completion)
    - Test that `beep()` creates an `AudioContext` and connects an oscillator (mock Web Audio API)
    - _Requirements: 3.5_

- [x] 9. Checkpoint — Ensure Storage, Theme, Greeting, and Timer work end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement Tasks module — core CRUD and persistence
  - [x] 10.1 Implement `Tasks.init`, `Tasks.addTask`, `Tasks.deleteTask`, `Tasks.toggleComplete`, `Tasks.persist`, and `Tasks.render`/`Tasks.renderTask`
    - Write `Tasks` object with in-memory `tasks` array and `sortOption` string
    - `init()`: load `Storage.load('tld_tasks')` (default `[]`) and `Storage.load('tld_sort')` (default `"default"`); call `render()`; wire `#add-task-btn` click and `#task-input` Enter keypress → `addTask()`
    - `addTask(text)`: trim text; reject if empty/whitespace (show `#task-error`); reject if duplicate (show `#task-error`); push `{ id, text, completed: false, createdAt: Date.now() }`; call `persist()`; call `render()`; clear input and error
    - `deleteTask(id)`: filter out task by id; call `persist()`; call `render()`
    - `toggleComplete(id)`: flip `completed` flag; call `persist()`; call `render()`
    - `persist()`: call `Storage.save('tld_tasks', tasks)`
    - `renderTask(task)`: build `<li>` with checkbox, label (with `.task-item--done` class when completed), edit button, delete button; wire event handlers
    - `render()`: clear `#task-list`; call `getSortedTasks()` and append each `renderTask(task)` result
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 5.7, 5.8, 5.9_
  - [ ]* 10.2 Write property test for whitespace-only task rejection (Property 9)
    - **Property 9: Whitespace-only task text is always rejected**
    - **Validates: Requirements 5.9**
    - Create `tests/property/tasks.property.js`; use `fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'))`; assert `Tasks.addTask(text)` leaves the tasks array unchanged
  - [ ]* 10.3 Write property test for completion toggle round-trip (Property 10)
    - **Property 10: Task completion toggle is a round-trip**
    - **Validates: Requirements 5.3, 5.4**
    - Use `fc.record({ id: fc.uuid(), text: fc.string(), completed: fc.boolean() })`; add task to list; call `toggleComplete` twice; assert `completed` equals original value
  - [ ]* 10.4 Write unit tests for task CRUD
    - Create `tests/unit/tasks.test.js`
    - Test that adding a valid task appends it to the list and persists
    - Test that deleting a task removes it from the list and persists
    - Test that completing a task applies `.task-item--done` class
    - Test that `Tasks.init()` restores tasks from Storage with correct text and completion state
    - _Requirements: 5.2, 5.3, 5.6, 5.7, 5.8_

- [x] 11. Implement Tasks module — inline editing
  - [x] 11.1 Implement `Tasks.editTask` with inline editing UI
    - `editTask(id, newText)`: trim text; reject if empty (show inline error on the task element); reject if duplicate excluding self (show inline error); update task text; call `persist()`; call `render()`
    - In `renderTask`: wire edit button click to replace label with `<input>` pre-filled with current text; wire save (Enter / save button) → `editTask(id, newText)`; wire cancel → `render()`
    - _Requirements: 5.5, 5.7_
  - [ ]* 11.2 Write unit tests for inline editing
    - Test that editing a task updates its text and persists
    - Test that cancelling edit restores the original label without changes
    - _Requirements: 5.5_

- [x] 12. Implement duplicate task detection
  - [x] 12.1 Implement `Tasks.isDuplicate` and wire into `addTask` and `editTask`
    - `isDuplicate(text, excludeId)`: compare `text.trim().toLowerCase()` against all tasks except the one with `excludeId`; return `true` if a match is found
    - Ensure `addTask` calls `isDuplicate(text, null)` and shows `#task-error` with "Task already exists" on match
    - Ensure `editTask` calls `isDuplicate(newText, id)` and shows inline error on match
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ]* 12.2 Write property test for duplicate detection (Property 11)
    - **Property 11: Duplicate task detection is case-insensitive and whitespace-agnostic**
    - **Validates: Requirements 6.1, 6.3**
    - Use `fc.string({ minLength: 1 })`; add a task with text `T`; attempt to add variants with different casing and surrounding whitespace; assert all are rejected and tasks array length is unchanged

- [x] 13. Implement task sorting
  - [x] 13.1 Implement `Tasks.setSort` and `Tasks.getSortedTasks`
    - `setSort(option)`: update `sortOption`; call `Storage.save('tld_sort', option)`; call `render()`
    - `getSortedTasks()`: return a shallow copy of `tasks` sorted per `sortOption` using the five sort strategies from the design (default = `createdAt` order, az/za = `localeCompare`, completed-last/first = completion flag then `createdAt`)
    - Wire `#sort-select` change event → `Tasks.setSort(value)`; on `init()` set `#sort-select` value to loaded sort preference
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ]* 13.2 Write property test for sort immutability (Property 12)
    - **Property 12: Sort never mutates the stored task array**
    - **Validates: Requirements 7.2**
    - Use `fc.array(taskArbitrary)` and `fc.constantFrom('default','az','za','completed-last','completed-first')`; call `setSort(option)` then `getSortedTasks()`; assert the underlying `tasks` array order is unchanged (compare `createdAt` sequence)
  - [ ]* 13.3 Write unit tests for all five sort options
    - Create concrete task arrays and verify each sort option produces the correct ordering
    - _Requirements: 7.1, 7.2_

- [x] 14. Implement Quick Links module
  - [x] 14.1 Implement `QuickLinks.init`, `QuickLinks.addLink`, `QuickLinks.deleteLink`, `QuickLinks.validateUrl`, `QuickLinks.render`, and `QuickLinks.persist`
    - Write `QuickLinks` object with in-memory `links` array
    - `init()`: load `Storage.load('tld_links')` (default `[]`); call `render()`; wire `#add-link-btn` click → `addLink()`
    - `addLink(label, url)`: trim label; reject if empty or label > 30 chars (show `#link-error`); reject if `validateUrl(url)` returns false (show `#link-error`); push `{ id, label, url }`; call `persist()`; call `render()`; clear inputs and error
    - `validateUrl(url)`: attempt `new URL(url)`; return `true` if no exception, `false` otherwise
    - `deleteLink(id)`: filter out by id; call `persist()`; call `render()`
    - `render()`: clear `#links-container`; for each link create a `<button>` that opens `url` in a new tab on click, plus a delete button
    - `persist()`: call `Storage.save('tld_links', links)`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  - [ ]* 14.2 Write property test for invalid quick-link rejection (Property 13)
    - **Property 13: Invalid quick-link input is always rejected**
    - **Validates: Requirements 8.6**
    - Create `tests/property/quicklinks.property.js`; use `fc.oneof(fc.constant(''), fc.string())` for label and `fc.string()` for URL; assert that inputs where label is empty or URL is not parseable by `URL` constructor leave the links array unchanged
  - [ ]* 14.3 Write unit tests for Quick Links
    - Create `tests/unit/quicklinks.test.js`
    - Test that adding a valid link appends it and persists
    - Test that deleting a link removes it and persists
    - Test that `init()` restores links from Storage
    - Test that link buttons open the correct URL in a new tab (`target="_blank"`)
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

- [x] 15. Checkpoint — Ensure Tasks and Quick Links work end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Implement App bootstrap and localStorage error banner
  - [x] 16.1 Implement `App.init` and `App.showWarning`
    - Write `App` object with `init()` and `showWarning(message)`
    - `init()`: call `Theme.init()`, `Greeting.init()`, `Timer.init()`, `Tasks.init()`, `QuickLinks.init()` in order; wire `#warning-close` button click → hide `#warning-banner`
    - `showWarning(message)`: set `#warning-message` text content; remove `hidden` class from `#warning-banner`
    - Call `App.init()` at the bottom of `js/app.js` (after all module definitions)
    - _Requirements: 10.3, 10.4, 11.4, 11.5_
  - [ ]* 16.2 Write unit tests for App bootstrap
    - Test that `App.init()` calls `init()` on all five modules
    - Test that `App.showWarning(message)` makes the banner visible with the correct message
    - Test that clicking `#warning-close` hides the banner
    - _Requirements: 10.3, 10.4_

- [x] 17. Create test runner HTML and wire all test files
  - Create `tests/index.html` that loads `fast-check` via CDN and all unit/property test files via `<script>` tags
  - Ensure all property tests run a minimum of 100 iterations and include the required comment tag `// Feature: todo-life-dashboard, Property N: <property_text>`
  - _Requirements: NFR (testing strategy from design)_

- [x] 18. Final checkpoint — Full integration review
  - Ensure all tests pass, ask the user if questions arise.
  - Verify that all five sort options render correctly
  - Verify that theme persists across page reload
  - Verify that all inline error messages appear and clear correctly
  - Verify that the warning banner appears when localStorage is unavailable

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints at tasks 9, 15, and 18 provide incremental validation gates
- Property tests validate universal correctness properties (Properties 1–14 from the design)
- Unit tests validate specific examples, edge cases, and UI state
- The `Storage` module must be defined before all other modules in `js/app.js` since every module depends on it
- `App.showWarning` is referenced by `Storage` before `App` is fully defined — use a forward reference or define `App` first with a stub, then fill in after all modules are declared
