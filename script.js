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
    // Find the real index in the full array so delete/toggle/edit work correctly
    const realIndex = tasks.indexOf(task);

    const li = document.createElement("li");
    li.className = task.completed ? "task completed" : "task";

    if (task.editing) {
      li.innerHTML = `
        <div class="task-left">
          <input class="edit-input" type="text" />
        </div>
        <div class="task-actions">
          <button class="mini" onclick="saveEdit(${realIndex})" type="button">Save</button>
          <button class="mini secondary" onclick="cancelEdit(${realIndex})" type="button">Cancel</button>
        </div>
      `;

      const input = li.querySelector(".edit-input");
      input.value = task.text;
      // focus + move cursor to end
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveEdit(realIndex);
        if (e.key === "Escape") cancelEdit(realIndex);
      });
    } else {
      li.innerHTML = `
        <label class="task-left">
          <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleCompleted(${realIndex})" />
          <span class="task-text"></span>
        </label>
        <div class="task-actions">
          <button class="mini" onclick="startEdit(${realIndex})" type="button">Edit</button>
          <span class="delete" onclick="deleteTask(${realIndex})">❌</span>
        </div>
      `;

      li.querySelector(".task-text").textContent = task.text;
    }

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
  tasks.push({ text, completed: false, editing: false });
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

function startEdit(index) {
  const tasks = loadTasks();
  // only allow one edit at a time
  tasks.forEach((t) => (t.editing = false));
  tasks[index].editing = true;
  saveTasks(tasks);
  renderTasks();
}

function cancelEdit(index) {
  const tasks = loadTasks();
  tasks[index].editing = false;
  saveTasks(tasks);
  renderTasks();
}

function saveEdit(index) {
  const input = document.querySelector("#taskList .edit-input");
  if (!input) return;

  const newText = input.value.trim();
  if (newText === "") {
    alert("Task cannot be empty");
    return;
  }

  const tasks = loadTasks();
  tasks[index].text = newText;
  tasks[index].editing = false;
  saveTasks(tasks);
  renderTasks();
}

function migrateV1toV2IfNeeded() {
  const oldRaw = localStorage.getItem("todo_tasks_v1");
  if (!oldRaw) return;

  try {
    const oldTasks = JSON.parse(oldRaw);
    if (Array.isArray(oldTasks) && oldTasks.every((t) => typeof t === "string")) {
      const migrated = oldTasks.map((text) => ({ text, completed: false, editing: false }));
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