import React from 'react';
import TodoCard from '../TodoCard';

interface DashboardHomeViewProps {
  stats: any;
  activeTasks: any[];
  completedTasks: any[];
  fetchData: () => void;
  handleOpenForm: (todo?: any) => void;
  analyticsData: any;
  activeSession: any;
  customDuration: number;
  setCustomDuration: (val: number) => void;
  customDurationUnit: 'min' | 'sec';
  setCustomDurationUnit: (val: 'min' | 'sec') => void;
  formatTime: (sec: number) => string;
  timeRemaining: number;
  handleToggleSession: () => void;
  handleStopSession: () => void;
  handleOpenMilestoneModal: () => void;
  nextMilestone: any;
}

const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({
  stats, activeTasks, completedTasks, fetchData, handleOpenForm,
  analyticsData, activeSession, customDuration, setCustomDuration,
  customDurationUnit, setCustomDurationUnit,
  formatTime, timeRemaining, handleToggleSession, handleStopSession, 
  handleOpenMilestoneModal, nextMilestone
}) => {
  const sortedActiveTasks = React.useMemo(() => {
    const priorityWeight: Record<string, number> = { high: 1, medium: 2, easy: 3 };
    return [...activeTasks].sort((a, b) => {
      const weightA = priorityWeight[a.priority] || 4;
      const weightB = priorityWeight[b.priority] || 4;
      return weightA - weightB;
    });
  }, [activeTasks]);

  const urgentCount = React.useMemo(() => {
    return sortedActiveTasks.filter(t => t.priority === 'high').length;
  }, [sortedActiveTasks]);

  return (
    <>
      <section className="mb-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight capitalize flex items-center gap-3">
              <span className="material-symbols-outlined text-4xl">dashboard</span>
              Dashboard
            </h1>
            {urgentCount > 0 && (
              <p className="text-xs text-red-400 font-mono mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                {urgentCount} Task{urgentCount > 1 ? 's' : ''} Paling Urgent Memerlukan Penyelesaian Segera
              </p>
            )}
          </div>
          <span className="font-mono text-xs text-[#6b6b6b] mb-2">{stats.pending} Pending Tasks</span>
        </div>
        <div className="w-full h-[1px] bg-[#2a2a2a]"></div>
      </section>

      <section className="border border-[#2a2a2a] overflow-hidden mb-12">
        {sortedActiveTasks.map(todo => (
          <TodoCard key={todo.id} todo={todo} onUpdate={fetchData} onEdit={handleOpenForm} />
        ))}
        
        {completedTasks.length > 0 && (
          <div>
            {completedTasks.map(todo => (
              <TodoCard key={`completed-${todo.id}`} todo={todo} onUpdate={fetchData} onEdit={handleOpenForm} />
            ))}
          </div>
        )}
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
              <>
                <div className="flex items-center justify-center gap-2 mb-6">
                   <input type="number" value={customDuration} onChange={e => setCustomDuration(Number(e.target.value))} className="w-12 bg-transparent border-b border-[#404040] text-center text-xs text-white focus:outline-none focus:border-white font-mono" min="1" />
                   <select 
                     value={customDurationUnit} 
                     onChange={e => setCustomDurationUnit(e.target.value as 'min' | 'sec')}
                     className="bg-transparent border-none text-xs text-[#8a8a8a] focus:ring-0 outline-none cursor-pointer"
                   >
                     <option value="min" className="bg-[#181818] text-white">min</option>
                     <option value="sec" className="bg-[#181818] text-white">sec</option>
                   </select>
                </div>
                <button onClick={handleToggleSession} className="px-8 py-2 border border-[#404040] text-white text-xs hover:bg-white hover:text-black transition-colors font-mono uppercase tracking-widest">
                  Start
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-[#8a8a8a] mb-6">
                  {`${formatTime(timeRemaining)} remaining`}
                </p>
                <div className="flex gap-2 w-full justify-center px-4">
                  <button onClick={handleToggleSession} className="flex-1 py-2 border border-[#404040] text-white text-xs hover:bg-white hover:text-black transition-colors font-mono uppercase tracking-widest">
                    {activeSession.status === 'active' ? 'Pause' : 'Resume'}
                  </button>
                  <button onClick={handleStopSession} className="flex-1 py-2 border border-red-800 text-red-500 text-xs hover:bg-red-800 hover:text-white transition-colors font-mono uppercase tracking-widest">
                    Stop
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div className="bg-[#181818] border border-[#2a2a2a] p-6 flex flex-col justify-center h-32">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono text-[9px] text-[#8a8a8a] uppercase tracking-[0.2em]">Next Milestone</h3>
              <button 
                onClick={handleOpenMilestoneModal} 
                className="text-[9px] font-mono text-[#8a8a8a] hover:text-white uppercase tracking-widest transition-colors"
              >
                + New
              </button>
            </div>
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
