// Property tests for Tasks module
// Feature: todo-life-dashboard

// Property 8: Duration validation accepts exactly the range [1, 120]
// Feature: todo-life-dashboard, Property 8: Duration validation accepts exactly the range [1, 120]
propertyTest('Property 8: Duration validation accepts exactly the range [1, 120]', () => {
  fc.assert(
    fc.property(fc.integer(), (n) => {
      const originalMinutes = Timer.configuredMinutes;
      const originalRemaining = Timer.remainingSeconds;

      try {
        Timer.configuredMinutes = 25; // reset to known state
        Timer.setDuration(n);

        if (n >= 1 && n <= 120) {
          // Should have been accepted
          return Timer.configuredMinutes === n;
        } else {
          // Should have been rejected — configuredMinutes stays at 25
          return Timer.configuredMinutes === 25;
        }
      } finally {
        Timer.stop();
        Timer.configuredMinutes = originalMinutes;
        Timer.remainingSeconds = originalRemaining;
      }
    }),
    { numRuns: 100 }
  );
});

// Property 9: Whitespace-only task text is always rejected
// Feature: todo-life-dashboard, Property 9: Whitespace-only task text is always rejected
propertyTest('Property 9: Whitespace-only task text is always rejected', () => {
  fc.assert(
    fc.property(
      fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r')),
      (whitespaceText) => {
        const originalTasks = [...Tasks.tasks];
        Tasks.addTask(whitespaceText);
        const unchanged = Tasks.tasks.length === originalTasks.length;
        // Restore
        Tasks.tasks = originalTasks;
        return unchanged;
      }
    ),
    { numRuns: 100 }
  );
});

// Property 10: Task completion toggle is a round-trip
// Feature: todo-life-dashboard, Property 10: Task completion toggle is a round-trip
propertyTest('Property 10: Task completion toggle is a round-trip', () => {
  fc.assert(
    fc.property(
      fc.record({
        id: fc.uuid(),
        text: fc.string({ minLength: 1 }),
        completed: fc.boolean(),
        createdAt: fc.integer({ min: 0 })
      }),
      (taskData) => {
        const originalTasks = [...Tasks.tasks];
        const originalCompleted = taskData.completed;

        // Add the task directly
        Tasks.tasks = [{ ...taskData }];

        // Toggle twice
        Tasks.toggleComplete(taskData.id);
        Tasks.toggleComplete(taskData.id);

        const finalCompleted = Tasks.tasks[0].completed;

        // Restore
        Tasks.tasks = originalTasks;

        return finalCompleted === originalCompleted;
      }
    ),
    { numRuns: 100 }
  );
});

// Property 11: Duplicate task detection is case-insensitive and whitespace-agnostic
// Feature: todo-life-dashboard, Property 11: Duplicate task detection is case-insensitive and whitespace-agnostic
propertyTest('Property 11: Duplicate task detection is case-insensitive and whitespace-agnostic', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
      (baseText) => {
        const originalTasks = [...Tasks.tasks];
        Tasks.tasks = [];

        // Add the base task
        Tasks.addTask(baseText);
        const lengthAfterFirst = Tasks.tasks.length;

        // Try adding uppercase variant
        Tasks.addTask(baseText.toUpperCase());
        const lengthAfterUpper = Tasks.tasks.length;

        // Try adding with surrounding whitespace
        Tasks.addTask('  ' + baseText + '  ');
        const lengthAfterWhitespace = Tasks.tasks.length;

        // Restore
        Tasks.tasks = originalTasks;

        // All duplicates should be rejected — length should stay at 1
        return lengthAfterFirst === 1 &&
               lengthAfterUpper === 1 &&
               lengthAfterWhitespace === 1;
      }
    ),
    { numRuns: 100 }
  );
});

// Property 12: Sort never mutates the stored task array
// Feature: todo-life-dashboard, Property 12: Sort never mutates the stored task array
propertyTest('Property 12: Sort never mutates the stored task array', () => {
  const taskArbitrary = fc.record({
    id: fc.uuid(),
    text: fc.string({ minLength: 1 }),
    completed: fc.boolean(),
    createdAt: fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER })
  });

  fc.assert(
    fc.property(
      fc.array(taskArbitrary, { minLength: 0, maxLength: 10 }),
      fc.constantFrom('default', 'az', 'za', 'completed-last', 'completed-first'),
      (taskList, sortOption) => {
        const originalTasks = [...Tasks.tasks];
        const originalSort = Tasks.sortOption;

        // Set up state
        Tasks.tasks = taskList.map(t => ({ ...t }));
        const originalOrder = Tasks.tasks.map(t => t.createdAt);

        Tasks.sortOption = sortOption;
        Tasks.getSortedTasks();

        // Check that the underlying tasks array order is unchanged
        const afterOrder = Tasks.tasks.map(t => t.createdAt);
        const unchanged = JSON.stringify(originalOrder) === JSON.stringify(afterOrder);

        // Restore
        Tasks.tasks = originalTasks;
        Tasks.sortOption = originalSort;

        return unchanged;
      }
    ),
    { numRuns: 100 }
  );
});
