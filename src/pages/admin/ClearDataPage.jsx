import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ClearDataPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [confirmCheck, setConfirmCheck] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleClearData = async () => {
    setIsDeleting(true);
    try {
      // 1. Verify password using Supabase Auth
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password
      });

      if (signInError) {
        throw new Error('Incorrect password. Please try again.');
      }

      // 2. Call Edge Function to clear data
      const { data, error: functionError } = await supabase.functions.invoke('clear-all-data');

      if (functionError) {
        throw new Error(functionError.message || 'Failed to clear data.');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setIsSuccess(true);
      setShowConfirmDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Data Cleared Successfully</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            All test data has been cleared. The application is now ready for fresh data entry. Your schema and settings remain intact.
          </p>
          <Button 
            onClick={() => navigate('/')} 
            className="bg-[#1B4D5C] hover:bg-[#11313A] text-white px-8 py-2"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-600" />
          Data Reset & Clear All
        </h1>
        <p className="text-gray-500 mt-2">Permanently delete all test data from the application.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
        <div className="bg-red-50 border-b border-red-200 p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-lg font-bold text-red-800">DANGER ZONE: Irreversible Action</h2>
            <p className="text-red-600 mt-1 text-sm">
              This action will permanently delete all records from the database. It cannot be undone. 
              Only use this to clear out test data before going live, or if you need a completely fresh start.
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div>
            <h3 className="text-md font-bold text-gray-900 mb-4">The following data will be permanently deleted:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">• Projects and associated documents (Quotations, POs, Invoices, etc.)</li>
              <li className="flex items-center gap-2">• Companies and Company Contacts</li>
              <li className="flex items-center gap-2">• Customers</li>
              <li className="flex items-center gap-2">• All Expenses (Regular, Reimbursement, Capitalisation, Dividends)</li>
              <li className="flex items-center gap-2">• Suppliers and Supplier Contacts</li>
              <li className="flex items-center gap-2">• Reminders and Calendar Events</li>
              <li className="flex items-center gap-2">• Payments and Acknowledgement Receipts</li>
            </ul>
          </div>

          <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="confirm-delete" 
                checked={confirmCheck}
                onCheckedChange={setConfirmCheck}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="confirm-delete"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 cursor-pointer"
                >
                  I understand this will permanently delete all data
                </label>
                <p className="text-sm text-gray-500">
                  By checking this box, you acknowledge that this action is irreversible.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Label htmlFor="password" className="text-gray-900">Verify your password to continue</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="max-w-md bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="destructive"
              size="lg"
              disabled={!confirmCheck || !password || isDeleting}
              onClick={() => setShowConfirmDialog(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear All Data
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Final Confirmation
            </DialogTitle>
            <DialogDescription className="pt-2 text-base text-gray-700">
              Are you absolutely sure? This will instantly wipe all transactional data from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearData} disabled={isDeleting}>
              {isDeleting ? "Deleting Data..." : "Yes, Delete Everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClearDataPage;