import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';

const DeleteProjectModal = ({ isOpen, onClose, project, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const handleDelete = async () => {
    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter your password to confirm deletion.",
        variant: "destructive"
      });
      return;
    }

    if (!project?.id) return;

    setIsLoading(true);
    try {
      // Verify password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: password
      });

      if (signInError) {
        throw new Error("Invalid password");
      }

      // Proceed with deletion
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (deleteError) {
        throw deleteError;
      }

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });

      onSuccess?.();
      handleClose();
    } catch (err) {
      toast({
        title: "Error deleting project",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setPassword('');
    onClose();
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete Project
          </DialogTitle>
          <DialogDescription className="pt-2 text-gray-700">
            Are you sure you want to delete this project? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <p className="text-sm text-red-900 font-medium">Project Details:</p>
            <p className="text-sm text-red-800 mt-1 font-semibold">{project.project_number || project.pr_number || 'No Number'}</p>
            <p className="text-sm text-red-700 mt-0.5">{project.project_title || 'Untitled Project'}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Enter your Owner password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={!password || isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProjectModal;