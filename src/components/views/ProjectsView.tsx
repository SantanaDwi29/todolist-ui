import React from 'react';

interface ProjectsViewProps {
  categories: any[];
  todos: any[];
  handleOpenForm: (todo?: any) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ categories, todos, handleOpenForm }) => {
  return (
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
  );
};

export default ProjectsView;
