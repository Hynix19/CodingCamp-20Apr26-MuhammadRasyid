// Unit tests for Tasks module

function resetTasks() {
  Tasks.tasks = [];
  Tasks.sortOption = 'default';
}

test('addTask adds a valid task to the tasks array', () => {
  resetTasks();
  Tasks.addTask('Buy groceries');
  assert(Tasks.tasks.length === 1, `Expected 1 task but got ${Tasks.tasks.length}`);
  assert(Tasks.tasks[0].text === 'Buy groceries', `Expected "Buy groceries" but got "${Tasks.tasks[0].text}"`);
});

test('addTask sets completed to false by default', () => {
  resetTasks();
  Tasks.addTask('New task');
  assert(Tasks.tasks[0].completed === false, 'Expected completed to be false');
});

test('addTask assigns a unique id', () => {
  resetTasks();
  Tasks.addTask('Task A');
  Tasks.addTask('Task B');
  assert(Tasks.tasks[0].id !== Tasks.tasks[1].id, 'Expected unique IDs for each task');
});

test('addTask rejects empty string', () => {
  resetTasks();
  Tasks.addTask('');
  assert(Tasks.tasks.length === 0, `Expected 0 tasks but got ${Tasks.tasks.length}`);
});

test('addTask rejects whitespace-only string', () => {
  resetTasks();
  Tasks.addTask('   ');
  assert(Tasks.tasks.length === 0, `Expected 0 tasks but got ${Tasks.tasks.length}`);
});

test('addTask rejects duplicate task (exact match)', () => {
  resetTasks();
  Tasks.addTask('Buy milk');
  Tasks.addTask('Buy milk');
  assert(Tasks.tasks.length === 1, `Expected 1 task but got ${Tasks.tasks.length}`);
});

test('addTask rejects duplicate task (case-insensitive)', () => {
  resetTasks();
  Tasks.addTask('Buy milk');
  Tasks.addTask('BUY MILK');
  assert(Tasks.tasks.length === 1, `Expected 1 task but got ${Tasks.tasks.length}`);
});

test('deleteTask removes the task from the array', () => {
  resetTasks();
  Tasks.addTask('Task to delete');
  const id = Tasks.tasks[0].id;
  Tasks.deleteTask(id);
  assert(Tasks.tasks.length === 0, `Expected 0 tasks but got ${Tasks.tasks.length}`);
});

test('deleteTask does not affect other tasks', () => {
  resetTasks();
  Tasks.addTask('Keep this');
  Tasks.addTask('Delete this');
  const deleteId = Tasks.tasks[1].id;
  Tasks.deleteTask(deleteId);
  assert(Tasks.tasks.length === 1, `Expected 1 task but got ${Tasks.tasks.length}`);
  assert(Tasks.tasks[0].text === 'Keep this', `Expected "Keep this" but got "${Tasks.tasks[0].text}"`);
});

test('toggleComplete flips completed from false to true', () => {
  resetTasks();
  Tasks.addTask('Toggle me');
  const id = Tasks.tasks[0].id;
  Tasks.toggleComplete(id);
  assert(Tasks.tasks[0].completed === true, 'Expected completed to be true after toggle');
});

test('toggleComplete flips completed from true to false', () => {
  resetTasks();
  Tasks.addTask('Toggle me');
  const id = Tasks.tasks[0].id;
  Tasks.toggleComplete(id);
  Tasks.toggleComplete(id);
  assert(Tasks.tasks[0].completed === false, 'Expected completed to be false after double toggle');
});

test('isDuplicate returns true for exact match', () => {
  resetTasks();
  Tasks.addTask('Existing task');
  const result = Tasks.isDuplicate('Existing task', null);
  assert(result === true, 'Expected isDuplicate to return true');
});

test('isDuplicate returns true for case-insensitive match', () => {
  resetTasks();
  Tasks.addTask('Existing task');
  const result = Tasks.isDuplicate('EXISTING TASK', null);
  assert(result === true, 'Expected isDuplicate to return true for case-insensitive match');
});

test('isDuplicate returns false when no match', () => {
  resetTasks();
  Tasks.addTask('Task A');
  const result = Tasks.isDuplicate('Task B', null);
  assert(result === false, 'Expected isDuplicate to return false');
});

test('isDuplicate excludes the task with excludeId', () => {
  resetTasks();
  Tasks.addTask('My task');
  const id = Tasks.tasks[0].id;
  const result = Tasks.isDuplicate('My task', id);
  assert(result === false, 'Expected isDuplicate to return false when excluding own id');
});

test('getSortedTasks does not mutate the original tasks array', () => {
  resetTasks();
  Tasks.addTask('Banana');
  Tasks.addTask('Apple');
  Tasks.addTask('Cherry');
  const originalOrder = Tasks.tasks.map(t => t.text);
  Tasks.sortOption = 'az';
  Tasks.getSortedTasks();
  const afterOrder = Tasks.tasks.map(t => t.text);
  assert(
    JSON.stringify(originalOrder) === JSON.stringify(afterOrder),
    `Expected original order to be preserved but got ${JSON.stringify(afterOrder)}`
  );
});

test('getSortedTasks with "az" sorts alphabetically ascending', () => {
  resetTasks();
  Tasks.addTask('Banana');
  Tasks.addTask('Apple');
  Tasks.addTask('Cherry');
  Tasks.sortOption = 'az';
  const sorted = Tasks.getSortedTasks();
  assert(sorted[0].text === 'Apple', `Expected "Apple" first but got "${sorted[0].text}"`);
  assert(sorted[1].text === 'Banana', `Expected "Banana" second but got "${sorted[1].text}"`);
  assert(sorted[2].text === 'Cherry', `Expected "Cherry" third but got "${sorted[2].text}"`);
});

test('getSortedTasks with "za" sorts alphabetically descending', () => {
  resetTasks();
  Tasks.addTask('Apple');
  Tasks.addTask('Banana');
  Tasks.addTask('Cherry');
  Tasks.sortOption = 'za';
  const sorted = Tasks.getSortedTasks();
  assert(sorted[0].text === 'Cherry', `Expected "Cherry" first but got "${sorted[0].text}"`);
  assert(sorted[2].text === 'Apple', `Expected "Apple" last but got "${sorted[2].text}"`);
});

test('getSortedTasks with "completed-last" puts incomplete tasks first', () => {
  resetTasks();
  Tasks.addTask('Task A');
  Tasks.addTask('Task B');
  Tasks.toggleComplete(Tasks.tasks[0].id); // complete Task A
  Tasks.sortOption = 'completed-last';
  const sorted = Tasks.getSortedTasks();
  assert(sorted[0].completed === false, 'Expected incomplete task first');
  assert(sorted[1].completed === true, 'Expected completed task last');
});

test('getSortedTasks with "completed-first" puts completed tasks first', () => {
  resetTasks();
  Tasks.addTask('Task A');
  Tasks.addTask('Task B');
  Tasks.toggleComplete(Tasks.tasks[1].id); // complete Task B
  Tasks.sortOption = 'completed-first';
  const sorted = Tasks.getSortedTasks();
  assert(sorted[0].completed === true, 'Expected completed task first');
  assert(sorted[1].completed === false, 'Expected incomplete task last');
});

test('editTask updates task text', () => {
  resetTasks();
  Tasks.addTask('Old text');
  const id = Tasks.tasks[0].id;
  // Create a minimal inline error element
  const inlineError = document.createElement('span');
  Tasks.editTask(id, 'New text', inlineError);
  assert(Tasks.tasks[0].text === 'New text', `Expected "New text" but got "${Tasks.tasks[0].text}"`);
});

test('editTask rejects empty text', () => {
  resetTasks();
  Tasks.addTask('Original');
  const id = Tasks.tasks[0].id;
  const inlineError = document.createElement('span');
  Tasks.editTask(id, '', inlineError);
  assert(Tasks.tasks[0].text === 'Original', `Expected "Original" but got "${Tasks.tasks[0].text}"`);
});

test('editTask rejects duplicate text (excluding self)', () => {
  resetTasks();
  Tasks.addTask('Task One');
  Tasks.addTask('Task Two');
  const id = Tasks.tasks[1].id;
  const inlineError = document.createElement('span');
  Tasks.editTask(id, 'Task One', inlineError);
  assert(Tasks.tasks[1].text === 'Task Two', `Expected "Task Two" but got "${Tasks.tasks[1].text}"`);
});
