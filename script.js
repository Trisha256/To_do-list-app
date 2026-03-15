const STORAGE_KEY = "todo_tasks_v1";

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

function renderTasks(tasks) {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((taskText, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
${taskText}
<span class="delete" onclick="deleteTask(${index})">❌</span>
    `;

    list.appendChild(li);
  });
}

function addTask() {
  const taskInput = document.getElementById("taskInput");
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    alert("Please enter a task");
    return;
  }

  const tasks = loadTasks();
  tasks.push(taskText);
  saveTasks(tasks);
  renderTasks(tasks);

  taskInput.value = "";
}

function deleteTask(index) {
  const tasks = loadTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks(tasks);
}

// Initial render on page load
document.addEventListener("DOMContentLoaded", () => {
  renderTasks(loadTasks());
});
