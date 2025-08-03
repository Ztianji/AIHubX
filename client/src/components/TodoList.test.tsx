import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import TodoList from './TodoList';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  cleanup();
});

test('loads and displays tasks', async () => {
  const tasks = [{ id: 1, title: 'Existing', completed: false }];
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => tasks });
  vi.stubGlobal('fetch', fetchMock);
  render(<TodoList />);
  expect(await screen.findByText('Existing')).toBeInTheDocument();
});

test('adds a new task', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => [] })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, title: 'New Task', completed: false }),
    });
  vi.stubGlobal('fetch', fetchMock);
  render(<TodoList />);
  const input = screen.getByPlaceholderText('New task');
  fireEvent.change(input, { target: { value: 'New Task' } });
  fireEvent.click(screen.getByText('Add'));
  expect(await screen.findByText('New Task')).toBeInTheDocument();
});
