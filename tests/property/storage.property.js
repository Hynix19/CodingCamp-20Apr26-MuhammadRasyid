// Property tests for Storage module
// Feature: todo-life-dashboard

const STORAGE_PROP_KEY = 'tld_prop_test_storage';

// Property 5: Name persistence round-trip
// Feature: todo-life-dashboard, Property 5: Name persistence round-trip
propertyTest('Property 5: Name persistence round-trip', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 50 }),
      (name) => {
        const originalName = Greeting.name;

        try {
          Greeting.saveName(name);
          const loaded = Storage.load('tld_name');
          const trimmed = name.trim();

          // If trimmed is empty, name should be cleared (null)
          if (trimmed.length === 0) {
            return loaded === null;
          }

          return loaded === trimmed;
        } finally {
          // Restore original state
          Greeting.name = originalName;
          if (originalName) {
            Storage.save('tld_name', originalName);
          } else {
            Storage.remove('tld_name');
          }
        }
      }
    ),
    { numRuns: 100 }
  );
});

// Property 14: localStorage persistence round-trip for all data categories
// Feature: todo-life-dashboard, Property 14: localStorage persistence round-trip for all data categories
propertyTest('Property 14: localStorage persistence round-trip for all data categories', () => {
  // Test with various data types that the app uses

  // String values (name, theme, sort)
  fc.assert(
    fc.property(
      fc.string(),
      (value) => {
        Storage.save(STORAGE_PROP_KEY, value);
        const loaded = Storage.load(STORAGE_PROP_KEY);
        Storage.remove(STORAGE_PROP_KEY);
        return loaded === value;
      }
    ),
    { numRuns: 100 }
  );

  // Number values (timer duration)
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 120 }),
      (value) => {
        Storage.save(STORAGE_PROP_KEY, value);
        const loaded = Storage.load(STORAGE_PROP_KEY);
        Storage.remove(STORAGE_PROP_KEY);
        return loaded === value;
      }
    ),
    { numRuns: 100 }
  );

  // Array of task objects
  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          id: fc.uuid(),
          text: fc.string({ minLength: 1 }),
          completed: fc.boolean(),
          createdAt: fc.integer({ min: 0 })
        }),
        { maxLength: 10 }
      ),
      (tasks) => {
        Storage.save(STORAGE_PROP_KEY, tasks);
        const loaded = Storage.load(STORAGE_PROP_KEY);
        Storage.remove(STORAGE_PROP_KEY);
        return JSON.stringify(loaded) === JSON.stringify(tasks);
      }
    ),
    { numRuns: 100 }
  );

  // Array of link objects
  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          id: fc.uuid(),
          label: fc.string({ minLength: 1, maxLength: 30 }),
          url: fc.string()
        }),
        { maxLength: 10 }
      ),
      (links) => {
        Storage.save(STORAGE_PROP_KEY, links);
        const loaded = Storage.load(STORAGE_PROP_KEY);
        Storage.remove(STORAGE_PROP_KEY);
        return JSON.stringify(loaded) === JSON.stringify(links);
      }
    ),
    { numRuns: 100 }
  );
});
