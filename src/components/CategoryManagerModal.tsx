import React, { useState } from 'react';
import { X, Trash2, FolderPlus } from 'lucide-react';
import api from '../api/axios';

interface Category {
  id: number;
  name: string;
}

interface CategoryManagerModalProps {
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ categories, onClose, onSuccess }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setLoading(true);

    try {
      await api.post('/categories', { name: newCategoryName.trim() });
      setNewCategoryName('');
      onSuccess(); // Refetch categories in parent
    } catch (err) {
      console.error('Failed to create category', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? Tasks in this category will not be deleted.')) return;
    setLoading(true);

    try {
      await api.delete(`/categories/${id}`);
      onSuccess(); // Refetch categories in parent
    } catch (err) {
      console.error('Failed to delete category', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-white w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white flex justify-between items-center">
          <h2 className="text-sm font-bold tracking-widest text-white uppercase">
            Manage Categories
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Create Category Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              required
              className="flex-1 px-4 py-2 bg-white border border-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors text-black placeholder-gray-500 text-sm"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name..."
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-white text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-70 flex items-center gap-2 text-xs uppercase tracking-widest"
            >
              <FolderPlus className="w-4 h-4" />
              Add
            </button>
          </form>

          <div className="w-full h-[1px] bg-[#2a2a2a]"></div>

          {/* Categories List */}
          <div>
            <h3 className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
              Existing Categories
            </h3>
            
            {categories.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-2">No categories created yet.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex justify-between items-center px-4 py-3 bg-[#131313] border border-[#2a2a2a] hover:border-gray-500 transition-colors"
                  >
                    <span className="text-sm font-bold text-white font-mono">{category.name}</span>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={loading}
                      className="text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 bg-black border border-white text-white font-bold hover:bg-gray-900 transition-colors uppercase tracking-widest text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagerModal;
