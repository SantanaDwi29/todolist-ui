import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TodoCard from '../components/TodoCard';
import TodoForm from '../components/TodoForm';
import DashboardHomeView from '../components/views/DashboardHomeView';
import CalendarView from '../components/views/CalendarView';
import UpcomingView from '../components/views/UpcomingView';
import ProjectsView from '../components/views/ProjectsView';

const Dashboard: React.FC = () => {
  const [todos, setTodos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'Dashboard' | 'calendar' | 'upcoming' | 'projects'>('Dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<any>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Dashboard Server-Side States
  const [analyticsData, setAnalyticsData] = useState<{ chartData: number[]; focusScore: number }>({ chartData: [0, 0, 0, 0, 0, 0, 0], focusScore: 0 });
  const [activeSession, setActiveSession] = useState<any>(null);
  const [nextMilestone, setNextMilestone] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [customDuration, setCustomDuration] = useState<number>(45);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [todosRes, catRes, analyticsRes, sessionRes, milestoneRes] = await Promise.all([
        api.get('/todos'),
        api.get('/categories'),
        api.get('/analytics').catch(() => ({ data: null })),
        api.get('/focus/current').catch(() => ({ data: null })),
        api.get('/milestones/next').catch(() => ({ data: null }))
      ]);
      setTodos(todosRes.data);
      setCategories(catRes.data);
      if (analyticsRes.data) setAnalyticsData(analyticsRes.data);
      if (sessionRes.data?.session) {
        setActiveSession(sessionRes.data.session);
      } else {
        setActiveSession(null);
      }
      if (milestoneRes.data?.milestone) {
        setNextMilestone(milestoneRes.data.milestone);
      } else {
        setNextMilestone(null);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleLogout();
      }
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

  const handleQuickAdd = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTaskTitle.trim() !== '') {
      try {
        await api.post('/todos', {
          title: newTaskTitle,
          priority: 'easy'
        });
        setNewTaskTitle('');
        fetchData();
      } catch (err) {
        console.error('Failed to quick add', err);
      }
    }
  };

  useEffect(() => {
    let interval: any;
    if (activeSession && activeSession.status === 'active') {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(activeSession.start_time).getTime();
        const elapsed = Math.floor((now - start) / 1000) + (activeSession.elapsed_seconds || 0);
        const totalDuration = (activeSession.duration_minutes || 45) * 60;
        const remaining = totalDuration - elapsed;
        setTimeRemaining(remaining > 0 ? remaining : 0);
      }, 1000);
    } else if (activeSession && activeSession.status === 'paused') {
      const totalDuration = (activeSession.duration_minutes || 45) * 60;
      const remaining = totalDuration - (activeSession.elapsed_seconds || 0);
      setTimeRemaining(remaining > 0 ? remaining : 0);
    } else {
      setTimeRemaining(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleToggleSession = async () => {
    try {
      if (!activeSession) {
        const res = await api.post('/focus/start', { duration_minutes: customDuration });
        setActiveSession(res.data);
      } else if (activeSession.status === 'active') {
        const res = await api.post('/focus/pause');
        setActiveSession(res.data);
      } else if (activeSession.status === 'paused') {
        const res = await api.post('/focus/resume');
        setActiveSession(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.status === 'done').length;
    const completionPercentage = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, completionPercentage, pending: total - completed };
  }, [todos]);

  const activeTasks = useMemo(() => todos.filter(t => t.status !== 'done'), [todos]);
  const completedTasks = useMemo(() => todos.filter(t => t.status === 'done'), [todos]);

  const groupedTasks = useMemo(() => {
    const groups: Record<string, any[]> = {};
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // If no deadline, we still want to show it in upcoming if they look there? 
    // Actually, maybe upcoming only shows things with deadlines.
    const withDeadlines = activeTasks.filter(t => t.deadline);
    
    withDeadlines.forEach(task => {
      const d = new Date(task.deadline);
      d.setHours(0,0,0,0);
      let groupKey = d.getTime().toString();
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(task);
    });

    return Object.entries(groups).sort((a,b) => parseInt(a[0]) - parseInt(b[0])).map(([ts, tasks]) => {
      const d = new Date(parseInt(ts));
      let title = '';
      if (d.getTime() === today.getTime()) title = 'TODAY';
      else if (d.getTime() === tomorrow.getTime()) title = 'TOMORROW';
      else title = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
      
      const subTitle = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', year: 'numeric' });
      const dayNum = d.getDate().toString().padStart(2, '0');
      return { dayNum, title, subTitle, tasks };
    });
  }, [activeTasks]);

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] font-sans selection:bg-white selection:text-black">
      {/* Side Navigation Shell */}
      <aside className="fixed left-0 top-0 flex flex-col h-full w-64 border-r border-[#2a2a2a] bg-[#131313] z-50">
        <div className="px-6 py-8">
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">VOID</h1>
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#6b6b6b] mt-1">Task Management</p>
        </div>
        
        <nav className="flex-1 space-y-1 px-4">
          <button onClick={() => setCurrentView('Dashboard')} className={`w-full flex items-center gap-4 px-4 py-3 transition-colors ${currentView === 'Dashboard' ? 'bg-[#1e1e1e] text-white' : 'text-[#8a8a8a] hover:bg-[#1e1e1e]/50'} text-sm`}>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: currentView === 'Dashboard' ? "'FILL' 1" : "'FILL' 0" }}>Dashboard</span>
            <span>Dashboard</span>
          </button>
          
          <button onClick={() => setCurrentView('calendar')} className={`w-full flex items-center gap-4 px-4 py-3 transition-colors ${currentView === 'calendar' ? 'bg-[#1e1e1e] text-white' : 'text-[#8a8a8a] hover:bg-[#1e1e1e]/50'} text-sm`}>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: currentView === 'calendar' ? "'FILL' 1" : "'FILL' 0" }}>calendar_month</span>
            <span>Calendar</span>
          </button>
          
          <button onClick={() => setCurrentView('upcoming')} className={`w-full flex items-center gap-4 px-4 py-3 transition-colors ${currentView === 'upcoming' ? 'bg-[#1e1e1e] text-white' : 'text-[#8a8a8a] hover:bg-[#1e1e1e]/50'} text-sm`}>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: currentView === 'upcoming' ? "'FILL' 1" : "'FILL' 0" }}>event_upcoming</span>
            <span>Upcoming</span>
          </button>
          
          <button onClick={() => setCurrentView('projects')} className={`w-full flex items-center gap-4 px-4 py-3 transition-colors ${currentView === 'projects' ? 'bg-[#1e1e1e] text-white' : 'text-[#8a8a8a] hover:bg-[#1e1e1e]/50'} text-sm`}>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: currentView === 'projects' ? "'FILL' 1" : "'FILL' 0" }}>folder</span>
            <span>Projects</span>
          </button>
        </nav>

        <div className="mt-auto p-4">
          <button onClick={() => handleOpenForm()} className="w-full py-4 bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-all text-sm">
            <span className="text-xl font-normal leading-none">+</span>
            Add Task
          </button>
        </div>
      </aside>

      {/* Top App Bar Shell */}
      <header className="fixed top-0 right-0 left-64 h-[72px] border-b border-[#2a2a2a] bg-[#131313] flex justify-between items-center px-10 z-40">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white capitalize">
            {currentView} 
            {currentView === 'upcoming' && <span className="text-[#6b6b6b] font-normal ml-4 border-l border-[#2a2a2a] pl-4">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>}
          </h2>
        </div>
        <div className="flex items-center gap-6">
          {currentView === 'upcoming' ? (
            <div className="flex items-center gap-4 mr-4">
              <div className="w-48 h-[2px] bg-[#2a2a2a] overflow-hidden">
                 <div className="h-full bg-white" style={{width: `${stats.completionPercentage}%`}}></div>
              </div>
              <span className="font-mono text-xs text-white">{Math.round(stats.completionPercentage)}% Completed</span>
            </div>
          ) : (
            <div className="flex flex-col items-end mr-4">
              <span className="text-[9px] text-[#6b6b6b] uppercase tracking-widest mb-1">Efficiency</span>
              <span className="font-mono text-sm text-white">{Math.round(stats.completionPercentage)}% Completed</span>
            </div>
          )}
          <div className="h-6 w-[1px] bg-[#2a2a2a]"></div>
          <div className="flex items-center gap-5 text-[#8a8a8a]">
            <span className="material-symbols-outlined cursor-pointer hover:text-white transition-colors text-[20px]">leaderboard</span>
            <span className="material-symbols-outlined cursor-pointer hover:text-white transition-colors text-[20px]">settings</span>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="ml-64 pt-[72px] min-h-screen">
        <div className="max-w-[1000px] mx-auto px-10 py-12">
          
          {loading ? (
            <div className="py-20 text-center text-[#6b6b6b] font-mono animate-pulse">Loading data...</div>
          ) : currentView === 'upcoming' ? (
            <UpcomingView groupedTasks={groupedTasks} fetchData={fetchData} handleOpenForm={handleOpenForm} />
          ) : currentView === 'projects' ? (
            <ProjectsView categories={categories} todos={todos} handleOpenForm={handleOpenForm} />
          ) : currentView === 'calendar' ? (
            <CalendarView todos={todos} handleOpenForm={handleOpenForm} />
          ) : (
            <DashboardHomeView
              stats={stats}
              activeTasks={activeTasks}
              completedTasks={completedTasks}
              fetchData={fetchData}
              handleOpenForm={handleOpenForm}
              newTaskTitle={newTaskTitle}
              setNewTaskTitle={setNewTaskTitle}
              handleQuickAdd={handleQuickAdd}
              analyticsData={analyticsData}
              activeSession={activeSession}
              customDuration={customDuration}
              setCustomDuration={setCustomDuration}
              formatTime={formatTime}
              timeRemaining={timeRemaining}
              handleToggleSession={handleToggleSession}
              nextMilestone={nextMilestone}
            />
          )}

        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-10 right-10 flex gap-4 z-50">
        <button className="w-12 h-12 bg-white flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg">
          <span className="material-symbols-outlined text-black text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </button>
        <button className="w-12 h-12 bg-[#131313] border border-[#333] flex items-center justify-center hover:bg-[#1a1a1a] transition-colors shadow-lg">
          <span className="material-symbols-outlined text-white text-[20px]">search</span>
        </button>
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
