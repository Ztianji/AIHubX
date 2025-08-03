import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, expect, vi, afterEach, test } from 'vitest';
import TodoItem, { type Task } from './TodoItem';

describe('TodoItem', () => {
  const task: Task = { id: 1, title: 'Test Task', completed: false };

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    cleanup();
  });

  test('renders task title', () => {
    render(<TodoItem task={task} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  test('toggles completion', async () => {
    const onUpdate = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    render(<TodoItem task={task} onUpdate={onUpdate} onDelete={vi.fn()} />);
    const checkbox = screen.getByRole('checkbox');
    await fireEvent.click(checkbox);
    expect(fetchMock).toHaveBeenCalledWith(
      `/tasks/${task.id}`,
      expect.objectContaining({ method: 'PUT' }),
    );
    expect(onUpdate).toHaveBeenCalledWith({ ...task, completed: true });
  });

  test('deletes task', async () => {
    const onDelete = vi.fn();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    render(<TodoItem task={task} onUpdate={vi.fn()} onDelete={onDelete} />);
    await fireEvent.click(screen.getByText('Delete'));
    expect(fetchMock).toHaveBeenCalledWith(`/tasks/${task.id}`, {
      method: 'DELETE',
    });
    expect(onDelete).toHaveBeenCalledWith(task.id);
  });
});
