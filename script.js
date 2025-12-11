const STORAGE_KEY = "todo-garden-data";

const form = document.querySelector(".task-form");
const input = document.getElementById("task-input");
const pendingList = document.getElementById("task-list");
const completedList = document.getElementById("completed-list");
const pendingSummary = document.getElementById("task-summary");
const completedSummary = document.getElementById("completed-summary");
const progressBar = document.getElementById("progress-active");
const progressFill = document.getElementById("progress-fill");
const pendingEmpty = document.getElementById("pending-empty");
const completedEmpty = document.getElementById("completed-empty");
const celebration = document.getElementById("celebration");
const currentView = document.body?.dataset?.view || "entry";

let celebrationTimeout;
let taskData = { pending: [], completed: [] };

const generateId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

const loadTasks = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      taskData = { pending: [], completed: [] };
      return;
    }
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      taskData = { pending: parsed, completed: [] };
    } else if (parsed && Array.isArray(parsed.pending) && Array.isArray(parsed.completed)) {
      taskData = parsed;
    } else {
      taskData = { pending: [], completed: [] };
    }
  } catch (error) {
    taskData = { pending: [], completed: [] };
  }
};

const persistTasks = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(taskData));
};

const updatePendingSummary = () => {
  const pendingCount = taskData.pending.length;
  const completedCount = taskData.completed.length;
  const total = pendingCount + completedCount;

  if (pendingSummary) {
    if (pendingCount) {
      pendingSummary.textContent = `You have ${pendingCount} task${pendingCount === 1 ? "" : "s"} · ${completedCount} completed`;
    } else if (completedCount) {
      pendingSummary.textContent = `All clear! ${completedCount} completed · add something sweet`;
    } else {
      pendingSummary.textContent = "No tasks yet · start planting ideas";
    }
  }

  if (progressFill && progressBar) {
    const percent = total ? Math.round((completedCount / total) * 100) : 0;
    progressFill.style.width = `${percent}%`;
    progressBar.setAttribute("aria-valuenow", String(percent));
  }

  if (pendingEmpty) {
    pendingEmpty.hidden = pendingCount !== 0;
  }
};

const updateCompletedSummary = () => {
  const done = taskData.completed.length;
  if (completedSummary) {
    completedSummary.textContent = done
      ? `You've completed ${done} task${done === 1 ? "" : "s"} ✨`
      : "No completed tasks yet. Finish one to see it bloom here!";
  }
  if (completedEmpty) {
    completedEmpty.hidden = done !== 0;
  }
};

const createPendingItem = (task) => {
  const item = document.createElement("li");
  item.className = "task-item";
  item.dataset.id = task.id;

  const checkboxLabel = document.createElement("label");
  checkboxLabel.className = "checkbox";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.setAttribute("aria-label", `complete ${task.text}`);

  const fauxCircle = document.createElement("span");
  fauxCircle.setAttribute("aria-hidden", "true");

  checkboxLabel.append(checkbox, fauxCircle);

  const body = document.createElement("div");
  body.className = "task-body";

  const paragraph = document.createElement("p");
  paragraph.className = "task-text";
  paragraph.textContent = task.text;

  const status = document.createElement("small");
  status.className = "task-status";
  status.textContent = "✓ done";

  body.append(paragraph, status);

  const removeButton = document.createElement("button");
  removeButton.className = "task-remove";
  removeButton.type = "button";
  removeButton.setAttribute("aria-label", `delete ${task.text}`);
  removeButton.textContent = "×";

  item.append(checkboxLabel, body, removeButton);

  return item;
};

const createCompletedItem = (task) => {
  const item = document.createElement("li");
  item.className = "task-item completed-item";
  item.dataset.id = task.id;

  const icon = document.createElement("span");
  icon.className = "done-icon";
  icon.textContent = "✨";

  const paragraph = document.createElement("p");
  paragraph.className = "task-text";
  paragraph.textContent = task.text;

  const actions = document.createElement("div");
  actions.className = "completed-actions";

  const restoreButton = document.createElement("button");
  restoreButton.className = "task-restore";
  restoreButton.type = "button";
  restoreButton.dataset.action = "restore";
  restoreButton.setAttribute("aria-label", `replant ${task.text}`);
  restoreButton.textContent = "↺";

  const removeButton = document.createElement("button");
  removeButton.className = "task-remove";
  removeButton.type = "button";
  removeButton.dataset.action = "delete";
  removeButton.setAttribute("aria-label", `remove ${task.text}`);
  removeButton.textContent = "×";

  actions.append(restoreButton, removeButton);
  item.append(icon, paragraph, actions);
  return item;
};

const renderPendingTasks = () => {
  if (pendingList) {
    pendingList.innerHTML = "";
    const fragment = document.createDocumentFragment();
    taskData.pending.forEach(task => fragment.appendChild(createPendingItem(task)));
    pendingList.appendChild(fragment);
  }
  updatePendingSummary();
};

const renderCompletedTasks = () => {
  if (completedList) {
    completedList.innerHTML = "";
    const fragment = document.createDocumentFragment();
    taskData.completed.forEach(task => fragment.appendChild(createCompletedItem(task)));
    completedList.appendChild(fragment);
  }
  updateCompletedSummary();
};

const renderAll = () => {
  renderPendingTasks();
  renderCompletedTasks();
};

const addTask = (text) => {
  taskData.pending.unshift({
    id: generateId(),
    text,
    completed: false,
    createdAt: Date.now(),
  });
  persistTasks();
  renderAll();
};

const completeTask = (id) => {
  const index = taskData.pending.findIndex(task => task.id === id);
  if (index === -1) return;
  const [task] = taskData.pending.splice(index, 1);
  const finishedTask = { ...task, completed: true, completedAt: Date.now() };
  taskData.completed.unshift(finishedTask);
  persistTasks();
  renderAll();
  showCelebration();
};

const restoreTask = (id) => {
  const index = taskData.completed.findIndex(task => task.id === id);
  if (index === -1) return;
  const [task] = taskData.completed.splice(index, 1);
  const restoredTask = { ...task, completed: false };
  delete restoredTask.completedAt;
  taskData.pending.unshift(restoredTask);
  persistTasks();
  renderAll();
};

const deletePendingTask = (id, item) => {
  const doDelete = () => {
    taskData.pending = taskData.pending.filter(task => task.id !== id);
    persistTasks();
    renderAll();
  };

  if (!item) {
    doDelete();
    return;
  }

  item.classList.add("removing");
  setTimeout(doDelete, 240);
};

const deleteCompletedTask = (id) => {
  taskData.completed = taskData.completed.filter(task => task.id !== id);
  persistTasks();
  renderAll();
};

const showCelebration = () => {
  if (!celebration || currentView !== "garden") return;
  celebration.hidden = false;
  clearTimeout(celebrationTimeout);
  celebrationTimeout = setTimeout(() => {
    celebration.hidden = true;
  }, 2200);
};

if (form && input) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    addTask(value);
    input.value = "";
    input.focus();
  });
}

pendingList?.addEventListener("click", (event) => {
  const target = event.target.closest(".task-remove");
  if (!target) return;
  const item = target.closest(".task-item");
  if (!item) return;
  deletePendingTask(item.dataset.id, item);
});

pendingList?.addEventListener("change", (event) => {
  const target = event.target;
  if (!target.matches("input[type='checkbox']")) return;
  const item = target.closest(".task-item");
  if (!item) return;
  completeTask(item.dataset.id);
});

completedList?.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const item = button.closest(".task-item");
  if (!item) return;
  if (button.dataset.action === "restore") {
    restoreTask(item.dataset.id);
  } else if (button.dataset.action === "delete") {
    deleteCompletedTask(item.dataset.id);
  }
});

celebration?.addEventListener("click", () => {
  celebration.hidden = true;
  clearTimeout(celebrationTimeout);
});

loadTasks();
renderAll();