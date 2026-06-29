import React from 'react';
import TodoCard from '../TodoCard';

interface DashboardHomeViewProps {
  stats: any;
  activeTasks: any[];
  completedTasks: any[];
  fetchData: () => void;
  handleOpenForm: (todo?: any) => void;
  newTaskTitle: string;
  setNewTaskTitle: (val: string) => void;
  handleQuickAdd: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  analyticsData: any;
  activeSession: any;
  customDuration: number;
  setCustomDuration: (val: number) => void;
  formatTime: (sec: number) => string;
  timeRemaining: number;
  handleToggleSession: () => void;
  nextMilestone: any;
}

const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({
  stats, activeTasks, completedTasks, fetchData, handleOpenForm,
  newTaskTitle, setNewTaskTitle, handleQuickAdd,
  analyticsData, activeSession, customDuration, setCustomDuration,
  formatTime, timeRemaining, handleToggleSession, nextMilestone
}) => {
  return (
    <>
      <section className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <h1 className="text-4xl font-bold text-white tracking-tight capitalize flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl">Dashboard</span>
            Dashboard
          </h1>
          <span className="font-mono text-xs text-[#6b6b6b] mb-2">{stats.pending} Pending Tasks</span>
        </div>
        <div className="w-full h-[1px] bg-[#2a2a2a]"></div>
      </section>

      <section className="border border-[#2a2a2a] overflow-hidden mb-12">
        {activeTasks.map(todo => (
          <TodoCard key={todo.id} todo={todo} onUpdate={fetchData} onEdit={handleOpenForm} />
        ))}
        
        {completedTasks.length > 0 && (
          <div>
            {completedTasks.map(todo => (
              <TodoCard key={`completed-${todo.id}`} todo={todo} onUpdate={fetchData} onEdit={handleOpenForm} />
            ))}
          </div>
        )}

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
      </section>

      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-[#181818] border border-[#2a2a2a] p-8 flex flex-col justify-between h-[340px]">
          <div>
            <h3 className="font-mono text-[10px] text-[#8a8a8a] uppercase tracking-[0.2em] mb-6">Productivity Analytics</h3>
            <p className="text-xl font-bold text-white mb-2 tracking-tight">Your focus score is {analyticsData.focusScore > 0 ? 'up ' : ''}{analyticsData.focusScore} today.</p>
          </div>
          
          <div className="flex items-end gap-1 h-32 mt-auto">
            {analyticsData.chartData.map((val: number, i: number) => {
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
    </>
  );
};

export default DashboardHomeView;
