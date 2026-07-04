import api from './axios';

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description: string;
  status: 'active' | 'completed';
  created_at: string;
  updated_at: string;
  todos?: any[]; // Using any[] for now, can be updated to Todo[] if needed
}

export const getProjects = async () => {
  const response = await api.get('/projects');
  return response.data.data as Project[];
};

export const getProject = async (id: string | number) => {
  const response = await api.get(`/projects/${id}`);
  return response.data.data as Project;
};

export const createProject = async (data: { name: string; description?: string }) => {
  const response = await api.post('/projects', data);
  return response.data.data as Project;
};

export const deleteProject = async (id: string | number) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};
