import api from './axios';

export interface Todo {
  id: number;
  user_id: number;
  category_id?: number | null;
  project_id?: number | null;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'easy';
  deadline?: string | null;
  status: 'done' | 'undone';
  created_at: string;
  updated_at: string;
}

export const getTodos = async () => {
  const response = await api.get('/todos');
  return response.data.data as Todo[];
};

export const createTodo = async (data: Partial<Todo>) => {
  const response = await api.post('/todos', data);
  return response.data.data as Todo;
};

export const updateTodo = async (id: string | number, data: Partial<Todo>) => {
  const response = await api.put(`/todos/${id}`, data);
  return response.data.data as Todo;
};

export const toggleTodoStatus = async (id: string | number) => {
  const response = await api.patch(`/todos/${id}/status`);
  return response.data;
};

export const deleteTodo = async (id: string | number) => {
  const response = await api.delete(`/todos/${id}`);
  return response.data;
};
