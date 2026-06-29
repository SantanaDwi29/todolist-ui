import React from 'react';
import api from '../api/axios';

interface Todo {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'easy';
  deadline: string | null;
  status: 'done' | 'undone';
  Category?: { name: string };
}

interface TodoCardProps {
  todo: Todo;
  onUpdate: () => void;
  onEdit: (todo: Todo) => void;
}

const TodoCard: React.FC<TodoCardProps> = ({ todo, onUpdate, onEdit }) => {
  const isDone = todo.status === 'done';

  const handleToggleStatus = async () => {
    try {
      await api.patch(`/todos/${todo.id}/status`);
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle status', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/todos/${todo.id}`);
      onUpdate();
    } catch (error) {
      console.error('Failed to delete todo', error);
    }
  };

  const formatSubtext = () => {
    if (todo.Category) {
      return `PROJECT: ${todo.Category.name.toUpperCase()}`;
    }
    if (todo.deadline) {
      const date = new Date(todo.deadline);
      // Fallback format if no time is provided, just assume date
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • REMOTE`;
    }
    const priorityText = todo.priority === 'high' ? 'HIGH PRIORITY' : (todo.priority === 'medium' ? 'MEDIUM PRIORITY' : 'EASY');
    return `${priorityText}`;
  };

  if (isDone) {
    return (
      <div className="group bg-[#131313] hover:bg-[#1a1a1a] flex items-center px-6 py-5 border-b border-[#2a2a2a] transition-colors">
        <label className="relative flex items-center justify-center cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked 
            onChange={handleToggleStatus}
            className="absolute opacity-0 cursor-pointer h-0 w-0" 
          />
          <div className="flex items-center justify-center h-5 w-5 border border-white bg-white transition-all">
            <span className="material-symbols-outlined text-black text-[16px] font-bold">check</span>
          </div>
        </label>
        
        <div className="ml-6 flex-1 flex items-center justify-between">
          <div className="flex flex-col justify-center">
            <p className="font-sans text-sm text-[#8a8a8a] line-through mb-1.5">
              {todo.title}
            </p>
            <span className="text-[10px] font-mono text-[#579D63] uppercase tracking-[0.2em]">
              COMPLETED
            </span>
          </div>
          <div className="flex items-center gap-5">
            <span className="material-symbols-outlined text-[#579D63] text-[20px]">check_circle</span>
            <span onClick={handleDelete} className="material-symbols-outlined text-[#6b6b6b] cursor-pointer hover:text-error opacity-0 group-hover:opacity-100 transition-opacity text-[20px]">delete</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-[#131313] hover:bg-[#1a1a1a] flex items-center px-6 py-5 border-b border-[#2a2a2a] transition-colors">
      <label className="relative flex items-center justify-center cursor-pointer select-none">
        <input 
          type="checkbox" 
          checked={false} 
          onChange={handleToggleStatus}
          className="absolute opacity-0 cursor-pointer h-0 w-0" 
        />
        <div className="h-5 w-5 border border-[#6b6b6b] group-hover:border-white transition-colors"></div>
      </label>
      
      <div className="ml-6 flex-1 flex items-center justify-between">
        <div className="cursor-pointer flex flex-col justify-center" onClick={() => onEdit(todo)}>
          <p className="font-sans text-sm text-white group-hover:text-white transition-colors mb-1.5">
            {todo.title}
          </p>
          <span className="text-[10px] font-mono text-[#6b6b6b] uppercase tracking-[0.2em]">
            {formatSubtext()}
          </span>
        </div>
        <div className="flex items-center gap-5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span onClick={() => onEdit(todo)} className="material-symbols-outlined text-[#6b6b6b] cursor-pointer hover:text-white text-[20px]">edit</span>
          <span onClick={handleDelete} className="material-symbols-outlined text-[#6b6b6b] cursor-pointer hover:text-error text-[20px]">delete</span>
        </div>
      </div>
    </div>
  );
};

export default TodoCard;

