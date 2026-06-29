import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, CheckCircle, LayoutDashboard, ListTodo } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../api/axios';
import FilterBar from '../components/FilterBar';
import TodoCard from '../components/TodoCard';
import TodoForm from '../components/TodoForm';

const Dashboard: React.FC = () => {
  const [todos, setTodos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // View state
  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks'>('dashboard');

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
    
    // Additional stats
    const highPriority = todos.filter(t => t.priority === 'high' && t.status !== 'done').length;
    
    const now = new Date();
    const overdue = todos.filter(t => {
      if (t.status === 'done' || !t.deadline) return false;
      // Reset time portion for fair date comparison
      const deadlineDate = new Date(t.deadline);
      deadlineDate.setHours(23, 59, 59, 999);
      return deadlineDate < now;
    }).length;

    return { total, completed, pending, highPriority, overdue };
  }, [todos]);

  // Urgent tasks calculation (top 5 undone tasks sorted by deadline)
  const urgentTasks = useMemo(() => {
    return [...todos]
      .filter(t => t.status !== 'done')
      .sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      })
      .slice(0, 5);
  }, [todos]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-black border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">TodoMaster</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">
              Welcome, <span className="font-medium text-white">{user?.name}</span>
            </span>
            <button 
              onClick={handleLogout}
              className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
              title="Logout"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5 sticky top-8">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Main Menu</h3>
            <div className="space-y-1.5 mb-8">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center ${
                  currentView === 'dashboard' 
                    ? 'bg-black text-white font-medium shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black font-medium'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentView('tasks')}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center ${
                  currentView === 'tasks' 
                    ? 'bg-black text-white font-medium shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black font-medium'
                }`}
              >
                <ListTodo className="w-4 h-4 mr-2" />
                Tasks
              </button>
            </div>

            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Categories</h3>
            <div className="space-y-1.5">
              <button 
                onClick={() => {
                  setFilters({ ...filters, category_id: '' });
                  setCurrentView('tasks');
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center ${
                  !filters.category_id && currentView === 'tasks'
                    ? 'bg-black text-white font-medium shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black font-medium'
                }`}
              >
                All Tasks
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => {
                    setFilters({ ...filters, category_id: cat.id.toString() });
                    setCurrentView('tasks');
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center ${
                    filters.category_id === cat.id.toString() && currentView === 'tasks'
                      ? 'bg-black text-white font-medium shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-black font-medium'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {currentView === 'dashboard' ? (
            // DASHBOARD VIEW
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between">
                  <div className="text-gray-500 text-sm font-bold mb-1 uppercase tracking-wider">Total</div>
                  <div className="text-3xl font-black text-black">{stats.total}</div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between">
                  <div className="text-gray-500 text-sm font-bold mb-1 uppercase tracking-wider">Completed</div>
                  <div className="text-3xl font-black text-black">{stats.completed}</div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between">
                  <div className="text-gray-500 text-sm font-bold mb-1 uppercase tracking-wider">Pending</div>
                  <div className="text-3xl font-black text-black">{stats.pending}</div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between">
                  <div className="text-gray-500 text-sm font-bold mb-1 uppercase tracking-wider">High Priority</div>
                  <div className="text-3xl font-black text-black">{stats.highPriority}</div>
                </div>
                <div className="bg-red-50 rounded-2xl p-5 shadow-sm border border-red-200 flex flex-col justify-between">
                  <div className="text-red-500 text-sm font-bold mb-1 uppercase tracking-wider">Overdue</div>
                  <div className="text-3xl font-black text-red-600">{stats.overdue}</div>
                </div>
              </div>

              {/* Chart Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mt-8 mb-8">
                <h3 className="text-lg font-bold text-black mb-6">Task Completion Status</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Completed', value: stats.completed },
                          { name: 'Pending', value: stats.pending }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#000000" /> {/* Completed */}
                        <Cell fill="#9ca3af" /> {/* Pending */}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontWeight: 'bold' }}
                        itemStyle={{ color: '#000' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-black tracking-tight">Urgent Tasks</h2>
                  <button 
                    onClick={() => setCurrentView('tasks')}
                    className="text-sm font-bold text-gray-500 hover:text-black transition-colors"
                  >
                    View All →
                  </button>
                </div>
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  </div>
                ) : urgentTasks.length === 0 ? (
                  <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
                    <p className="text-gray-500 font-medium">No urgent tasks pending. Great job!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {urgentTasks.map(todo => (
                      <TodoCard 
                        key={todo.id} 
                        todo={todo} 
                        onUpdate={fetchData}
                        onEdit={handleOpenForm}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // TASKS VIEW
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-black tracking-tight">Your Tasks</h2>
                <button 
                  onClick={() => handleOpenForm()}
                  className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-all active:scale-95 flex items-center"
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : todos.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full border border-gray-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-1">No tasks found</h3>
                  <p className="text-gray-500">
                    {filters.category_id || filters.priority || filters.status 
                      ? "Try adjusting your filters." 
                      : "Get started by creating a new task!"}
                  </p>
                  {!(filters.category_id || filters.priority || filters.status) && (
                    <button 
                      onClick={() => handleOpenForm()}
                      className="mt-4 text-black font-semibold hover:underline"
                    >
                      + Create Task
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
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
            </div>
          )}
        </main>
      </div>

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
