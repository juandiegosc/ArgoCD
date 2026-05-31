import { useState } from 'react';
import type { Task } from '../types/index';
import { advanceStatus, generateId } from '../utils/taskUtils';
import useLocalStorage from '../hooks/useLocalStorage';

const STATUS_LABEL: Record<Task['status'], string> = {
  'todo': 'Por hacer',
  'in-progress': 'En progreso',
  'done': 'Listo',
};

function TasksView() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [input, setInput] = useState('');

  const addTask = () => {
    const title = input.trim();
    if (!title) return;
    const task: Task = {
      id: generateId(),
      title,
      status: 'todo',
      createdAt: Date.now(),
    };
    setTasks([...tasks, task]);
    setInput('');
  };

  const advance = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: advanceStatus(t.status) } : t));
  };

  const remove = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <section className="tasks-view">
      <h2 className="view-title">Tareas</h2>

      <div className="tasks-input-row">
        <input
          type="text"
          placeholder="Nueva tarea..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          className="tasks-input"
          aria-label="Nueva tarea"
        />
        <button onClick={addTask} className="btn btn--primary">Agregar</button>
      </div>

      {tasks.length === 0 ? (
        <p className="tasks-empty">Sin tareas. ¡Agrega una arriba!</p>
      ) : (
        <ul className="tasks-list" aria-label="Lista de tareas">
          {tasks.map(task => (
            <li key={task.id} className={`task-item task-item--${task.status}`}>
              <span className="task-item__title">{task.title}</span>
              <div className="task-item__actions">
                <span className={`task-badge task-badge--${task.status}`}>
                  {STATUS_LABEL[task.status]}
                </span>
                {task.status !== 'done' && (
                  <button
                    onClick={() => advance(task.id)}
                    className="btn btn--sm btn--accent"
                  >
                    Avanzar
                  </button>
                )}
                <button
                  onClick={() => remove(task.id)}
                  className="btn btn--sm btn--danger"
                  aria-label={`Eliminar tarea ${task.title}`}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TasksView;
