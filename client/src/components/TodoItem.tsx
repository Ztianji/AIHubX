import { useState } from 'react';

export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

interface TodoItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: number) => void;
}

function TodoItem({ task, onUpdate, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const toggleCompleted = async () => {
    try {
      const res = await fetch(`/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (res.ok) {
        onUpdate({ ...task, completed: !task.completed });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveTitle = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(task.title);
      setEditing(false);
      return;
    }
    try {
      const res = await fetch(`/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      });
      if (res.ok) {
        const updated: Task = await res.json();
        onUpdate(updated);
        setEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async () => {
    try {
      const res = await fetch(`/tasks/${task.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete(task.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <li>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={toggleCompleted}
      />
      {editing ? (
        <>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <button onClick={saveTitle}>Save</button>
        </>
      ) : (
        <span
          onDoubleClick={() => setEditing(true)}
          style={{
            textDecoration: task.completed ? 'line-through' : undefined,
          }}
        >
          {task.title}
        </span>
      )}
      <button onClick={deleteTask}>Delete</button>
    </li>
  );
}

export default TodoItem;
