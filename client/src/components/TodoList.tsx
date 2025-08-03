import { useEffect, useState } from 'react';
import TodoItem, { Task } from './TodoItem';

function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');

  const loadTasks = async () => {
    try {
      const res = await fetch('/tasks');
      if (res.ok) {
        const data: Task[] = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const addTask = async () => {
    const title = newTitle.trim();
    if (!title) return;
    try {
      const res = await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const task: Task = await res.json();
        setTasks((prev) => [...prev, task]);
        setNewTitle('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div>
      <h2>Todo List</h2>
      <div>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New task"
        />
        <button onClick={addTask}>Add</button>
      </div>
      <ul>
        {tasks.map((task) => (
          <TodoItem
            key={task.id}
            task={task}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
