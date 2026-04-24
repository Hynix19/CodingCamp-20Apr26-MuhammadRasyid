# Requirements Document

## Introduction

The To-Do List Life Dashboard is a client-side web application that helps users organize their day from a single page. It displays the current time and date with a personalized greeting, a Pomodoro-style focus timer, a task management list, and a quick-links panel for favorite websites. All data is persisted in the browser's Local Storage with no backend required. The application must work as a standalone web page or browser homepage in all modern browsers.

The four chosen optional challenges are: **Custom name in greeting**, **Change Pomodoro time**, **Sort tasks**, and **Light/Dark mode**. The **Prevent duplicate tasks** challenge is also implemented as a data-integrity safeguard.

---

## Glossary

- **Dashboard**: The single HTML page that contains all widgets.
- **Greeting_Widget**: The section that displays the current time, date, and a personalized greeting message.
- **Timer**: The Pomodoro-style focus countdown timer widget.
- **Task_List**: The widget that manages the user's to-do items.
- **Task**: A single to-do item with a text label and a completion state.
- **Quick_Links**: The widget that displays user-defined shortcut buttons to external URLs.
- **Link**: A single quick-link entry consisting of a label and a URL.
- **Local_Storage**: The browser's `localStorage` API used for all client-side data persistence.
- **Session**: A single countdown run of the Timer from its configured duration to zero.
- **Duplicate_Task**: A Task whose text, after trimming whitespace and ignoring letter case, matches an existing Task in the Task_List.

---

## Requirements

### Requirement 1: Greeting Widget

**User Story:** As a user, I want to see the current time, date, and a greeting based on the time of day, so that I have an at-a-glance overview when I open the Dashboard.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current local time in HH:MM format, updated every second.
2. THE Greeting_Widget SHALL display the current local date in a human-readable format (e.g., "Monday, 14 July 2025").
3. WHEN the local hour is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
4. WHEN the local hour is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
5. WHEN the local hour is between 18:00 and 21:59, THE Greeting_Widget SHALL display the greeting "Good Evening".
6. WHEN the local hour is between 22:00 and 04:59, THE Greeting_Widget SHALL display the greeting "Good Night".

---

### Requirement 2: Custom Name in Greeting

**User Story:** As a user, I want to set my name so that the greeting addresses me personally.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL provide an input field that allows the user to enter a display name of up to 50 characters.
2. WHEN the user saves a name, THE Dashboard SHALL persist the name in Local_Storage under a defined key.
3. WHEN the Dashboard loads and a saved name exists in Local_Storage, THE Greeting_Widget SHALL display the greeting in the format "[Greeting], [Name]!" (e.g., "Good Morning, Alex!").
4. WHEN the Dashboard loads and no saved name exists in Local_Storage, THE Greeting_Widget SHALL display the greeting without a name (e.g., "Good Morning!").
5. WHEN the user clears the saved name, THE Dashboard SHALL remove the name entry from Local_Storage and THE Greeting_Widget SHALL revert to the nameless greeting format.

---

### Requirement 3: Focus Timer

**User Story:** As a user, I want a countdown timer so that I can work in focused sessions.

#### Acceptance Criteria

1. THE Timer SHALL display the remaining time in MM:SS format.
2. WHEN the user presses the Start button and the Timer is not running, THE Timer SHALL begin counting down from the configured duration in one-second intervals.
3. WHEN the user presses the Stop button and the Timer is running, THE Timer SHALL pause the countdown and retain the remaining time.
4. WHEN the user presses the Reset button, THE Timer SHALL stop any active countdown and restore the display to the configured duration.
5. WHEN the Timer countdown reaches 00:00, THE Timer SHALL stop automatically and THE Dashboard SHALL notify the user that the session has ended (e.g., via a browser notification or an audible alert).
6. WHILE the Timer is running, THE Dashboard SHALL disable the Start button and enable the Stop button.
7. WHILE the Timer is not running, THE Dashboard SHALL enable the Start button and disable the Stop button.

---

### Requirement 4: Change Pomodoro Time

**User Story:** As a user, I want to configure the timer duration so that I can adapt the session length to my workflow.

#### Acceptance Criteria

1. THE Timer SHALL provide an input control that accepts a duration value in whole minutes between 1 and 120 inclusive.
2. WHEN the user sets a new duration and the Timer is not running, THE Timer SHALL update the configured duration and reset the display to the new value.
3. WHEN the user saves a custom duration, THE Dashboard SHALL persist the value in Local_Storage under a defined key.
4. WHEN the Dashboard loads and a saved duration exists in Local_Storage, THE Timer SHALL initialize with that saved duration.
5. WHEN the Dashboard loads and no saved duration exists in Local_Storage, THE Timer SHALL initialize with a default duration of 25 minutes.
6. IF the user enters a duration outside the range of 1 to 120, THEN THE Timer SHALL reject the input and display an inline validation message.

---

### Requirement 5: Task Management

**User Story:** As a user, I want to add, edit, complete, and delete tasks so that I can track what I need to do today.

#### Acceptance Criteria

1. THE Task_List SHALL provide a text input field and an Add button for creating new Tasks.
2. WHEN the user submits a non-empty task text, THE Task_List SHALL add a new Task with a completion state of false and display it in the list.
3. WHEN the user marks a Task as done, THE Task_List SHALL update that Task's completion state to true and apply a visual distinction (e.g., strikethrough text).
4. WHEN the user marks a completed Task as undone, THE Task_List SHALL update that Task's completion state to false and remove the visual distinction.
5. WHEN the user activates the edit action on a Task, THE Task_List SHALL allow the user to modify the Task's text inline and save the change.
6. WHEN the user deletes a Task, THE Task_List SHALL remove that Task from the list.
7. WHEN any Task is added, edited, completed, or deleted, THE Dashboard SHALL persist the full Task_List state to Local_Storage.
8. WHEN the Dashboard loads, THE Task_List SHALL restore all Tasks from Local_Storage, preserving each Task's text and completion state.
9. IF the user submits an empty or whitespace-only task text, THEN THE Task_List SHALL reject the input and not add a Task.

---

### Requirement 6: Prevent Duplicate Tasks

**User Story:** As a user, I want the system to prevent me from adding the same task twice so that my list stays clean and unambiguous.

#### Acceptance Criteria

1. WHEN the user submits a new task text that matches an existing Task's text (case-insensitive, whitespace-trimmed), THE Task_List SHALL reject the input.
2. WHEN a duplicate submission is rejected, THE Task_List SHALL display an inline message informing the user that the task already exists.
3. WHEN the user edits a Task and saves a text that matches another existing Task's text (case-insensitive, whitespace-trimmed), THE Task_List SHALL reject the edit and display an inline message.

---

### Requirement 7: Sort Tasks

**User Story:** As a user, I want to sort my task list so that I can prioritize or review tasks in a preferred order.

#### Acceptance Criteria

1. THE Task_List SHALL provide a sort control with at least the following options: "Default" (insertion order), "A–Z" (alphabetical ascending), "Z–A" (alphabetical descending), "Completed last", and "Completed first".
2. WHEN the user selects a sort option, THE Task_List SHALL reorder the displayed Tasks according to the selected option without modifying the underlying stored order.
3. WHEN the user saves a sort preference, THE Dashboard SHALL persist the selected sort option in Local_Storage.
4. WHEN the Dashboard loads and a saved sort preference exists in Local_Storage, THE Task_List SHALL apply that sort option on render.

---

### Requirement 8: Quick Links

**User Story:** As a user, I want to save and access my favorite website shortcuts so that I can navigate quickly from the Dashboard.

#### Acceptance Criteria

1. THE Quick_Links widget SHALL provide an input form that accepts a link label (up to 30 characters) and a valid URL.
2. WHEN the user adds a new Link, THE Quick_Links widget SHALL display it as a clickable button that opens the URL in a new browser tab.
3. WHEN the user deletes a Link, THE Quick_Links widget SHALL remove the button from the display.
4. WHEN any Link is added or deleted, THE Dashboard SHALL persist the full Quick_Links state to Local_Storage.
5. WHEN the Dashboard loads, THE Quick_Links widget SHALL restore all saved Links from Local_Storage.
6. IF the user submits a Link with an empty label or an invalid URL, THEN THE Quick_Links widget SHALL reject the input and display an inline validation message.

---

### Requirement 9: Light / Dark Mode

**User Story:** As a user, I want to toggle between light and dark color themes so that I can use the Dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a theme toggle control that allows the user to switch between light mode and dark mode.
2. WHEN the user selects light mode, THE Dashboard SHALL apply a light color scheme with dark text on a light background.
3. WHEN the user selects dark mode, THE Dashboard SHALL apply a dark color scheme with light text on a dark background.
4. WHEN the user changes the theme, THE Dashboard SHALL persist the selected theme preference in Local_Storage under a defined key.
5. WHEN the Dashboard loads and a saved theme preference exists in Local_Storage, THE Dashboard SHALL apply that saved theme.
6. WHEN the Dashboard loads and no saved theme preference exists in Local_Storage, THE Dashboard SHALL apply the light mode theme as the default.
7. THE Dashboard SHALL ensure that all text remains readable and all interactive elements remain clearly visible in both light and dark modes.

---

### Requirement 10: Data Persistence and Storage

**User Story:** As a user, I want my data to survive page refreshes so that I do not lose my tasks, links, or settings.

#### Acceptance Criteria

1. THE Dashboard SHALL store all persistent data exclusively in Local_Storage with no network requests.
2. THE Dashboard SHALL use distinct, namespaced Local_Storage keys for each data category (tasks, links, timer duration, user name, sort preference).
3. IF Local_Storage is unavailable or throws an error on read, THEN THE Dashboard SHALL initialize with default values and display a non-blocking warning to the user.
4. IF Local_Storage is unavailable or throws an error on write, THEN THE Dashboard SHALL display a non-blocking warning that data could not be saved.

---

### Requirement 11: Browser Compatibility and Performance

**User Story:** As a user, I want the Dashboard to load quickly and work reliably in any modern browser so that I can use it as my homepage.

#### Acceptance Criteria

1. THE Dashboard SHALL render correctly and be fully functional in the current stable releases of Chrome, Firefox, Edge, and Safari.
2. THE Dashboard SHALL consist of exactly one HTML file, one CSS file inside a `css/` directory, and one JavaScript file inside a `js/` directory.
3. THE Dashboard SHALL require no build step, no package manager, and no backend server to run.
4. WHEN the Dashboard page is loaded, THE Dashboard SHALL display all widgets and be interactive within 2 seconds on a standard broadband connection.
5. WHEN the user interacts with any widget (adding a task, clicking a link, starting the timer), THE Dashboard SHALL reflect the change in the UI within 100 milliseconds.
