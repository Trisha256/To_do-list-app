const STORAGE_KEY = "todo_tasks_v2";
let currentFilter = "all"; // all | active | completed

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const tasks = raw ? JSON.parse(raw) : [];
    return Array.isArray(tasks) ? tasks : [];
  } catch (e) {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getFilteredTasks(tasks) {
  if (currentFilter === "active") return tasks.filter((t) => !t.completed);
  if (currentFilter === "completed") return tasks.filter((t) => t.completed);
  return tasks;
}

function setActiveFilterButton() {
  document.querySelectorAll(".filters button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === currentFilter);
  });
}

function renderTasks() {
  const tasks = loadTasks();
  const visible = getFilteredTasks(tasks);

  const list = document.getElementById("taskList");
  list.innerHTML = "";

  visible.forEach((task) => {
    // Find the real index in the full array so delete/toggle work correctly
    const realIndex = tasks.indexOf(task);

    const li = document.createElement("li");
    li.className = task.completed ? "task completed" : "task";

    li.innerHTML = `
      <label class="task-left">
        <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleCompleted(${realIndex})" />
        <span class="task-text"></span>
      </label>
      <span class="delete" onclick="deleteTask(${realIndex})">❌</span>
    `;

    li.querySelector(".task-text").textContent = task.text;
    list.appendChild(li);
  });

  setActiveFilterButton();
}

function addTask() {
  const taskInput = document.getElementById("taskInput");
  const text = taskInput.value.trim();

  if (text === "") {
    alert("Please enter a task");
    return;
  }

  const tasks = loadTasks();
  tasks.push({ text, completed: false });
  saveTasks(tasks);

  taskInput.value = "";
  renderTasks();
}

function deleteTask(index) {
  const tasks = loadTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks();
}

function toggleCompleted(index) {
  const tasks = loadTasks();
  tasks[index].completed = !tasks[index].completed;
  saveTasks(tasks);
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;
  renderTasks();
}

function migrateV1toV2IfNeeded() {
  // v1 used key todo_tasks_v1 and stored an array of strings
  const oldRaw = localStorage.getItem("todo_tasks_v1");
  if (!oldRaw) return;

  try {
    const oldTasks = JSON.parse(oldRaw);
    if (Array.isArray(oldTasks) && oldTasks.every((t) => typeof t === "string")) {
      const migrated = oldTasks.map((text) => ({ text, completed: false }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      localStorage.removeItem("todo_tasks_v1");
    }
  } catch (e) {
    // ignore
  }
}

document.addEventListener("DOMContentLoaded", () => {
  migrateV1toV2IfNeeded();

  document.querySelectorAll(".filters button").forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  renderTasks();
});