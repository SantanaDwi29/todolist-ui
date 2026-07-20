import React from 'react';

interface ProjectsViewProps {
  projects: any[];
  todos: any[];
  onOpenProjectCreateModal: () => void;
  onSelectProject: (id: number) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, todos, onOpenProjectCreateModal, onSelectProject }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map(proj => {
        const projTasks = todos.filter(t => t.project_id === proj.id);
        const projDone = projTasks.filter(t => t.status === 'done').length;
        const progress = projTasks.length > 0 ? Math.round((projDone / projTasks.length) * 100) : 0;
        const computedStatus = (projTasks.length > 0 && projDone === projTasks.length) ? 'completed' : (projTasks.length > 0 ? 'active' : proj.status);
        
        return (
          <article 
            key={proj.id} 
            onClick={() => onSelectProject(proj.id)}
            className="group flex flex-col bg-[#181818] border border-[#2a2a2a] hover:border-white transition-colors duration-300 cursor-pointer"
          >
            <div className="p-8 flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-[#2a2a2a] px-3 py-1 border border-[#333]">
                  <span className={`text-[10px] uppercase tracking-widest font-mono ${computedStatus === 'completed' ? 'text-green-400' : 'text-[#e5e2e1]'}`}>
                    {computedStatus}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[#6b6b6b] group-hover:text-white transition-colors">arrow_forward</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{proj.name}</h3>
              <p className="text-[#8a8a8a] text-sm mb-8 line-clamp-2">{proj.description || 'No description'}</p>
              
              <div className="mt-auto">
                <div className="flex justify-between items-end mb-3">
                  <span className="font-mono text-[10px] text-[#8a8a8a] uppercase">{progress}% Progress</span>
                  <span className="font-mono text-[10px] text-white">{projDone} / {projTasks.length} Tasks</span>
                </div>
                <div className="h-[2px] w-full bg-[#2a2a2a] overflow-hidden">
                  <div className="h-full bg-white transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
      
      <button onClick={onOpenProjectCreateModal} className="flex flex-col items-center justify-center border-2 border-dashed border-[#2a2a2a] hover:border-white hover:bg-[#1a1a1a] transition-all duration-300 py-8 h-full min-h-[250px]">
        <span className="material-symbols-outlined text-[32px] mb-4 text-[#6b6b6b]">add_circle</span>
        <span className="text-xs uppercase tracking-[0.2em] text-[#8a8a8a] font-mono">Create New Project</span>
      </button>
    </div>
  );
};

export default ProjectsView;
