import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';

interface ProjectFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ onClose, onSuccess, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
      };

      if (initialData) {
        await api.put(`/projects/${initialData.id}`, payload);
      } else {
        await api.post('/projects', payload);
      }
      onSuccess();
    } catch (err) {
      console.error('Failed to save project', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-white w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white flex justify-between items-center">
          <h2 className="text-sm font-bold tracking-widest text-white uppercase">
            {initialData ? 'Edit Project' : 'New Project'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Project Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-white border border-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors text-black placeholder-gray-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Description</label>
            <textarea
              className="w-full px-4 py-2 bg-white border border-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors resize-none h-24 text-black placeholder-gray-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description..."
            />
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
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectFormModal;
