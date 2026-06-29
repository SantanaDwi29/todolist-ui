import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TodoCard from '../components/TodoCard';
import TodoForm from '../components/TodoForm';

const Dashboard: React.FC = () => {
  const [todos, setTodos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'Dashboard' | 'today' | 'upcoming' | 'projects'>('Dashboard');
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
          
          <button onClick={() => setCurrentView('today')} className={`w-full flex items-center gap-4 px-4 py-3 transition-colors ${currentView === 'today' ? 'bg-[#1e1e1e] text-white' : 'text-[#8a8a8a] hover:bg-[#1e1e1e]/50'} text-sm`}>
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: currentView === 'today' ? "'FILL' 1" : "'FILL' 0" }}>today</span>
            <span>Today</span>
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
            /* Upcoming Custom View */
            <>
              <div className="space-y-14 mb-16">
                {groupedTasks.map(group => (
                  <div key={group.title}>
                    <div className="flex items-start gap-5 mb-8">
                      <span className="text-5xl font-mono text-[#B4E3AC] leading-none tracking-tighter">{group.dayNum}</span>
                      <div className="mt-1">
                        <h3 className="text-sm tracking-widest uppercase text-[#B4E3AC] mb-1">{group.title}</h3>
                        <p className="text-xs text-[#6b6b6b]">{group.subTitle}</p>
                      </div>
                    </div>
                    <div className="space-y-px">
                      {group.tasks.map(todo => (
                         <TodoCard key={todo.id} todo={todo} onUpdate={fetchData} onEdit={handleOpenForm} />
                      ))}
                    </div>
                  </div>
                ))}
                {groupedTasks.length === 0 && (
                  <div className="py-20 text-[#6b6b6b] text-center font-mono">No upcoming tasks scheduled.</div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-[#181818] border border-[#2a2a2a] p-8 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-6 text-[#6b6b6b]">
                    <span className="material-symbols-outlined text-[#B4E3AC]">calendar_today</span>
                    <span className="text-[10px] tracking-[0.2em] uppercase font-mono">Sprint Note</span>
                  </div>
                  <p className="text-sm italic text-[#8a8a8a] mb-8 leading-relaxed">"The clarity of the roadmap depends on the focus of the week."</p>
                  <div className="w-full h-[2px] bg-[#2a2a2a] overflow-hidden mt-auto">
                    <div className="h-full bg-[#B4E3AC] w-[40%]"></div>
                  </div>
                </div>
                
                <div className="bg-[#181818] border border-[#2a2a2a] p-8 flex flex-col justify-end relative overflow-hidden h-48">
                  <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-gradient-to-br from-transparent to-white pointer-events-none"></div>
                  {/* Abstract graphic representation using CSS shapes */}
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 border border-white/5 rounded-full pointer-events-none transform rotate-45"></div>
                  <div className="absolute right-10 bottom-10 w-64 h-[1px] bg-white/10 pointer-events-none transform -rotate-12"></div>
                  
                  <h3 className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#8a8a8a] mb-3 relative z-10">Quarterly Goals</h3>
                  <p className="text-sm text-white relative z-10 font-bold">Review alignment with VOID vision</p>
                </div>
              </div>
            </>
          ) : currentView === 'projects' ? (
            /* Projects Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map(cat => {
                const catTasks = todos.filter(t => t.category_id === cat.id);
                const catDone = catTasks.filter(t => t.status === 'done').length;
                const progress = catTasks.length > 0 ? Math.round((catDone / catTasks.length) * 100) : 0;
                
                return (
                  <article key={cat.id} className="group flex flex-col bg-[#181818] border border-[#2a2a2a] hover:border-white transition-colors duration-300">
                    <div className="p-8 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <div className="bg-[#2a2a2a] px-3 py-1 border border-[#333]">
                          <span className="text-[10px] text-[#e5e2e1] uppercase tracking-widest font-mono">{cat.name}</span>
                        </div>
                        <span className="material-symbols-outlined text-[#6b6b6b] group-hover:text-white transition-colors cursor-pointer">more_vert</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{cat.name}</h3>
                      <p className="text-[#8a8a8a] text-sm mb-8 line-clamp-2">Project tasks and associated milestones for {cat.name}.</p>
                      <div className="mt-auto">
                        <div className="flex justify-between items-end mb-3">
                          <span className="font-mono text-[10px] text-[#8a8a8a] uppercase">{progress}% Progress</span>
                          <span className="font-mono text-[10px] text-white">{catDone} / {catTasks.length} Tasks</span>
                        </div>
                        <div className="h-[2px] w-full bg-[#2a2a2a] overflow-hidden">
                          <div className="h-full bg-white transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
              {/* New Project Placeholder */}
              <button onClick={() => handleOpenForm()} className="flex flex-col items-center justify-center border-2 border-dashed border-[#2a2a2a] hover:border-white hover:bg-[#1a1a1a] transition-all duration-300 py-8 h-full min-h-[250px]">
                <span className="material-symbols-outlined text-[32px] mb-4 text-[#6b6b6b]">add_circle</span>
                <span className="text-xs uppercase tracking-[0.2em] text-[#8a8a8a] font-mono">Create New Task/Project</span>
              </button>
            </div>
          ) : (
            /* Dashboard / Today View */
            <>
              {/* Header Section */}
              <section className="mb-10">
                <div className="flex justify-between items-end mb-4">
                  <h1 className="text-4xl font-bold text-white tracking-tight capitalize flex items-center gap-3">
                    {currentView === 'Dashboard' && <span className="material-symbols-outlined text-4xl">Dashboard</span>}
                    {currentView}
                  </h1>
                  <span className="font-mono text-xs text-[#6b6b6b] mb-2">{stats.pending} Pending Tasks</span>
                </div>
                <div className="w-full h-[1px] bg-[#2a2a2a]"></div>
              </section>

              {/* Task List */}
              <section className="border border-[#2a2a2a] overflow-hidden mb-12">
                {activeTasks.map(todo => (
                  <TodoCard key={todo.id} todo={todo} onUpdate={fetchData} onEdit={handleOpenForm} />
                ))}
                
                {completedTasks.length > 0 && currentView === 'Dashboard' && (
                  <div>
                    {completedTasks.map(todo => (
                      <TodoCard key={`completed-${todo.id}`} todo={todo} onUpdate={fetchData} onEdit={handleOpenForm} />
                    ))}
                  </div>
                )}

                {/* Empty Add Task Row */}
                {(currentView === 'Dashboard' || currentView === 'today') && (
                  <div className="group bg-[#131313] hover:bg-[#1a1a1a] flex items-center px-6 py-5 transition-colors border-t border-[#2a2a2a]">
                    <div className="flex items-center justify-center h-5 w-5">
                      <span className="material-symbols-outlined text-[#6b6b6b] text-[18px]">add</span>
                    </div>
                    <input 
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={handleQuickAdd}
                      className="ml-6 flex-1 bg-transparent border-none text-sm focus:ring-0 outline-none text-white placeholder-[#6b6b6b] font-sans" 
                      placeholder="Press 'Enter' to add a new task..." 
                    />
                  </div>
                )}
              </section>

              {/* Analytics & Widgets */}
              {currentView === 'Dashboard' && (
                <section className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 lg:col-span-8 bg-[#181818] border border-[#2a2a2a] p-8 flex flex-col justify-between h-[340px]">
                    <div>
                      <h3 className="font-mono text-[10px] text-[#8a8a8a] uppercase tracking-[0.2em] mb-6">Productivity Analytics</h3>
                      <p className="text-xl font-bold text-white mb-2 tracking-tight">Your focus score is {analyticsData.focusScore > 0 ? 'up ' : ''}{analyticsData.focusScore} today.</p>
                    </div>
                    
                    {/* Chart */}
                    <div className="flex items-end gap-1 h-32 mt-auto">
                      {analyticsData.chartData.map((val, i) => {
                        const maxVal = Math.max(...analyticsData.chartData, 1);
                        const heightPercent = (val / maxVal) * 100;
                        return (
                          <div key={i} className={`flex-1 ${i === new Date().getDay() - 1 || (i === 6 && new Date().getDay() === 0) ? 'bg-white' : 'bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-all'}`} style={{ height: `${heightPercent || 5}%` }}></div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-[#2a2a2a] flex justify-between items-center text-[10px] font-mono text-[#8a8a8a]">
                      <span>Mon — Sun (Current Week)</span>
                      <span className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors font-bold uppercase tracking-[0.2em]">Full Report <span className="material-symbols-outlined text-[14px]">arrow_forward</span></span>
                    </div>
                  </div>
                  
                  <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-[340px]">
                    <div className="bg-[#181818] border border-[#2a2a2a] p-8 flex flex-col items-center justify-center text-center flex-1">
                      <span className={`material-symbols-outlined text-[32px] mb-4 ${activeSession?.status === 'active' ? 'text-[#B4E3AC]' : 'text-white'}`}>timer</span>
                      <h4 className="font-bold text-white text-sm mb-1 tracking-tight">Deep Work Session</h4>
                      {!activeSession ? (
                        <div className="flex items-center justify-center gap-2 mb-6">
                           <input type="number" value={customDuration} onChange={e => setCustomDuration(Number(e.target.value))} className="w-12 bg-transparent border-b border-[#404040] text-center text-xs text-white focus:outline-none focus:border-white font-mono" min="1" max="120" />
                           <span className="text-xs text-[#8a8a8a]">min</span>
                        </div>
                      ) : (
                        <p className="text-xs text-[#8a8a8a] mb-6">
                          {`${formatTime(timeRemaining)} remaining`}
                        </p>
                      )}
                      <button onClick={handleToggleSession} className="px-8 py-2 border border-[#404040] text-white text-xs hover:bg-white hover:text-black transition-colors font-mono uppercase tracking-widest">
                        {!activeSession ? 'Start' : activeSession.status === 'active' ? 'Pause' : 'Resume'}
                      </button>
                    </div>
                    
                    <div className="bg-[#181818] border border-[#2a2a2a] p-6 flex flex-col justify-center h-32">
                      <h3 className="font-mono text-[9px] text-[#8a8a8a] uppercase tracking-[0.2em] mb-4">Next Milestone</h3>
                      {nextMilestone ? (
                        <>
                          <p className="text-sm font-bold text-white mb-4 tracking-tight">{nextMilestone.title}</p>
                          <div className="w-full h-[2px] bg-[#2a2a2a] overflow-hidden mb-3">
                            <div className="h-full bg-[#8a8a8a]" style={{ width: `${nextMilestone.progress}%` }}></div>
                          </div>
                          <span className="text-[9px] font-mono text-[#8a8a8a]">{nextMilestone.progress}% Progress</span>
                        </>
                      ) : (
                        <p className="text-sm text-[#8a8a8a] italic">No active milestones</p>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </>
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
