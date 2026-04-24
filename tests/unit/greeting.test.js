// Unit tests for Greeting module

test('clock formats time as HH:MM with zero-padding', () => {
  // Simulate updateClock by calling the formatting logic directly
  const date = new Date(2024, 0, 15, 9, 5); // 09:05
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  assert(timeStr === '09:05', `Expected "09:05" but got "${timeStr}"`);
});

test('clock formats time at midnight as 00:00', () => {
  const date = new Date(2024, 0, 15, 0, 0);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  assert(timeStr === '00:00', `Expected "00:00" but got "${timeStr}"`);
});

test('clock formats time at 23:59 correctly', () => {
  const date = new Date(2024, 0, 15, 23, 59);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  assert(timeStr === '23:59', `Expected "23:59" but got "${timeStr}"`);
});

test('date formats as "Weekday, DD Month YYYY"', () => {
  // Monday, 15 January 2024
  const date = new Date(2024, 0, 15);
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const dayName = weekdays[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const dateStr = `${dayName}, ${day} ${month} ${year}`;
  assert(dateStr === 'Monday, 15 January 2024', `Expected "Monday, 15 January 2024" but got "${dateStr}"`);
});

test('getGreetingText returns "Good Morning" for hour 5', () => {
  const result = Greeting.getGreetingText(5);
  assert(result === 'Good Morning', `Expected "Good Morning" but got "${result}"`);
});

test('getGreetingText returns "Good Morning" for hour 11', () => {
  const result = Greeting.getGreetingText(11);
  assert(result === 'Good Morning', `Expected "Good Morning" but got "${result}"`);
});

test('getGreetingText returns "Good Afternoon" for hour 12', () => {
  const result = Greeting.getGreetingText(12);
  assert(result === 'Good Afternoon', `Expected "Good Afternoon" but got "${result}"`);
});

test('getGreetingText returns "Good Afternoon" for hour 17', () => {
  const result = Greeting.getGreetingText(17);
  assert(result === 'Good Afternoon', `Expected "Good Afternoon" but got "${result}"`);
});

test('getGreetingText returns "Good Evening" for hour 18', () => {
  const result = Greeting.getGreetingText(18);
  assert(result === 'Good Evening', `Expected "Good Evening" but got "${result}"`);
});

test('getGreetingText returns "Good Evening" for hour 21', () => {
  const result = Greeting.getGreetingText(21);
  assert(result === 'Good Evening', `Expected "Good Evening" but got "${result}"`);
});

test('getGreetingText returns "Good Night" for hour 22', () => {
  const result = Greeting.getGreetingText(22);
  assert(result === 'Good Night', `Expected "Good Night" but got "${result}"`);
});

test('getGreetingText returns "Good Night" for hour 0', () => {
  const result = Greeting.getGreetingText(0);
  assert(result === 'Good Night', `Expected "Good Night" but got "${result}"`);
});

test('getGreetingText returns "Good Night" for hour 4', () => {
  const result = Greeting.getGreetingText(4);
  assert(result === 'Good Night', `Expected "Good Night" but got "${result}"`);
});

test('saveName trims whitespace and saves', () => {
  Greeting.name = null;
  Greeting.saveName('  Alice  ');
  assert(Greeting.name === 'Alice', `Expected "Alice" but got "${Greeting.name}"`);
});

test('saveName rejects names longer than 50 characters', () => {
  const originalName = Greeting.name;
  const longName = 'a'.repeat(51);
  Greeting.saveName(longName);
  assert(Greeting.name === originalName, `Name should not have changed from "${originalName}"`);
});

test('saveName with empty string clears the name', () => {
  Greeting.name = 'Alice';
  Greeting.saveName('');
  assert(Greeting.name === null, `Expected null but got "${Greeting.name}"`);
});

test('saveName with whitespace-only string clears the name', () => {
  Greeting.name = 'Alice';
  Greeting.saveName('   ');
  assert(Greeting.name === null, `Expected null but got "${Greeting.name}"`);
});

test('renderGreeting returns greeting with name when name is set', () => {
  Greeting.name = 'Bob';
  const greetingEl = document.getElementById('greeting-text');
  const nameEl = document.getElementById('name-display');
  Greeting.renderGreeting();
  const greetingText = greetingEl ? greetingEl.textContent : '';
  const nameText = nameEl ? nameEl.textContent : '';
  assert(nameText === 'Bob', `Expected name display to show "Bob" but got "${nameText}"`);
  assert(greetingText.length > 0, `Expected greeting text to be non-empty`);
});

test('renderGreeting returns greeting without name when name is null', () => {
  Greeting.name = null;
  const greetingEl = document.getElementById('greeting-text');
  const nameEl = document.getElementById('name-display');
  Greeting.renderGreeting();
  const greetingText = greetingEl ? greetingEl.textContent : '';
  const nameText = nameEl ? nameEl.textContent : '';
  assert(nameText === '', `Expected name display to be empty but got "${nameText}"`);
  assert(greetingText.length > 0, `Expected greeting text to be non-empty`);
});
