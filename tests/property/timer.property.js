// Property tests for Timer module
// Feature: todo-life-dashboard

// Property 6: Timer format produces valid MM:SS output
// Feature: todo-life-dashboard, Property 6: Timer format produces valid MM:SS output
propertyTest('Property 6: Timer format produces valid MM:SS output', () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 7200 }), (seconds) => {
      const result = Timer.formatTime(seconds);

      // Must match MM:SS format (minutes can be > 59 for large values)
      const formatOk = /^\d{2}:[0-5]\d$/.test(result);
      if (!formatOk) return false;

      // Parse back and verify total seconds equals input
      const parts = result.split(':');
      const m = parseInt(parts[0], 10);
      const s = parseInt(parts[1], 10);
      const totalSeconds = m * 60 + s;

      return totalSeconds === seconds;
    }),
    { numRuns: 100 }
  );
});

// Property 7: Timer reset always restores configured duration
// Feature: todo-life-dashboard, Property 7: Timer reset always restores configured duration
propertyTest('Property 7: Timer reset always restores configured duration', () => {
  fc.assert(
    fc.property(fc.integer({ min: 1, max: 120 }), (minutes) => {
      // Save original state
      const originalConfigured = Timer.configuredMinutes;
      const originalRemaining = Timer.remainingSeconds;
      const originalRunning = Timer.isRunning;

      try {
        Timer.configuredMinutes = minutes;
        // Simulate some countdown
        Timer.remainingSeconds = Math.floor(minutes * 60 / 2);
        Timer.reset();

        const expected = minutes * 60;
        return Timer.remainingSeconds === expected;
      } finally {
        // Restore original state
        Timer.stop();
        Timer.configuredMinutes = originalConfigured;
        Timer.remainingSeconds = originalRemaining;
      }
    }),
    { numRuns: 100 }
  );
});
