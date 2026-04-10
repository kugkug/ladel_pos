import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const ClearAllDataModal = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleClearData = async () => {
    if (!password || !confirmCheck) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('clear-all-data', {
        body: { password }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Success",
        description: "All test data has been successfully cleared.",
      });
      
      onSuccess?.();
      onClose();
      setPassword('');
      setConfirmCheck(false);
    } catch (err) {
      toast({
        title: "Error clearing data",
        description: err.message || "An unexpected error occurred. Please verify your password.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setPassword('');
    setConfirmCheck(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Clear All Data
          </DialogTitle>
          <DialogDescription className="pt-3 text-gray-700">
            <strong className="text-red-600 font-semibold block mb-2">Warning: This action cannot be undone.</strong>
            This will permanently delete all test data, including projects, companies, expenses, suppliers, payments, and receipts. The application structure will remain intact.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-start space-x-3 bg-red-50 p-3 rounded-md border border-red-100">
            <Checkbox 
              id="confirm-delete" 
              checked={confirmCheck}
              onCheckedChange={setConfirmCheck}
              className="mt-1 border-red-300 data-[state=checked]:bg-red-600 data-[state=checked]:text-white"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="confirm-delete"
                className="text-sm font-medium leading-none cursor-pointer text-red-900"
              >
                I understand this will delete all data
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Verify Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password to confirm"
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
            onClick={handleClearData} 
            disabled={!confirmCheck || !password || isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Clearing Data...
              </>
            ) : (
              "Clear Everything"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClearAllDataModal;