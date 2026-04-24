// Unit tests for Timer module

function resetTimer() {
  Timer.stop();
  Timer.configuredMinutes = 25;
  Timer.remainingSeconds = 1500;
  Timer.isRunning = false;
}

test('formatTime formats 0 seconds as "00:00"', () => {
  const result = Timer.formatTime(0);
  assert(result === '00:00', `Expected "00:00" but got "${result}"`);
});

test('formatTime formats 60 seconds as "01:00"', () => {
  const result = Timer.formatTime(60);
  assert(result === '01:00', `Expected "01:00" but got "${result}"`);
});

test('formatTime formats 90 seconds as "01:30"', () => {
  const result = Timer.formatTime(90);
  assert(result === '01:30', `Expected "01:30" but got "${result}"`);
});

test('formatTime formats 1500 seconds as "25:00"', () => {
  const result = Timer.formatTime(1500);
  assert(result === '25:00', `Expected "25:00" but got "${result}"`);
});

test('formatTime formats 7200 seconds as "120:00"', () => {
  const result = Timer.formatTime(7200);
  assert(result === '120:00', `Expected "120:00" but got "${result}"`);
});

test('start sets isRunning to true', () => {
  resetTimer();
  Timer.start();
  assert(Timer.isRunning === true, `Expected isRunning to be true`);
  Timer.stop();
});

test('start disables start button and enables stop button', () => {
  resetTimer();
  Timer.start();
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  assert(startBtn.disabled === true, 'Expected start button to be disabled');
  assert(stopBtn.disabled === false, 'Expected stop button to be enabled');
  Timer.stop();
});

test('stop sets isRunning to false', () => {
  resetTimer();
  Timer.start();
  Timer.stop();
  assert(Timer.isRunning === false, `Expected isRunning to be false`);
});

test('stop enables start button and disables stop button', () => {
  resetTimer();
  Timer.start();
  Timer.stop();
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  assert(startBtn.disabled === false, 'Expected start button to be enabled');
  assert(stopBtn.disabled === true, 'Expected stop button to be disabled');
});

test('reset restores remainingSeconds to configuredMinutes * 60', () => {
  resetTimer();
  Timer.configuredMinutes = 10;
  Timer.remainingSeconds = 100; // simulate partial countdown
  Timer.reset();
  assert(Timer.remainingSeconds === 600, `Expected 600 but got ${Timer.remainingSeconds}`);
});

test('reset stops the timer', () => {
  resetTimer();
  Timer.start();
  Timer.reset();
  assert(Timer.isRunning === false, 'Expected timer to be stopped after reset');
});

test('timer stops automatically when remainingSeconds reaches 0', () => {
  resetTimer();
  Timer.remainingSeconds = 1;
  Timer.start();
  Timer.tick(); // this should trigger onComplete which calls stop
  assert(Timer.isRunning === false, 'Expected timer to stop when reaching 0');
});

test('setDuration accepts valid value of 1', () => {
  resetTimer();
  Timer.setDuration(1);
  assert(Timer.configuredMinutes === 1, `Expected configuredMinutes to be 1 but got ${Timer.configuredMinutes}`);
});

test('setDuration accepts valid value of 120', () => {
  resetTimer();
  Timer.setDuration(120);
  assert(Timer.configuredMinutes === 120, `Expected configuredMinutes to be 120 but got ${Timer.configuredMinutes}`);
});

test('setDuration rejects 0', () => {
  resetTimer();
  const original = Timer.configuredMinutes;
  Timer.setDuration(0);
  assert(Timer.configuredMinutes === original, `Expected configuredMinutes to remain ${original} but got ${Timer.configuredMinutes}`);
});

test('setDuration rejects 121', () => {
  resetTimer();
  const original = Timer.configuredMinutes;
  Timer.setDuration(121);
  assert(Timer.configuredMinutes === original, `Expected configuredMinutes to remain ${original} but got ${Timer.configuredMinutes}`);
});

test('setDuration rejects non-numeric input', () => {
  resetTimer();
  const original = Timer.configuredMinutes;
  Timer.setDuration('abc');
  assert(Timer.configuredMinutes === original, `Expected configuredMinutes to remain ${original} but got ${Timer.configuredMinutes}`);
});

test('setDuration resets the timer after valid input', () => {
  resetTimer();
  Timer.remainingSeconds = 100;
  Timer.setDuration(5);
  assert(Timer.remainingSeconds === 300, `Expected remainingSeconds to be 300 but got ${Timer.remainingSeconds}`);
});
