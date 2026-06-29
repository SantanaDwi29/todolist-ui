import React from 'react';
import TodoCard from '../TodoCard';

interface UpcomingViewProps {
  groupedTasks: any[];
  fetchData: () => void;
  handleOpenForm: (todo?: any) => void;
}

const UpcomingView: React.FC<UpcomingViewProps> = ({ groupedTasks, fetchData, handleOpenForm }) => {
  return (
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
              {group.tasks.map((todo: any) => (
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
          <div className="absolute -right-10 -bottom-10 w-48 h-48 border border-white/5 rounded-full pointer-events-none transform rotate-45"></div>
          <div className="absolute right-10 bottom-10 w-64 h-[1px] bg-white/10 pointer-events-none transform -rotate-12"></div>
          
          <h3 className="text-[10px] tracking-[0.2em] uppercase font-mono text-[#8a8a8a] mb-3 relative z-10">Quarterly Goals</h3>
          <p className="text-sm text-white relative z-10 font-bold">Review alignment with VOID vision</p>
        </div>
      </div>
    </>
  );
};

export default UpcomingView;
