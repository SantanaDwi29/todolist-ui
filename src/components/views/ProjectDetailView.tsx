import React from 'react';

interface ProjectDetailViewProps {
  project: any;
  todos: any[];
  handleOpenForm: (todo?: any, projectId?: number) => void;
  onBack: () => void;
  onDeleteProject: (id: number) => void;
}

const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, todos, handleOpenForm, onBack, onDeleteProject }) => {
  if (!project) return null;

  const projTasks = todos.filter(t => t.project_id === project.id);
  const projDone = projTasks.filter(t => t.status === 'done').length;
  const progress = projTasks.length > 0 ? Math.round((projDone / projTasks.length) * 100) : 0;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center bg-[#181818] border border-[#2a2a2a] hover:bg-white hover:text-black transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">{project.name}</h2>
          <span className={`text-xs uppercase tracking-widest font-mono mt-1 block ${project.status === 'completed' ? 'text-green-400' : 'text-[#6b6b6b]'}`}>
            Status: {project.status}
          </span>
        </div>
        <div className="ml-auto flex gap-4">
          <button 
            onClick={() => handleOpenForm(null, project.id)}
            className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
          >
            + Add Task
          </button>
          <button 
            onClick={() => {
              if(window.confirm('Are you sure you want to delete this project? All associated tasks will be detached.')) {
                onDeleteProject(project.id);
              }
            }}
            className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-[#181818] border border-[#2a2a2a] p-8 mb-8">
        <p className="text-[#8a8a8a] text-sm leading-relaxed mb-6">
          {project.description || 'No detailed description provided for this project.'}
        </p>

        <div className="flex justify-between items-end mb-3">
          <span className="font-mono text-xs text-[#8a8a8a] uppercase">{progress}% Complete</span>
          <span className="font-mono text-xs text-white">{projDone} / {projTasks.length} Tasks</span>
        </div>
        <div className="h-[2px] w-full bg-[#2a2a2a] overflow-hidden">
          <div className="h-full bg-white transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-6 border-b border-[#2a2a2a] pb-4">
          Project Tasks
        </h3>
        
        {projTasks.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#2a2a2a] text-[#6b6b6b]">
            <span className="material-symbols-outlined text-4xl mb-2">assignment</span>
            <p className="text-xs uppercase tracking-widest">No tasks yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projTasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => handleOpenForm(task)}
                className={`p-6 border cursor-pointer transition-all duration-300 ${task.status === 'done' ? 'border-[#2a2a2a] bg-[#131313]' : 'border-white/20 bg-[#181818] hover:border-white'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className={`font-bold ${task.status === 'done' ? 'text-[#6b6b6b] line-through' : 'text-white'}`}>
                    {task.title}
                  </h4>
                  {task.priority === 'high' && <span className="text-[10px] text-red-500 font-bold uppercase bg-red-500/10 px-2 py-1">High Priority</span>}
                </div>
                <p className="text-xs text-[#6b6b6b] line-clamp-2">{task.description}</p>
                {task.deadline && (
                  <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-[#8a8a8a]">calendar_today</span>
                    <span className="text-[10px] uppercase font-mono text-[#8a8a8a]">
                      {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailView;
