const API = window.API_URL || 'http://localhost:3000';

async function fetchTasks() {
  const res = await fetch(`${API}/tasks`);
  return res.json();
}

async function createTask(title) {
  const res = await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return res.json();
}

async function updateTask(id, data) {
  const res = await fetch(`${API}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function deleteTask(id) {
  await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
}

function renderTasks(tasks) {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  if (!tasks.length) {
    list.innerHTML = '<p class="empty">Nenhuma tarefa ainda. Adicione uma acima!</p>';
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    li.innerHTML = `
      <input type="checkbox" ${task.done ? 'checked' : ''} title="Marcar como concluída" />
      <span class="title">${escapeHtml(task.title)}</span>
      <button class="btn-delete" title="Deletar">✕</button>
    `;

    li.querySelector('input[type="checkbox"]').addEventListener('change', async (e) => {
      await updateTask(task.id, { done: e.target.checked });
      render();
    });

    li.querySelector('.btn-delete').addEventListener('click', async () => {
      await deleteTask(task.id);
      render();
    });

    list.appendChild(li);
  });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

async function render() {
  const tasks = await fetchTasks();
  renderTasks(tasks);
}

document.getElementById('form-create').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('input-title');
  const title = input.value.trim();
  if (!title) return;
  await createTask(title);
  input.value = '';
  render();
});

render();
