import React, { useState, useEffect } from 'react';
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
      
      // If user wants to create a new category
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
      alert('Failed to save todo. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add some details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="easy">Easy (Green)</option>
                <option value="medium">Medium (Yellow)</option>
                <option value="high">High (Red)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-gray-700"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <button 
                type="button" 
                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                {isCreatingCategory ? 'Select Existing' : '+ New Category'}
              </button>
            </div>
            
            {isCreatingCategory ? (
              <input
                type="text"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter new category name..."
              />
            ) : (
              <select
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
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
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
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
