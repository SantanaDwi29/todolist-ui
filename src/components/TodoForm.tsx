import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';

interface Category {
  id: number;
  name: string;
}

interface TodoFormProps {
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  initialData?: any;
}

const TodoForm: React.FC<TodoFormProps> = ({ onClose, onSuccess, categories, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState(initialData?.priority || 'easy');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [deadline, setDeadline] = useState(initialData?.deadline ? initialData.deadline.split('T')[0] : '');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalCategoryId = categoryId;
      
      if (isCreatingCategory && newCategoryName) {
        const catRes = await api.post('/categories', { name: newCategoryName });
        finalCategoryId = catRes.data.id;
      }

      const payload = {
        title,
        description,
        priority,
        category_id: finalCategoryId ? parseInt(finalCategoryId) : null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      };

      if (initialData) {
        await api.put(`/todos/${initialData.id}`, payload);
      } else {
        await api.post('/todos', payload);
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save todo', error);
      // The error will be caught and displayed by the global toast interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-white w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white flex justify-between items-center">
          <h2 className="text-sm font-bold tracking-widest text-white uppercase">
            {initialData ? 'Edit Task' : 'New Task Entry'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Title</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-white border border-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors text-black placeholder-gray-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Description</label>
            <textarea
              className="w-full px-4 py-2 bg-white border border-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors resize-none h-24 text-black placeholder-gray-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add some details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Priority</label>
              <select
                className="w-full px-4 py-2 bg-white border border-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors text-black"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Deadline</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-white border border-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors text-black"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Category</label>
              <button 
                type="button" 
                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                className="text-[10px] font-bold text-white hover:underline uppercase tracking-widest"
              >
                {isCreatingCategory ? 'Select Existing' : '+ New Category'}
              </button>
            </div>
            
            {isCreatingCategory ? (
              <input
                type="text"
                className="w-full px-4 py-2 bg-white border border-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors text-black placeholder-gray-500"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter new category name..."
              />
            ) : (
              <select
                className="w-full px-4 py-2 bg-white border border-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors text-black"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">No Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-black border border-white text-white font-bold hover:bg-gray-900 transition-colors uppercase tracking-widest text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-white text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
            >
              {loading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoForm;
