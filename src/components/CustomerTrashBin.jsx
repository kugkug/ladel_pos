import React, { useState } from 'react';
import { RefreshCw, Trash2, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const CustomerTrashBin = ({ trashCustomers, onRestore, onPermanentlyDelete, onEmptyTrash }) => {
  const { toast } = useToast();
  const [pwdDialog, setPwdDialog] = useState({ isOpen: false, type: '', id: null });
  const [pwd, setPwd] = useState('');

  const handlePwdSubmit = () => {
    if (pwd !== 'admin123') {
      toast({ title: "Error", description: "Incorrect password.", variant: "destructive" });
      return;
    }
    
    if (pwdDialog.type === 'single' && pwdDialog.id) {
      onPermanentlyDelete(pwdDialog.id);
      toast({ title: "Deleted", description: "Customer permanently deleted." });
    } else if (pwdDialog.type === 'empty') {
      onEmptyTrash();
      toast({ title: "Emptied", description: "Trash bin has been emptied." });
    }
    
    setPwdDialog({ isOpen: false, type: '', id: null });
    setPwd('');
  };

  if (trashCustomers.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-dashed border-muted text-center flex flex-col items-center justify-center">
        <Trash2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium text-lg">Trash is empty.</p>
        <p className="text-sm text-muted-foreground mt-1">Deleted customers will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-accent flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-destructive" /> Deleted Customers ({trashCustomers.length})
        </h3>
        <Button 
          variant="destructive" 
          onClick={() => setPwdDialog({ isOpen: true, type: 'empty', id: null })}
          className="shadow-sm"
        >
          <AlertTriangle className="w-4 h-4 mr-2" /> Empty Trash
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-muted shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 text-muted-foreground">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Customer / Company</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Deleted Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted">
              {trashCustomers.map(c => (
                <tr key={c.id} className="hover:bg-red-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-accent">{c.customerName || c.companyName}</p>
                    <p className="text-sm text-muted-foreground">{c.companyName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{c.email || 'No email'}</p>
                    <p className="text-xs text-muted-foreground">{c.phone || 'No phone'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">
                      {c.deletedAt ? new Date(c.deletedAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => onRestore(c.id)} className="text-green-600 border-green-200 hover:bg-green-50">
                        <RefreshCw className="w-4 h-4 mr-1" /> Restore
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPwdDialog({ isOpen: true, type: 'single', id: c.id })} className="text-destructive border-red-200 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={pwdDialog.isOpen} onOpenChange={(open) => !open && setPwdDialog({ isOpen: false, type: '', id: null })}>
        <DialogContent className="border-destructive/20 shadow-xl max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2 text-xl">
              <AlertTriangle className="w-6 h-6"/> Verification Required
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <p className="text-sm text-muted-foreground font-medium">This action is permanent and cannot be undone. Please enter the administrator password ("admin123") to proceed.</p>
            <div className="space-y-2">
              <Label className="font-bold text-accent">Password</Label>
              <Input 
                type="password" 
                value={pwd} 
                onChange={(e) => setPwd(e.target.value)} 
                placeholder="Enter password" 
                className="focus-visible:ring-destructive"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwdDialog({ isOpen: false, type: '', id: null })} className="border-muted hover:bg-muted text-foreground">Cancel</Button>
            <Button variant="destructive" onClick={handlePwdSubmit} className="shadow-sm">Confirm Permanent Deletion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerTrashBin;