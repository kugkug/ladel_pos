import React from 'react';
import { ArrowLeft, FileText, Landmark, Coins as HandCoins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClassificationSelectionScreen = ({ onSelect }) => {
  const navigate = useNavigate();

  const classifications = [
    {
      id: 'Regular Expense',
      title: 'Regular Expenses',
      description: 'Record standard business expenses, supplier payments, utilities, and operating costs.',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-500'
    },
    {
      id: 'Funding',
      title: 'Funding',
      description: 'Record capital injections, bank loans, or other sources of business funding.',
      icon: Landmark,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-500'
    },
    {
      id: 'Reimbursement/Profit Share',
      title: 'Reimbursement or Profit Share',
      description: 'Process employee reimbursements, owner draws, and profit sharing distributions.',
      icon: HandCoins,
      color: 'bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-500'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/expenses')} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Select Classification</h1>
          <p className="text-gray-500 mt-1">Choose the type of financial record you want to create</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {classifications.map((item) => (
          <div 
            key={item.id}
            className={`flex flex-col p-6 rounded-2xl border-2 transition-all cursor-pointer bg-white shadow-sm hover:shadow-md group ${item.color.split(' ').slice(2).join(' ')}`}
            onClick={() => onSelect(item.id)}
          >
            <div className={`p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 ${item.color.split(' ').slice(0, 2).join(' ')}`}>
              <item.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm flex-grow mb-6">{item.description}</p>
            <button className={`w-full py-2.5 rounded-lg font-semibold text-white shadow-sm transition-all group-hover:scale-[1.02] ${item.color.includes('blue') ? 'bg-blue-600 hover:bg-blue-700' : item.color.includes('emerald') ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-600 hover:bg-purple-700'}`}>
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassificationSelectionScreen;