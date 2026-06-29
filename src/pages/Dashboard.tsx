import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, CheckCircle, Clock } from 'lucide-react';
import api from '../api/axios';
import FilterBar from '../components/FilterBar';
import TodoCard from '../components/TodoCard';
import TodoForm from '../components/TodoForm';

const Dashboard: React.FC = () => {
  const [todos, setTodos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    category_id: '',
    priority: '',
    status: ''
  });

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [todosRes, catRes] = await Promise.all([
        api.get('/todos', { params: filters }),
        api.get('/categories')
      ]);
      setTodos(todosRes.data);
      setCategories(catRes.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleLogout();
      }
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleOpenForm = (todo: any = null) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingTodo(null);
    setIsFormOpen(false);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    fetchData();
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.status === 'done').length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [todos]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-indigo-600 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">TodoMaster</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-indigo-100 text-sm hidden sm:block">
              Welcome, <span className="font-medium text-white">{user?.name}</span>
            </span>
            <button 
              onClick={handleLogout}
              className="flex items-center text-sm font-medium text-indigo-100 hover:text-white transition-colors p-2 rounded-lg hover:bg-indigo-700"
              title="Logout"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm font-medium mb-1">Total Tasks</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-emerald-500 text-sm font-medium mb-1">Completed</div>
            <div className="text-3xl font-bold text-gray-900">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-amber-500 text-sm font-medium mb-1">Pending</div>
            <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Tasks</h2>
          <button 
            onClick={() => handleOpenForm()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm shadow-indigo-200 transition-all active:scale-95 flex items-center"
          >
            <Plus className="w-5 h-5 mr-1" />
            New Task
          </button>
        </div>

        <FilterBar 
          categories={categories}
          filters={filters}
          setFilters={setFilters}
        />

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : todos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-indigo-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
            <p className="text-gray-500">
              {filters.category_id || filters.priority || filters.status 
                ? "Try adjusting your filters." 
                : "Get started by creating a new task!"}
            </p>
            {!(filters.category_id || filters.priority || filters.status) && (
              <button 
                onClick={() => handleOpenForm()}
                className="mt-4 text-indigo-600 font-medium hover:text-indigo-700"
              >
                + Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {todos.map(todo => (
              <TodoCard 
                key={todo.id} 
                todo={todo} 
                onUpdate={fetchData}
                onEdit={handleOpenForm}
              />
            ))}
          </div>
        )}
      </main>

      {isFormOpen && (
        <TodoForm 
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
          categories={categories}
          initialData={editingTodo}
        />
      )}
    </div>
  );
};

export default Dashboard;
