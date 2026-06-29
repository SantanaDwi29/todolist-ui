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
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center mb-6">
      <div className="flex items-center text-gray-500 mr-2">
        <Filter className="w-5 h-5 mr-2" />
        <span className="font-medium text-sm">Filters:</span>
      </div>

      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        <Tag className="w-4 h-4 text-gray-400 mr-2" />
        <select
          name="category_id"
          value={filters.category_id}
          onChange={handleChange}
          className="bg-transparent text-sm border-none focus:ring-0 text-gray-700 outline-none"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        <Flag className="w-4 h-4 text-gray-400 mr-2" />
        <select
          name="priority"
          value={filters.priority}
          onChange={handleChange}
          className="bg-transparent text-sm border-none focus:ring-0 text-gray-700 outline-none"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="easy">Easy</option>
        </select>
      </div>

      <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        <CheckCircle className="w-4 h-4 text-gray-400 mr-2" />
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="bg-transparent text-sm border-none focus:ring-0 text-gray-700 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="done">Done</option>
          <option value="undone">Undone</option>
        </select>
      </div>
      
      {(filters.category_id || filters.priority || filters.status) && (
        <button 
          onClick={() => setFilters({ category_id: '', priority: '', status: '' })}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium ml-auto"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default FilterBar;
