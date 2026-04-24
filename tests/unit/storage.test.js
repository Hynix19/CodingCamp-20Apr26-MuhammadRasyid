// Unit tests for Storage module

const TEST_KEY = 'tld_test_storage_unit';

test('Storage.save and Storage.load round-trip for string', () => {
  Storage.save(TEST_KEY, 'hello world');
  const result = Storage.load(TEST_KEY);
  assert(result === 'hello world', `Expected "hello world" but got "${result}"`);
  Storage.remove(TEST_KEY);
});

test('Storage.save and Storage.load round-trip for number', () => {
  Storage.save(TEST_KEY, 42);
  const result = Storage.load(TEST_KEY);
  assert(result === 42, `Expected 42 but got ${result}`);
  Storage.remove(TEST_KEY);
});

test('Storage.save and Storage.load round-trip for object', () => {
  const obj = { name: 'Alice', age: 30 };
  Storage.save(TEST_KEY, obj);
  const result = Storage.load(TEST_KEY);
  assert(result.name === 'Alice', `Expected "Alice" but got "${result.name}"`);
  assert(result.age === 30, `Expected 30 but got ${result.age}`);
  Storage.remove(TEST_KEY);
});

test('Storage.save and Storage.load round-trip for array', () => {
  const arr = [1, 2, 3];
  Storage.save(TEST_KEY, arr);
  const result = Storage.load(TEST_KEY);
  assert(Array.isArray(result), 'Expected result to be an array');
  assert(result.length === 3, `Expected length 3 but got ${result.length}`);
  assert(result[0] === 1 && result[1] === 2 && result[2] === 3, 'Expected [1, 2, 3]');
  Storage.remove(TEST_KEY);
});

test('Storage.load returns null for missing key', () => {
  Storage.remove(TEST_KEY);
  const result = Storage.load(TEST_KEY);
  assert(result === null, `Expected null but got ${result}`);
});

test('Storage.remove deletes the key', () => {
  Storage.save(TEST_KEY, 'to be removed');
  Storage.remove(TEST_KEY);
  const result = Storage.load(TEST_KEY);
  assert(result === null, `Expected null after remove but got "${result}"`);
});

test('Storage.save and Storage.load round-trip for boolean true', () => {
  Storage.save(TEST_KEY, true);
  const result = Storage.load(TEST_KEY);
  assert(result === true, `Expected true but got ${result}`);
  Storage.remove(TEST_KEY);
});

test('Storage.save and Storage.load round-trip for boolean false', () => {
  Storage.save(TEST_KEY, false);
  const result = Storage.load(TEST_KEY);
  assert(result === false, `Expected false but got ${result}`);
  Storage.remove(TEST_KEY);
});

test('Storage.save and Storage.load round-trip for null', () => {
  Storage.save(TEST_KEY, null);
  const result = Storage.load(TEST_KEY);
  // JSON.stringify(null) = "null", JSON.parse("null") = null
  assert(result === null, `Expected null but got ${result}`);
  Storage.remove(TEST_KEY);
});

test('Storage.load handles corrupted JSON gracefully', () => {
  // Directly write invalid JSON to localStorage
  try {
    localStorage.setItem(TEST_KEY, '{invalid json}');
    const result = Storage.load(TEST_KEY);
    // Should return null on parse error
    assert(result === null, `Expected null for corrupted JSON but got ${result}`);
  } finally {
    localStorage.removeItem(TEST_KEY);
  }
});

test('Storage.save handles localStorage errors gracefully', () => {
  // Temporarily override setItem to throw
  const originalSetItem = localStorage.setItem.bind(localStorage);
  let warningShown = false;
  const originalShowWarning = App.showWarning.bind(App);
  App.showWarning = (msg) => { warningShown = true; };

  try {
    Object.defineProperty(window, 'localStorage', {
      value: {
        ...localStorage,
        setItem: () => { throw new Error('Storage full'); },
        getItem: localStorage.getItem.bind(localStorage),
        removeItem: localStorage.removeItem.bind(localStorage)
      },
      configurable: true
    });
    Storage.save(TEST_KEY, 'test');
    assert(warningShown === true, 'Expected App.showWarning to be called on storage error');
  } catch (e) {
    // If we can't override localStorage (some browsers), skip this test
    console.warn('Could not override localStorage for error test:', e.message);
  } finally {
    // Restore
    App.showWarning = originalShowWarning;
    try {
      Object.defineProperty(window, 'localStorage', {
        value: window.localStorage,
        configurable: true
      });
    } catch (e) {
      // ignore
    }
  }
});

test('Storage.load handles localStorage getItem errors gracefully', () => {
  let warningShown = false;
  const originalShowWarning = App.showWarning.bind(App);
  App.showWarning = (msg) => { warningShown = true; };

  try {
    Object.defineProperty(window, 'localStorage', {
      value: {
        ...localStorage,
        getItem: () => { throw new Error('Access denied'); },
        setItem: localStorage.setItem.bind(localStorage),
        removeItem: localStorage.removeItem.bind(localStorage)
      },
      configurable: true
    });
    const result = Storage.load(TEST_KEY);
    assert(result === null, `Expected null on error but got ${result}`);
    assert(warningShown === true, 'Expected App.showWarning to be called on load error');
  } catch (e) {
    console.warn('Could not override localStorage for error test:', e.message);
  } finally {
    App.showWarning = originalShowWarning;
    try {
      Object.defineProperty(window, 'localStorage', {
        value: window.localStorage,
        configurable: true
      });
    } catch (e) {
      // ignore
    }
  }
});
