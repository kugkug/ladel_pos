import React from 'react';
import { motion } from 'framer-motion';

const SummaryMetricsCard = ({ title, value, subtitle, icon: Icon, gradient, isCurrency }) => {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`rounded-2xl p-6 shadow-lg bg-gradient-to-br ${gradient} text-white relative overflow-hidden`}
    >
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-sm font-medium opacity-90 mb-1 tracking-wide uppercase">{title}</p>
          <h3 className="text-3xl font-bold mb-1">
            {value}
          </h3>
          {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
        </div>
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
    </motion.div>
  );
};

export default SummaryMetricsCard;