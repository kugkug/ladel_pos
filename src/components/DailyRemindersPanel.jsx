import React, { useContext } from 'react';
import { format } from 'date-fns';
import { CalendarContext } from '@/contexts/CalendarContext';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DailyRemindersPanel = () => {
  const { reminders, deleteReminder } = useContext(CalendarContext);
  const { toast } = useToast();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Filter and sort today's reminders
  const todayReminders = reminders
    ?.filter(r => r.date === todayStr)
    ?.sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59')) || [];

  const handleComplete = (id) => {
    deleteReminder(id);
    toast({
      title: "Task Completed",
      description: "Reminder has been marked as complete.",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 bg-blue-50/30 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" /> Daily Reminders
          </h3>
          <p className="text-sm text-gray-500 mt-1">Your tasks scheduled for today</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
          {todayReminders.length} tasks
        </span>
      </div>

      <div className="p-2 flex-1 overflow-y-auto max-h-[400px]">
        {todayReminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No reminders for today.</p>
            <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayReminders.map((reminder) => (
              <div 
                key={reminder.id} 
                className="group flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all shadow-sm"
              >
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleComplete(reminder.id)}
                    className="mt-0.5 text-gray-300 hover:text-green-500 transition-colors"
                  >
                    <Circle className="w-5 h-5" />
                  </button>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                      {reminder.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {reminder.time && (
                        <span className="flex items-center text-xs font-medium text-gray-500">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {reminder.time}
                        </span>
                      )}
                      <span className="badge-pending bg-yellow-100 text-yellow-800 border-yellow-200">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleComplete(reminder.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Done
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyRemindersPanel;