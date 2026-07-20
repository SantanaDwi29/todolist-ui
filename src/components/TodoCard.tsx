import React from 'react';
import api from '../api/axios';

interface Todo {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'easy';
  deadline: string | null;
  status: 'done' | 'undone';
  category_id?: number | null;
  project_id?: number | null;
  Category?: { name: string };
  category?: { name: string };
  Project?: { name: string };
  project?: { name: string };
}

interface TodoCardProps {
  todo: Todo;
  onUpdate: () => void;
  onEdit: (todo: Todo) => void;
}

const TodoCard: React.FC<TodoCardProps> = ({ todo, onUpdate, onEdit }) => {
  const isDone = todo.status === 'done';
  const projectName = todo.project?.name || todo.Project?.name;
  const categoryName = todo.category?.name || todo.Category?.name;

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

  const priorityLabel = todo.priority === 'high' ? 'URGENT' : (todo.priority === 'medium' ? 'MEDIUM' : 'EASY');
  const priorityColor = todo.priority === 'high' 
    ? 'bg-red-500/15 border-red-500/40 text-red-400 font-bold' 
    : (todo.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-white/5 border-white/10 text-gray-400');

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
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#579D63] uppercase tracking-[0.2em]">
                COMPLETED
              </span>
              {projectName && (
                <span className="text-[10px] font-mono text-[#6b6b6b] uppercase tracking-wider">
                  • PROJECT: {projectName}
                </span>
              )}
            </div>
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
    <div className={`group bg-[#131313] hover:bg-[#1a1a1a] flex items-center px-6 py-5 border-b border-[#2a2a2a] transition-colors ${todo.priority === 'high' ? 'border-l-4 border-l-red-500' : ''}`}>
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
          <div className="flex items-center gap-3 mb-1.5">
            <p className="font-sans text-sm text-white group-hover:text-white transition-colors">
              {todo.title}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[9px] font-mono uppercase px-2 py-0.5 border ${priorityColor}`}>
              {priorityLabel}
            </span>
            {projectName && (
              <span className="text-[10px] font-mono text-[#e5e2e1] bg-[#1e1e1e] border border-[#333] px-2 py-0.5 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-[#8a8a8a]">folder</span>
                PROJECT: {projectName.toUpperCase()}
              </span>
            )}
            {categoryName && (
              <span className="text-[10px] font-mono text-[#8a8a8a] uppercase tracking-wider">
                • {categoryName}
              </span>
            )}
            {todo.deadline && (
              <span className="text-[10px] font-mono text-[#8a8a8a] uppercase tracking-wider flex items-center gap-1">
                • <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                {new Date(todo.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
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

