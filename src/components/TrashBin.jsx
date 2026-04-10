import React, { useContext, useState } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { AuthorizationContext } from '@/contexts/AuthorizationContext';
import AuthorizationModal from '@/components/AuthorizationModal';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const TrashBin = () => {
  const { trashProjects, restoreProject, permanentlyDeleteProject } = useContext(ProjectContext);
  const { isAuthorized } = useContext(AuthorizationContext);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const handleRestore = (id) => {
    restoreProject(id);
  };

  const executeDelete = (id) => {
    if (window.confirm("WARNING: This will permanently delete the project and all related documents. Continue?")) {
      permanentlyDeleteProject(id);
    }
  };

  const handleDelete = (id) => {
    if (!isAuthorized) {
      setPendingDeleteId(id);
      setShowAuth(true);
    } else {
      executeDelete(id);
    }
  };

  if (trashProjects.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
        <p className="text-gray-500">Trash is empty.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trashProjects.map(project => (
        <div key={project.id} className="bg-white border border-red-100 p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center">
          <div>
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              {project.projectNumber} <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Deleted</span>
            </h4>
            <p className="text-sm text-gray-600">{project.companyName}</p>
            <p className="text-xs text-gray-400 mt-1">Deleted: {project.deletedAt ? format(new Date(project.deletedAt), 'MMM dd, yyyy HH:mm') : 'Unknown'}</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm" onClick={() => handleRestore(project.id)} className="text-green-600 border-green-200 hover:bg-green-50">
              <RefreshCw className="w-4 h-4 mr-1" /> Restore
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDelete(project.id)} className="text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-1" /> Delete Permanently
            </Button>
          </div>
        </div>
      ))}

      <AuthorizationModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        onSuccess={() => { if(pendingDeleteId) executeDelete(pendingDeleteId); }} 
      />
    </div>
  );
};

export default TrashBin;