import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LineChart, Wallet, BarChart3, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const HomeScreen = () => {
  const { toast } = useToast();

  const handleNotImplemented = (e) => {
    e.preventDefault();
    toast({
      title: "Module Upcoming",
      description: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const modules = [
    {
      id: 'sales',
      title: 'SALES MODULE',
      description: 'Sales Dashboard, Data Entry, Project Lists, Calendar, Reports, SOA and P&L.',
      icon: LineChart,
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/30',
      link: '/sales/dashboard',
      disabled: false
    },
    {
      id: 'expenses',
      title: 'EXPENSES MODULE',
      description: 'Track spending, manage suppliers, categorize costs, and monitor financial outflows.',
      icon: Wallet,
      color: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/30',
      link: '/expenses',
      disabled: false
    },
    {
      id: 'reports',
      title: 'REPORTS MODULE',
      description: 'Generate comprehensive financial statements, analytics, and business insights.',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-600',
      shadow: 'shadow-purple-500/30',
      link: '#',
      disabled: true
    }
  ];

  return (
    <>
      <Helmet>
        <title>Home - EnterpriseHub</title>
      </Helmet>
      <div className="min-h-[80vh] flex flex-col justify-center items-center py-16 px-4">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight"
          >
            EnterpriseHub <span className="text-blue-600">Portal</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600"
          >
            Select a module to manage your business operations securely and efficiently.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full">
          {modules.map((mod, index) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <Link 
                to={mod.disabled ? '#' : mod.link}
                onClick={mod.disabled ? handleNotImplemented : undefined}
                className="block h-full group"
              >
                <div className={`h-full relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2`}>
                  <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${mod.color}`}></div>
                  
                  <div className={`inline-flex p-4 rounded-xl mb-6 bg-gradient-to-br ${mod.color} ${mod.shadow} shadow-lg text-white`}>
                    <mod.icon className="w-8 h-8" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">{mod.title}</h2>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {mod.description}
                  </p>
                  
                  <div className={`flex items-center font-semibold mt-auto group-hover:gap-3 transition-all ${mod.disabled ? 'text-gray-400' : 'text-blue-600'}`}>
                    <span>Enter Module</span>
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HomeScreen;