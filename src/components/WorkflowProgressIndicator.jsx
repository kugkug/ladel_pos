import React, { useContext } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { Check } from 'lucide-react';

const steps = [
  { id: 0, name: 'Project & Quote' },
  { id: 1, name: 'PO' },
  { id: 2, name: 'DR' },
  { id: 3, name: 'Invoice' },
  { id: 4, name: 'AR' },
];

const WorkflowProgressIndicator = () => {
  const { workflowStep, currentProjectId, projects } = useContext(ProjectContext);
  const currentProject = projects.find(p => p.id === currentProjectId);

  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Workflow Progress</h2>
        {currentProject && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            currentProject.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}>
            Status: {currentProject.status}
          </span>
        )}
      </div>
      <div className="relative">
        <div className="absolute top-4 w-full h-0.5 bg-gray-200"></div>
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = workflowStep > step.id || (workflowStep === 5);
            const isCurrent = workflowStep === step.id;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                  isCompleted ? 'bg-green-500 text-white' : 
                  isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                  'bg-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <span className="text-sm font-medium">{step.id + 1}</span>}
                </div>
                <span className={`mt-2 text-xs font-medium ${
                  isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                } text-center max-w-[80px]`}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkflowProgressIndicator;