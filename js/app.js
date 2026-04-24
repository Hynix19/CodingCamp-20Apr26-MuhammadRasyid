// js/app.js — To-Do Life Dashboard

// ============================================================
// App stub (forward reference — filled in later)
// ============================================================
const App = {
  showWarning(message) {
    // Filled in by App module below; stub prevents errors during Storage init
    const banner = document.getElementById('warning-banner');
    const msg = document.getElementById('warning-message');
    if (banner && msg) {
      msg.textContent = message;
      banner.classList.remove('hidden');
    }
  }
};

// ============================================================
// Storage Module
// localStorage keys are all prefixed with tld_
// ============================================================
const Storage = {
  save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      App.showWarning('Could not save data. Changes may not persist.');
    }
  },

  load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : null;
    } catch (e) {
      App.showWarning('Could not load saved data. Using defaults.');
      return null;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      App.showWarning('Could not remove saved data.');
    }
  }
};

// ============================================================
// Theme Module
// ============================================================
const Theme = {
  currentMode: 'light',

  init() {
    const saved = Storage.load('tld_theme');
    this.currentMode = saved || 'light';
    this.apply(this.currentMode);

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
  },

  apply(mode) {
    this.currentMode = mode;
    document.documentElement.setAttribute('data-theme', mode);

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      if (mode === 'light') {
        toggleBtn.textContent = '🌙';
        toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
      } else {
        toggleBtn.textContent = '☀️';
        toggleBtn.setAttribute('aria-label', 'Switch to light mode');
      }
    }
  },

  toggle() {
    const newMode = this.currentMode === 'light' ? 'dark' : 'light';
    this.apply(newMode);
    Storage.save('tld_theme', newMode);
  },

  current() {
    return this.currentMode;
  }
};

// ============================================================
// Greeting Module
// ============================================================
const Greeting = {
  name: null,
  clockIntervalId: null,

  init() {
    this.name = Storage.load('tld_name');
    this.startClock();
    this.renderGreeting();

    const editBtn = document.getElementById('edit-name-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => this.openNameEditor());
    }
  },

  startClock() {
    this.updateClock();
    this.clockIntervalId = setInterval(() => this.updateClock(), 1000);
  },

  updateClock() {
    const now = new Date();

    // Format time as HH:MM:SS (zero-padded)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;

    // Format date as "Weekday, DD Month YYYY"
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const dayName = weekdays[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const dateStr = `${dayName}, ${day} ${month} ${year}`;

    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');
    if (timeEl) timeEl.textContent = timeStr;
    if (dateEl) dateEl.textContent = dateStr;

    // Re-render greeting in case hour boundary crossed
    this.renderGreeting();
  },

  getGreetingText(hour) {
    // Accept optional hour parameter for testability; default to current hour
    const h = (hour !== undefined) ? hour : new Date().getHours();
    if (h >= 5 && h <= 11) return 'Good Morning';
    if (h >= 12 && h <= 17) return 'Good Afternoon';
    if (h >= 18 && h <= 21) return 'Good Evening';
    return 'Good Night'; // 22–23 and 0–4
  },

  renderGreeting() {
    const greeting = this.getGreetingText();
    const greetingEl = document.getElementById('greeting-text');
    if (greetingEl) greetingEl.textContent = this.name ? `${greeting}, ${this.name}!` : `${greeting}!`;

    // Also update the separate name-display span if present
    const nameDisplayEl = document.getElementById('name-display');
    if (nameDisplayEl) {
      nameDisplayEl.textContent = this.name || '';
    }
  },

  openNameEditor() {
    const editor = document.getElementById('name-editor');
    const editBtn = document.getElementById('edit-name-btn');
    const nameInput = document.getElementById('name-input');

    if (editor) editor.classList.remove('hidden');
    if (editBtn) editBtn.classList.add('hidden');
    if (nameInput) {
      nameInput.value = this.name || '';
      nameInput.focus();
    }

    // Remove any previous listeners by cloning
    const saveBtn = document.getElementById('name-save');
    const cancelBtn = document.getElementById('name-cancel');

    if (saveBtn) {
      const newSave = saveBtn.cloneNode(true);
      saveBtn.parentNode.replaceChild(newSave, saveBtn);
      newSave.addEventListener('click', () => {
        const input = document.getElementById('name-input');
        this.saveName(input ? input.value : '');
      });
    }

    if (cancelBtn) {
      const newCancel = cancelBtn.cloneNode(true);
      cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
      newCancel.addEventListener('click', () => this.closeNameEditor());
    }

    // Allow Enter key to save and Escape to cancel
    if (nameInput) {
      nameInput.onkeydown = (e) => {
        if (e.key === 'Enter') this.saveName(nameInput.value);
        if (e.key === 'Escape') this.closeNameEditor();
      };
    }
  },

  closeNameEditor() {
    const editor = document.getElementById('name-editor');
    const editBtn = document.getElementById('edit-name-btn');
    const nameError = document.getElementById('name-error');
    if (editor) editor.classList.add('hidden');
    if (editBtn) editBtn.classList.remove('hidden');
    if (nameError) nameError.classList.add('hidden');
  },

  saveName(rawName) {
    const trimmed = rawName.trim();

    if (trimmed.length > 50) {
      // Show inline error — create error element if not present
      let nameError = document.getElementById('name-error');
      if (!nameError) {
        nameError = document.createElement('span');
        nameError.id = 'name-error';
        nameError.className = 'error-msg';
        nameError.setAttribute('role', 'alert');
        const editor = document.getElementById('name-editor');
        if (editor) editor.appendChild(nameError);
      }
      nameError.textContent = 'Name must be 50 characters or fewer.';
      nameError.classList.remove('hidden');
      return;
    }

    if (trimmed.length === 0) {
      // Treat empty save as clear
      this.clearName();
      return;
    }

    this.name = trimmed;
    Storage.save('tld_name', trimmed);
    this.renderGreeting();
    this.closeNameEditor();
  },

  clearName() {
    this.name = null;
    Storage.remove('tld_name');
    this.renderGreeting();
    this.closeNameEditor();
  }
};

// ============================================================
// Timer Module
// ============================================================
const Timer = {
  configuredMinutes: 25,
  remainingSeconds: 1500,
  intervalId: null,
  isRunning: false,

  init() {
    const saved = Storage.load('tld_timer_duration');
    this.configuredMinutes = (saved !== null && Number.isInteger(saved)) ? saved : 25;
    this.remainingSeconds = this.configuredMinutes * 60;
    this.render();
    this.updateButtonStates();

    // Set the duration input to the loaded value
    const durationInput = document.getElementById('duration-input');
    if (durationInput) durationInput.value = this.configuredMinutes;

    // Wire button handlers
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const resetBtn = document.getElementById('reset-btn');

    if (startBtn) startBtn.addEventListener('click', () => this.start());
    if (stopBtn) stopBtn.addEventListener('click', () => this.stop());
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());

    const setDurationBtn = document.getElementById('set-duration-btn');
    if (setDurationBtn) {
      setDurationBtn.addEventListener('click', () => {
        const input = document.getElementById('duration-input');
        if (input) this.setDuration(input.value);
      });
    }

    // Clear duration error as soon as the user edits the input
    const durationInputEl = document.getElementById('duration-input');
    if (durationInputEl) {
      durationInputEl.addEventListener('input', () => {
        const errorEl = document.getElementById('duration-error');
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.add('hidden');
        }
      });
    }
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },

  render() {
    const display = document.getElementById('timer-display');
    if (display) display.textContent = this.formatTime(this.remainingSeconds);
  },

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), 1000);
    this.updateButtonStates();
  },

  stop() {
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;
    this.updateButtonStates();
  },

  reset() {
    this.stop();
    this.remainingSeconds = this.configuredMinutes * 60;
    this.render();
  },

  tick() {
    this.remainingSeconds--;
    this.render();
    if (this.remainingSeconds === 0) {
      this.onComplete();
    }
  },

  onComplete() {
    this.stop();
    // Notification API with Web Audio fallback — implemented in task 8.3
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Focus session complete!', {
        body: 'Time to take a break.',
        icon: ''
      });
    } else if (typeof Notification !== 'undefined' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Focus session complete!', { body: 'Time to take a break.' });
        } else {
          this.beep();
        }
      });
    } else {
      this.beep();
    }
  },

  beep() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      osc.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio not available — silently ignore
    }
  },

  setDuration(rawMinutes) {
    const minutes = parseInt(rawMinutes, 10);
    const errorEl = document.getElementById('duration-error');

    if (isNaN(minutes) || minutes < 1 || minutes > 120) {
      if (errorEl) {
        errorEl.textContent = 'Duration must be between 1 and 120 minutes.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    // Clear error
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }

    this.configuredMinutes = minutes;
    Storage.save('tld_timer_duration', minutes);
    this.reset();
  },

  updateButtonStates() {
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');

    if (startBtn) startBtn.disabled = this.isRunning;
    if (stopBtn) stopBtn.disabled = !this.isRunning;
  }
};

// ============================================================
// Tasks Module
// ============================================================
const Tasks = {
  tasks: [],
  sortOption: 'default',

  init() {
    this.tasks = Storage.load('tld_tasks') || [];
    this.sortOption = Storage.load('tld_sort') || 'default';
    this.render();

    const addBtn = document.getElementById('add-task-btn');
    const taskInput = document.getElementById('task-input');

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const input = document.getElementById('task-input');
        if (input) this.addTask(input.value);
      });
    }

    if (taskInput) {
      taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.addTask(taskInput.value);
      });
      // Clear error as soon as the user starts typing
      taskInput.addEventListener('input', () => {
        const errorEl = document.getElementById('task-error');
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.add('hidden');
        }
      });
    }

    // Wire sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.value = this.sortOption;
      sortSelect.addEventListener('change', () => this.setSort(sortSelect.value));
    }
  },

  addTask(rawText) {
    const text = rawText.trim();
    const errorEl = document.getElementById('task-error');

    // Reject empty/whitespace
    if (text.length === 0) {
      if (errorEl) {
        errorEl.textContent = 'Task cannot be empty.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    // Reject duplicate
    if (this.isDuplicate(text, null)) {
      if (errorEl) {
        errorEl.textContent = 'Task already exists.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    // Clear error
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }

    const task = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString() + Math.random().toString(36).slice(2),
      text,
      completed: false,
      createdAt: Date.now()
    };

    this.tasks.push(task);
    this.persist();
    this.render();

    // Clear input
    const taskInput = document.getElementById('task-input');
    if (taskInput) taskInput.value = '';
  },

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.persist();
    this.render();
  },

  toggleComplete(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.persist();
      this.render();
    }
  },

  isDuplicate(text, excludeId) {
    const normalized = text.trim().toLowerCase();
    return this.tasks.some(t => t.id !== excludeId && t.text.trim().toLowerCase() === normalized);
  },

  persist() {
    Storage.save('tld_tasks', this.tasks);
  },

  setSort(option) {
    this.sortOption = option;
    Storage.save('tld_sort', option);
    this.render();
  },

  getSortedTasks() {
    const copy = [...this.tasks];
    switch (this.sortOption) {
      case 'az':
        return copy.sort((a, b) => a.text.localeCompare(b.text));
      case 'za':
        return copy.sort((a, b) => b.text.localeCompare(a.text));
      case 'completed-last':
        return copy.sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          return a.createdAt - b.createdAt;
        });
      case 'completed-first':
        return copy.sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? -1 : 1;
          return a.createdAt - b.createdAt;
        });
      case 'default':
      default:
        return copy.sort((a, b) => a.createdAt - b.createdAt);
    }
  },

  renderTask(task) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' task-item--done' : '');
    li.dataset.id = task.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`);
    checkbox.addEventListener('change', () => this.toggleComplete(task.id));

    // Label
    const label = document.createElement('label');
    label.textContent = task.text;

    // Actions container
    const actions = document.createElement('div');
    actions.className = 'task-item-actions';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = '✏️';
    editBtn.className = 'btn-secondary';
    editBtn.setAttribute('aria-label', `Edit task: ${task.text}`);
    editBtn.addEventListener('click', () => this.startEdit(task.id, li));

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.className = 'btn-danger';
    deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
    deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(actions);

    return li;
  },

  startEdit(id, li) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;

    const label = li.querySelector('label');
    const actions = li.querySelector('.task-item-actions');

    // Replace label with input + inline error span
    const editWrapper = document.createElement('div');
    editWrapper.style.flex = '1';
    editWrapper.style.display = 'flex';
    editWrapper.style.flexDirection = 'column';
    editWrapper.style.gap = '0.2rem';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.text;
    input.className = 'task-edit-input';
    input.setAttribute('aria-label', 'Edit task text');

    const inlineError = document.createElement('span');
    inlineError.className = 'error-msg hidden';
    inlineError.setAttribute('role', 'alert');

    editWrapper.appendChild(input);
    editWrapper.appendChild(inlineError);
    li.replaceChild(editWrapper, label);
    input.focus();
    input.select();

    // Replace actions with save/cancel
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '✓';
    saveBtn.setAttribute('aria-label', 'Save edit');

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '✕';
    cancelBtn.className = 'btn-secondary';
    cancelBtn.setAttribute('aria-label', 'Cancel edit');

    const newActions = document.createElement('div');
    newActions.className = 'task-item-actions';
    newActions.appendChild(saveBtn);
    newActions.appendChild(cancelBtn);
    li.replaceChild(newActions, actions);

    const doSave = () => this.editTask(id, input.value, inlineError);
    const doCancel = () => this.render();

    saveBtn.addEventListener('click', doSave);
    cancelBtn.addEventListener('click', doCancel);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSave();
      if (e.key === 'Escape') doCancel();
    });
  },

  editTask(id, newText, inlineErrorEl) {
    const trimmed = newText.trim();

    // Reject empty
    if (trimmed.length === 0) {
      if (inlineErrorEl) {
        inlineErrorEl.textContent = 'Task text cannot be empty.';
        inlineErrorEl.classList.remove('hidden');
      }
      return;
    }

    // Reject duplicate (excluding self)
    if (this.isDuplicate(trimmed, id)) {
      if (inlineErrorEl) {
        inlineErrorEl.textContent = 'A task with this text already exists.';
        inlineErrorEl.classList.remove('hidden');
      }
      return;
    }

    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.text = trimmed;
      this.persist();
      this.render();
    }
  },

  render() {
    const list = document.getElementById('task-list');
    if (!list) return;
    list.innerHTML = '';
    const sorted = this.getSortedTasks();
    sorted.forEach(task => list.appendChild(this.renderTask(task)));

    // Show/hide empty state message
    const emptyMsg = document.getElementById('task-empty-msg');
    if (emptyMsg) {
      emptyMsg.style.display = sorted.length === 0 ? 'block' : 'none';
    }
  }
};

// ============================================================
// QuickLinks Module
// ============================================================
const QuickLinks = {
  links: [],

  init() {
    this.links = Storage.load('tld_links') || [];
    this.render();

    const addBtn = document.getElementById('add-link-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const labelInput = document.getElementById('link-label-input');
        const urlInput = document.getElementById('link-url-input');
        this.addLink(
          labelInput ? labelInput.value : '',
          urlInput ? urlInput.value : ''
        );
      });
    }

    // Clear error when inputs change
    const clearError = () => {
      const errorEl = document.getElementById('link-error');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.add('hidden');
      }
    };
    const labelInput = document.getElementById('link-label-input');
    const urlInput = document.getElementById('link-url-input');
    if (labelInput) labelInput.addEventListener('input', clearError);
    if (urlInput) urlInput.addEventListener('input', clearError);
  },

  validateUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  addLink(rawLabel, rawUrl) {
    const label = rawLabel.trim();
    const url = rawUrl.trim();
    const errorEl = document.getElementById('link-error');

    // Validate label
    if (label.length === 0) {
      if (errorEl) {
        errorEl.textContent = 'Label cannot be empty.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    if (label.length > 30) {
      if (errorEl) {
        errorEl.textContent = 'Label must be 30 characters or fewer.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    // Validate URL
    if (!this.validateUrl(url)) {
      if (errorEl) {
        errorEl.textContent = 'Please enter a valid URL (e.g. https://example.com).';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    // Clear error
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }

    const link = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now().toString() + Math.random().toString(36).slice(2),
      label,
      url
    };

    this.links.push(link);
    this.persist();
    this.render();

    // Clear inputs
    const labelInput = document.getElementById('link-label-input');
    const urlInput = document.getElementById('link-url-input');
    if (labelInput) labelInput.value = '';
    if (urlInput) urlInput.value = '';
  },

  deleteLink(id) {
    this.links = this.links.filter(l => l.id !== id);
    this.persist();
    this.render();
  },

  persist() {
    Storage.save('tld_links', this.links);
  },

  render() {
    const container = document.getElementById('links-container');
    if (!container) return;
    container.innerHTML = '';

    this.links.forEach(link => {
      const item = document.createElement('div');
      item.className = 'link-item';

      // Link button — opens URL in new tab
      const btn = document.createElement('button');
      btn.textContent = link.label;
      btn.className = 'link-btn';
      btn.setAttribute('aria-label', `Open ${link.label}`);
      btn.addEventListener('click', () => window.open(link.url, '_blank', 'noopener,noreferrer'));

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '✕';
      deleteBtn.className = 'link-delete-btn';
      deleteBtn.setAttribute('aria-label', `Delete link: ${link.label}`);
      deleteBtn.addEventListener('click', () => this.deleteLink(link.id));

      item.appendChild(btn);
      item.appendChild(deleteBtn);
      container.appendChild(item);
    });
  }
};

// ============================================================
// App Module — Bootstrap
// ============================================================
Object.assign(App, {
  init() {
    Theme.init();
    Greeting.init();
    Timer.init();
    Tasks.init();
    QuickLinks.init();

    const closeBtn = document.getElementById('warning-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const banner = document.getElementById('warning-banner');
        if (banner) banner.classList.add('hidden');
      });
    }
  },

  showWarning(message) {
    const banner = document.getElementById('warning-banner');
    const msg = document.getElementById('warning-message');
    if (banner && msg) {
      msg.textContent = message;
      banner.classList.remove('hidden');
    }
  }
});

// Bootstrap the application
document.addEventListener('DOMContentLoaded', () => App.init());

// window.addEventListener('load', () => {
//   AOS.init({
//     duration: 1500,
//     easing: 'ease-in-out-back',
//     once: false,
//   });
// });
window.addEventListener('resize', () => {
  AOS.refresh();
});

