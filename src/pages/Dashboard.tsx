import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CategoryManagerModal from '../components/CategoryManagerModal';
import FilterBar from '../components/FilterBar';
import MilestoneFormModal from '../components/MilestoneFormModal';
import ProjectFormModal from '../components/ProjectFormModal';
import TodoForm from '../components/TodoForm';
import CalendarView from '../components/views/CalendarView';
import DashboardHomeView from '../components/views/DashboardHomeView';
import ProjectDetailView from '../components/views/ProjectDetailView';
import ProjectsView from '../components/views/ProjectsView';
import UpcomingView from '../components/views/UpcomingView';

const Dashboard: React.FC = () => {
  const [todos, setTodos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'Dashboard' | 'calendar' | 'upcoming' | 'projects'>('Dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMilestoneOpen, setIsMilestoneOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editingTodo, setEditingTodo] = useState<any>(null);

  // Audio References
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  const chimeAudioRef = useRef<HTMLAudioElement | null>(null);
  const startAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    tickAudioRef.current = new Audio('/sounds/tick.mp3');
    tickAudioRef.current.volume = 0.4;
    chimeAudioRef.current = new Audio('/sounds/tithuh-warning.mp3');
    chimeAudioRef.current.volume = 0.6;
    startAudioRef.current = new Audio('/sounds/thud.mp3');
    startAudioRef.current.volume = 0.3;
  }, []);

  // Filtering state
  const [filters, setFilters] = useState({
    category_id: '',
    priority: '',
    status: '',
  });

  // Dashboard Server-Side States
  const [analyticsData, setAnalyticsData] = useState<{ chartData: number[]; focusScore: number }>({ chartData: [0, 0, 0, 0, 0, 0, 0], focusScore: 0 });
  const [activeSession, setActiveSession] = useState<any>(null);
  const [nextMilestone, setNextMilestone] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [customDuration, setCustomDuration] = useState<number>(45);
  const [customDurationUnit, setCustomDurationUnit] = useState<'min' | 'sec'>('min');
  const [showTimeOutModal, setShowTimeOutModal] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

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
      const [todosRes, catRes, projectsRes, analyticsRes, sessionRes, milestoneRes] = await Promise.all([
        api.get('/todos'),
        api.get('/categories'),
        api.get('/projects'),
        api.get('/analytics').catch(() => ({ data: null })),
        api.get('/focus/current').catch(() => ({ data: null })),
        api.get('/milestones/next').catch(() => ({ data: null }))
      ]);
      setTodos(todosRes.data?.data || todosRes.data || []);
      setCategories(catRes.data?.data || catRes.data || []);
      setProjects(projectsRes.data?.data || projectsRes.data || []);
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

  const handleOpenForm = (todo: any = null, projectId?: number) => {
    if (projectId) {
      setEditingTodo({ project_id: projectId });
    } else {
      setEditingTodo(todo);
    }
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

  useEffect(() => {
    let interval: any;
    if (activeSession && activeSession.status === 'active') {
      const calcRemaining = () => {
        const now = new Date().getTime();
        const start = new Date(activeSession.start_time).getTime();
        const elapsed = Math.floor((now - start) / 1000) + (activeSession.elapsed_seconds || 0);
        const totalDuration = activeSession.duration_seconds !== null && activeSession.duration_seconds !== undefined
          ? activeSession.duration_seconds
          : (activeSession.duration_minutes || 45) * 60;
        const remaining = totalDuration - elapsed;
        return remaining > 0 ? remaining : 0;
      };
      
      // Calculate immediately on start/mount
      setTimeRemaining(calcRemaining());

      interval = setInterval(() => {
        setTimeRemaining(calcRemaining());
      }, 1000);
    } else if (activeSession && activeSession.status === 'paused') {
      const totalDuration = activeSession.duration_seconds !== null && activeSession.duration_seconds !== undefined
        ? activeSession.duration_seconds
        : (activeSession.duration_minutes || 45) * 60;
      const remaining = totalDuration - (activeSession.elapsed_seconds || 0);
      setTimeRemaining(remaining > 0 ? remaining : 0);
    } else {
      setTimeRemaining(0);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  useEffect(() => {
    if (activeSession && activeSession.status === 'active') {
      const now = new Date().getTime();
      const start = new Date(activeSession.start_time).getTime();
      const elapsed = Math.floor((now - start) / 1000) + (activeSession.elapsed_seconds || 0);
      const totalDuration = activeSession.duration_seconds !== null && activeSession.duration_seconds !== undefined
        ? activeSession.duration_seconds
        : (activeSession.duration_minutes || 45) * 60;
      const remaining = totalDuration - elapsed;
      if (remaining > 0) {
        setSessionStarted(true);
      }
    } else {
      setSessionStarted(false);
    }
  }, [activeSession]);

  const playBeep = () => {
    if (tickAudioRef.current) {
      tickAudioRef.current.currentTime = 0;
      tickAudioRef.current.play().catch(e => console.error('Audio tick failed', e));
    }
  };

  const playChime = () => {
    if (chimeAudioRef.current) {
      chimeAudioRef.current.currentTime = 0;
      chimeAudioRef.current.play().catch(e => console.error('Audio chime failed', e));
    }
  };

  const playStartSound = () => {
    if (startAudioRef.current) {
      startAudioRef.current.currentTime = 0;
      startAudioRef.current.play().catch(e => console.error('Audio start failed', e));
    }
  };

  useEffect(() => {
    if (activeSession && activeSession.status === 'active') {
      if (timeRemaining > 0 && timeRemaining <= 10) {
        playBeep();
      } else if (timeRemaining === 0) {
        // Double check if the session is actually completed to avoid startup race conditions
        const now = new Date().getTime();
        const start = new Date(activeSession.start_time).getTime();
        const elapsed = Math.floor((now - start) / 1000) + (activeSession.elapsed_seconds || 0);
        const totalDuration = activeSession.duration_seconds !== null && activeSession.duration_seconds !== undefined
          ? activeSession.duration_seconds
          : (activeSession.duration_minutes || 45) * 60;
        const remaining = totalDuration - elapsed;

        if (remaining <= 0) {
          playChime();
          handleStopSession();
          if (sessionStarted) {
            setShowTimeOutModal(true);
          }
          setSessionStarted(false);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, activeSession]);

  const handleToggleSession = async () => {
    try {
      if (!activeSession) {
        // Play start sound immediately to satisfy browser autoplay policy
        playStartSound();
        const payload = customDurationUnit === 'sec'
          ? { duration_seconds: customDuration, duration_minutes: 0 }
          : { duration_minutes: customDuration };
        const res = await api.post('/focus/start', payload);
        setActiveSession(res.data);
        setSessionStarted(true);
      } else {
        // Play tick beep to satisfy autoplay policy or give audio feedback
        playBeep();
        if (activeSession.status === 'active') {
          const res = await api.post('/focus/pause');
          setActiveSession(res.data);
        } else if (activeSession.status === 'paused') {
          const res = await api.post('/focus/resume');
          setActiveSession(res.data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStopSession = async () => {
    try {
      await api.post('/focus/stop');
      setActiveSession(null);
      fetchData();
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

  // Filter todos based on category, priority, and status
  const filteredTodos = useMemo(() => {
    return todos.filter(t => {
      const categoryMatch = !filters.category_id || t.category_id?.toString() === filters.category_id;
      const priorityMatch = !filters.priority || t.priority === filters.priority;
      const statusMatch = !filters.status || t.status === filters.status;
      return categoryMatch && priorityMatch && statusMatch;
    });
  }, [todos, filters]);

  const activeTasks = useMemo(() => filteredTodos.filter(t => t.status !== 'done'), [filteredTodos]);
  const completedTasks = useMemo(() => filteredTodos.filter(t => t.status === 'done'), [filteredTodos]);

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
          
          <button onClick={() => { setCurrentView('projects'); setSelectedProjectId(null); }} className={`w-full flex items-center gap-4 px-4 py-3 transition-colors ${currentView === 'projects' ? 'bg-[#1e1e1e] text-white' : 'text-[#8a8a8a] hover:bg-[#1e1e1e]/50'} text-sm`}>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: currentView === 'projects' ? "'FILL' 1" : "'FILL' 0" }}>folder</span>
            <span>Projects</span>
          </button>

          <button onClick={() => setIsCategoryManagerOpen(true)} className="w-full flex items-center gap-4 px-4 py-3 text-[#8a8a8a] hover:bg-[#1e1e1e]/50 transition-colors text-sm">
            <span className="material-symbols-outlined text-[20px]">category</span>
            <span>Categories</span>
          </button>
        </nav>
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
          
          {!loading && currentView !== 'projects' && (
            <FilterBar categories={categories} filters={filters} setFilters={setFilters} />
          )}
          
          {loading ? (
            <div className="py-20 text-center text-[#6b6b6b] font-mono animate-pulse">Loading data...</div>
          ) : currentView === 'upcoming' ? (
            <UpcomingView groupedTasks={groupedTasks} fetchData={fetchData} handleOpenForm={handleOpenForm} />
          ) : currentView === 'projects' ? (
            selectedProjectId ? (
              <ProjectDetailView 
                project={projects.find(p => p.id === selectedProjectId)}
                todos={todos}
                handleOpenForm={handleOpenForm}
                onBack={() => setSelectedProjectId(null)}
                onDeleteProject={async (id) => {
                  try {
                    await api.delete(`/projects/${id}`);
                    setSelectedProjectId(null);
                    fetchData();
                  } catch (err) {
                    console.error(err);
                  }
                }}
                onEditProject={() => {
                  const proj = projects.find(p => p.id === selectedProjectId);
                  setEditingProject(proj);
                  setIsProjectFormOpen(true);
                }}
              />
            ) : (
              <ProjectsView 
                projects={projects} 
                todos={todos} 
                onOpenProjectCreateModal={() => {
                  setEditingProject(null);
                  setIsProjectFormOpen(true);
                }}
                onSelectProject={(id) => setSelectedProjectId(id)}
              />
            )
          ) : currentView === 'calendar' ? (
            <CalendarView todos={filteredTodos} handleOpenForm={handleOpenForm} />
          ) : (
            <DashboardHomeView
              stats={stats}
              activeTasks={activeTasks}
              completedTasks={completedTasks}
              fetchData={fetchData}
              handleOpenForm={handleOpenForm}
              analyticsData={analyticsData}
              activeSession={activeSession}
              customDuration={customDuration}
              setCustomDuration={setCustomDuration}
              customDurationUnit={customDurationUnit}
              setCustomDurationUnit={setCustomDurationUnit}
              formatTime={formatTime}
              timeRemaining={timeRemaining}
              handleToggleSession={handleToggleSession}
              handleStopSession={handleStopSession}
              handleOpenMilestoneModal={() => setIsMilestoneOpen(true)}
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
          projects={projects}
          initialData={editingTodo}
        />
      )}

      {isMilestoneOpen && (
        <MilestoneFormModal 
          onClose={() => setIsMilestoneOpen(false)}
          onSuccess={() => {
            setIsMilestoneOpen(false);
            fetchData();
          }}
        />
      )}

      {isCategoryManagerOpen && (
        <CategoryManagerModal 
          categories={categories}
          onClose={() => setIsCategoryManagerOpen(false)}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}

      {isProjectFormOpen && (
        <ProjectFormModal 
          initialData={editingProject}
          onClose={() => {
            setIsProjectFormOpen(false);
            setEditingProject(null);
          }}
          onSuccess={() => {
            setIsProjectFormOpen(false);
            setEditingProject(null);
            fetchData();
          }}
        />
      )}

      {showTimeOutModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center z-[100] p-6 animate-fade-in">
          <div className="max-w-md w-full bg-[#0a0a0a] border border-red-500 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.2)] transform transition-all scale-100 flex flex-col items-center">
            {/* Pulsing Warning Icon */}
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <span className="material-symbols-outlined text-red-500 text-4xl">alarm</span>
            </div>
            
            <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest mb-3">
              Waktu Telah Habis!
            </h2>
            
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Sesi fokus Anda telah selesai. Saatnya meregangkan tubuh sejenak sebelum memulai sesi berikutnya!
            </p>
            
            <button
              onClick={() => setShowTimeOutModal(false)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-lg transition-colors tracking-widest uppercase text-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
