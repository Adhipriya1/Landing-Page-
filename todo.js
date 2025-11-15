let tasks = [];
let currentFilter = 'all';

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText === '') {
    taskInput.focus();
    return;
  }

  const task = {
    id: generateId(),
    text: taskText,
    completed: false,
    createdAt: Date.now()
  };

  tasks.unshift(task);
  taskInput.value = '';
  taskInput.focus();

  saveTasks();
  renderTasks();
  updateStats();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateStats();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  updateStats();
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();

  if (tasks.length === 0) {
    taskList.innerHTML = '';
    emptyState.classList.add('show');
    emptyState.querySelector('p').textContent = 'No tasks yet. Add one to get started!';
    return;
  }

  if (filteredTasks.length === 0) {
    taskList.innerHTML = '';
    emptyState.classList.add('show');
    emptyState.querySelector('p').textContent = `No ${currentFilter} tasks found.`;
    return;
  }

  emptyState.classList.remove('show');

  taskList.innerHTML = filteredTasks.map(task => `
    <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask('${task.id}')"></div>
      <span class="task-text">${escapeHtml(task.text)}</span>
      <button class="task-delete" onclick="deleteTask('${task.id}')">Delete</button>
    </li>
  `).join('');
}

function getFilteredTasks() {
  switch (currentFilter) {
    case 'active':
      return tasks.filter(t => !t.completed);
    case 'completed':
      return tasks.filter(t => t.completed);
    default:
      return tasks;
  }
}

function updateStats() {
  const total = tasks.length;
  const active = tasks.filter(t => !t.completed).length;
  const completed = tasks.filter(t => t.completed).length;

  totalCount.textContent = total;
  activeCount.textContent = active;
  completedCount.textContent = completed;
}

function setFilter(filter) {
  currentFilter = filter;

  filterBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filter) {
      btn.classList.add('active');
    }
  });

  renderTasks();
}

function saveTasks() {
  localStorage.setItem('codeversetasks', JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem('codeversetasks');
  if (saved) {
    try {
      tasks = JSON.parse(saved);
    } catch (e) {
      tasks = [];
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addTask();
  }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    setFilter(btn.dataset.filter);
  });
});

loadTasks();
renderTasks();
updateStats();
