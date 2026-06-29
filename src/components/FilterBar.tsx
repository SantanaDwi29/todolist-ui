import React from 'react';
import { Filter, Flag, CheckCircle2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface FilterBarProps {
  categories: Category[];
  filters: {
    category_id: string;
    priority: string;
    status: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    category_id: string;
    priority: string;
    status: string;
  }>>;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-void-container border border-void-border p-4 flex flex-wrap gap-4 items-center mb-6">
      <div className="flex items-center text-gray-500 mr-2">
        <Filter className="w-4 h-4 mr-2" />
        <span className="font-bold text-xs uppercase tracking-widest text-gray-400">Filters:</span>
      </div>

      <div className="flex items-center bg-void-surface border border-void-border px-3 py-1.5 focus-within:border-white">
        <Flag className="w-3 h-3 text-gray-500 mr-2" />
        <select
          name="priority"
          value={filters.priority}
          onChange={handleChange}
          className="bg-transparent text-xs uppercase tracking-widest border-none focus:ring-0 text-white font-bold outline-none cursor-pointer"
        >
          <option value="" className="bg-void-surface">All Priorities</option>
          <option value="high" className="bg-void-surface">High</option>
          <option value="medium" className="bg-void-surface">Medium</option>
          <option value="easy" className="bg-void-surface">Easy</option>
        </select>
      </div>

      <div className="flex items-center bg-void-surface border border-void-border px-3 py-1.5 focus-within:border-white">
        <CheckCircle2 className="w-3 h-3 text-gray-500 mr-2" />
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="bg-transparent text-xs uppercase tracking-widest border-none focus:ring-0 text-white font-bold outline-none cursor-pointer"
        >
          <option value="" className="bg-void-surface">All Statuses</option>
          <option value="done" className="bg-void-surface">Done</option>
          <option value="undone" className="bg-void-surface">Undone</option>
        </select>
      </div>
      
      {(filters.priority || filters.status) && (
        <button 
          onClick={() => setFilters({ category_id: filters.category_id, priority: '', status: '' })}
          className="text-xs uppercase tracking-widest text-gray-500 hover:text-white font-bold ml-auto transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default FilterBar;
