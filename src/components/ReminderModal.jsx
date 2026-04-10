import React, { useState, useEffect, useContext } from 'react';
import { ExpensesContext } from '@/contexts/ExpensesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const TYPES = ['Pay Slip', 'Utilities', 'Rent', 'Apps/Subscription', 'Legal & Accounting', 'Government benefits', 'Custom Reminder'];
const FREQUENCIES = ['One-time', 'Daily', 'Weekly', 'Monthly', 'Yearly'];

const ReminderModal = ({ isOpen, onClose, reminder = null, selectedDate = null }) => {
  const { addReminder, updateReminder } = useContext(ExpensesContext);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    type: 'Utilities',
    customType: '',
    date: selectedDate || new Date().toISOString().split('T')[0],
    time: '',
    frequency: 'One-time',
    notes: ''
  });

  useEffect(() => {
    if (reminder) {
      setFormData(reminder);
    } else if (selectedDate) {
      setFormData(prev => ({ ...prev, date: selectedDate }));
    }
  }, [reminder, selectedDate, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.type === 'Custom Reminder' && !formData.customType) {
      toast({ title: "Error", description: "Please specify custom type", variant: "destructive" });
      return;
    }
    
    if (reminder) {
      updateReminder(reminder.id, formData);
      toast({ title: "Success", description: "Reminder updated." });
    } else {
      addReminder(formData);
      toast({ title: "Success", description: "Reminder added." });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{reminder ? 'Edit Reminder' : 'Add Reminder'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Reminder Type</Label>
            <select name="type" value={formData.type} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {formData.type === 'Custom Reminder' && (
              <Input placeholder="Enter custom type" name="customType" value={formData.customType} onChange={handleChange} required />
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Time (Optional)</Label>
              <Input type="time" name="time" value={formData.time} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <select name="frequency" value={formData.frequency} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Add any details here..." rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Reminder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderModal;