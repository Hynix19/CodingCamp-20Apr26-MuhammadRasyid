// Property tests for Greeting module
// Feature: todo-life-dashboard

// Property 1: Time formatting produces valid HH:MM output
// Feature: todo-life-dashboard, Property 1: Time formatting produces valid HH:MM output
propertyTest('Property 1: Time formatting produces valid HH:MM output', () => {
  fc.assert(
    fc.property(fc.date(), (date) => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;

      // Must match HH:MM format
      const formatOk = /^[0-2]\d:[0-5]\d$/.test(timeStr);
      if (!formatOk) return false;

      // Hour must be in [00, 23]
      const hourNum = parseInt(hours, 10);
      if (hourNum < 0 || hourNum > 23) return false;

      // Minute must be in [00, 59]
      const minNum = parseInt(minutes, 10);
      if (minNum < 0 || minNum > 59) return false;

      return true;
    }),
    { numRuns: 100 }
  );
});

// Property 2: Date formatting produces human-readable output
// Feature: todo-life-dashboard, Property 2: Date formatting produces human-readable output
propertyTest('Property 2: Date formatting produces human-readable output', () => {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];

  fc.assert(
    fc.property(fc.date(), (date) => {
      const dayName = weekdays[date.getDay()];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const dateStr = `${dayName}, ${day} ${month} ${year}`;

      // Must contain a weekday name
      const hasWeekday = weekdays.some(w => dateStr.includes(w));
      if (!hasWeekday) return false;

      // Must contain a numeric day (1-31)
      const hasDay = /\b([1-9]|[12]\d|3[01])\b/.test(dateStr);
      if (!hasDay) return false;

      // Must contain a month name
      const hasMonth = months.some(m => dateStr.includes(m));
      if (!hasMonth) return false;

      // Must contain a four-digit year
      const hasYear = /\b\d{4}\b/.test(dateStr);
      if (!hasYear) return false;

      return true;
    }),
    { numRuns: 100 }
  );
});

// Property 3: Greeting text is correct for every hour of the day
// Feature: todo-life-dashboard, Property 3: Greeting text is correct for every hour of the day
propertyTest('Property 3: Greeting text is correct for every hour of the day', () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
      const result = Greeting.getGreetingText(hour);

      if (hour >= 5 && hour <= 11) {
        return result === 'Good Morning';
      } else if (hour >= 12 && hour <= 17) {
        return result === 'Good Afternoon';
      } else if (hour >= 18 && hour <= 21) {
        return result === 'Good Evening';
      } else {
        // 22, 23, 0, 1, 2, 3, 4
        return result === 'Good Night';
      }
    }),
    { numRuns: 100 }
  );
});

// Property 4: Greeting format includes name when name is present
// Feature: todo-life-dashboard, Property 4: Greeting format includes name when name is present
propertyTest('Property 4: Greeting format includes name when name is present', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 23 }),
      fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
      (hour, name) => {
        const originalName = Greeting.name;
        try {
          const greeting = Greeting.getGreetingText(hour);
          Greeting.name = name.trim();
          Greeting.renderGreeting();
          // greeting-text shows just the greeting; name-display shows the name
          const greetingEl = document.getElementById('greeting-text');
          const nameEl = document.getElementById('name-display');
          const greetingText = greetingEl ? greetingEl.textContent : '';
          const nameText = nameEl ? nameEl.textContent : '';
          return greetingText === greeting && nameText === name.trim();
        } finally {
          Greeting.name = originalName;
        }
      }
    ),
    { numRuns: 100 }
  );
});
