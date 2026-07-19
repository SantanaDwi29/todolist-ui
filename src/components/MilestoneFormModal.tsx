import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';

interface MilestoneFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const MilestoneFormModal: React.FC<MilestoneFormModalProps> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetDate) return;
    setLoading(true);

    try {
      // Set to ISO String format for Go time.Time parsing
      const isoDateTime = new Date(targetDate).toISOString();
      await api.post('/milestones', {
        title,
        target_date: isoDateTime
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to create milestone', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-white w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white flex justify-between items-center">
          <h2 className="text-sm font-bold tracking-widest text-white uppercase">
            New Milestone
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Milestone Title</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-white border border-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors text-black placeholder-gray-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Launch Beta, Complete Sprint 1"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Target Date</label>
            <input
              type="date"
              required
              className="w-full px-4 py-2 bg-white border border-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors text-black"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
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
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilestoneFormModal;
