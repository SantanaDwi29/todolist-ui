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
    <div className="bg-black border border-white p-4 flex flex-wrap gap-4 items-center mb-6">
      <div className="flex items-center text-gray-500 mr-2">
        <Filter className="w-4 h-4 mr-2" />
        <span className="font-bold text-xs uppercase tracking-widest text-gray-400">Filters:</span>
      </div>

      <div className="flex items-center bg-white border border-white px-3 py-1.5 focus-within:border-gray-300">
        <Flag className="w-3 h-3 text-gray-500 mr-2" />
        <select
          name="priority"
          value={filters.priority}
          onChange={handleChange}
          className="bg-transparent text-xs uppercase tracking-widest border-none focus:ring-0 text-black font-bold outline-none cursor-pointer"
        >
          <option value="" className="bg-white text-black">All Priorities</option>
          <option value="high" className="bg-white text-black">High</option>
          <option value="medium" className="bg-white text-black">Medium</option>
          <option value="easy" className="bg-white text-black">Easy</option>
        </select>
      </div>

      <div className="flex items-center bg-white border border-white px-3 py-1.5 focus-within:border-gray-300">
        <CheckCircle2 className="w-3 h-3 text-gray-500 mr-2" />
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="bg-transparent text-xs uppercase tracking-widest border-none focus:ring-0 text-black font-bold outline-none cursor-pointer"
        >
          <option value="" className="bg-white text-black">All Statuses</option>
          <option value="done" className="bg-white text-black">Done</option>
          <option value="undone" className="bg-white text-black">Undone</option>
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
