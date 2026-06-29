import React from 'react';
import { CheckCircle2, Circle, Clock, Tag, CalendarIcon, Trash2, Edit2 } from 'lucide-react';
import clsx from 'clsx';
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
  const priorityColors = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const isDeadlineNear = () => {
    if (!todo.deadline) return false;
    const deadline = new Date(todo.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3; // Within 3 days
  };

  const isOverdue = () => {
    if (!todo.deadline) return false;
    return new Date(todo.deadline) < new Date() && todo.status !== 'done';
  };

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

  return (
    <div className={clsx(
      "group bg-white rounded-xl p-5 shadow-sm border transition-all duration-200 hover:shadow-md",
      todo.status === 'done' ? "border-gray-200 opacity-75 bg-gray-50/50" : "border-gray-200",
      isOverdue() && "border-red-300 bg-red-50/10"
    )}>
      <div className="flex items-start gap-4">
        <button 
          onClick={handleToggleStatus}
          className="mt-1 flex-shrink-0 text-gray-400 hover:text-black transition-colors"
        >
          {todo.status === 'done' ? (
            <CheckCircle2 className="w-6 h-6 text-black" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className={clsx(
                "text-lg font-bold text-black truncate",
                todo.status === 'done' && "line-through text-gray-400"
              )}>
                {todo.title}
              </h3>
              {todo.description && (
                <p className={clsx(
                  "mt-1 text-sm text-gray-600 line-clamp-2",
                  todo.status === 'done' && "text-gray-400"
                )}>
                  {todo.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(todo)} className="p-1.5 text-gray-400 hover:text-black rounded-md hover:bg-gray-100 transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-black rounded-md hover:bg-gray-100 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className={clsx("px-2.5 py-1 rounded-full border capitalize", priorityColors[todo.priority])}>
              {todo.priority} Priority
            </span>

            {todo.Category && (
              <span className="flex items-center px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                <Tag className="w-3 h-3 mr-1" />
                {todo.Category.name}
              </span>
            )}

            {todo.deadline && (
              <span className={clsx(
                "flex items-center px-2.5 py-1 rounded-full border",
                isOverdue() ? "bg-red-100 text-red-700 border-red-200" :
                isDeadlineNear() ? "bg-orange-100 text-orange-700 border-orange-200" :
                "bg-blue-50 text-blue-700 border-blue-200"
              )}>
                <CalendarIcon className="w-3 h-3 mr-1" />
                {new Date(todo.deadline).toLocaleDateString()}
                {isOverdue() && " (Overdue)"}
                {isDeadlineNear() && !isOverdue() && " (Soon)"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoCard;
