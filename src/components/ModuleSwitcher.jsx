import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Wallet, BarChart3, Home } from 'lucide-react';
import { ModuleContext } from '@/contexts/ModuleContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const ModuleSwitcher = () => {
  const { activeModule } = useContext(ModuleContext);
  const { toast } = useToast();

  const handleNotImplemented = (e) => {
    e.preventDefault();
    toast({
      title: "Module Upcoming",
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const modules = [
    { id: 'home', icon: Home, path: '/', label: 'Home' },
    { id: 'sales', icon: LineChart, path: '/sales/dashboard', label: 'Sales' },
    { id: 'expenses', icon: Wallet, path: '/expenses', label: 'Expenses' },
    { id: 'reports', icon: BarChart3, path: '/reports', label: 'Reports', disabled: false },
  ];

  return (
    <div className="flex bg-gray-100/80 p-1.5 rounded-xl border border-gray-200 gap-1 overflow-x-auto">
      {modules.map((m) => {
        const isActive = activeModule === m.id;
        return (
          <Link
            key={m.id}
            to={m.path}
            onClick={m.disabled ? handleNotImplemented : undefined}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-3 rounded-lg min-w-[70px] transition-all flex-1",
              isActive 
                ? "bg-white shadow-sm text-blue-700 ring-1 ring-gray-200/50" 
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
            )}
          >
            <m.icon className={cn("w-5 h-5 mb-1", isActive ? "text-blue-600" : "text-gray-400")} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{m.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default ModuleSwitcher;