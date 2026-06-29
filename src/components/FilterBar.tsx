import React from 'react';
import { Filter, Tag, Flag, CheckCircle } from 'lucide-react';

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

const FilterBar: React.FC<FilterBarProps> = ({ categories, filters, setFilters }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center mb-6">
      <div className="flex items-center text-gray-500 mr-2">
        <Filter className="w-5 h-5 mr-2" />
        <span className="font-bold text-sm text-black">Filters:</span>
      </div>

      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 focus-within:border-black focus-within:ring-1 focus-within:ring-black">
        <Flag className="w-4 h-4 text-gray-400 mr-2" />
        <select
          name="priority"
          value={filters.priority}
          onChange={handleChange}
          className="bg-transparent text-sm border-none focus:ring-0 text-black font-medium outline-none cursor-pointer"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="easy">Easy</option>
        </select>
      </div>

      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 focus-within:border-black focus-within:ring-1 focus-within:ring-black">
        <CheckCircle className="w-4 h-4 text-gray-400 mr-2" />
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="bg-transparent text-sm border-none focus:ring-0 text-black font-medium outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="done">Done</option>
          <option value="undone">Undone</option>
        </select>
      </div>
      
      {(filters.priority || filters.status) && (
        <button 
          onClick={() => setFilters({ category_id: filters.category_id, priority: '', status: '' })}
          className="text-sm text-gray-500 hover:text-black font-bold ml-auto transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default FilterBar;
