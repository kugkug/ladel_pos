import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { FileText, RefreshCcw, Building, Coins, ChevronRight } from 'lucide-react';

const ExpensesDataEntry = () => {
  const navigate = useNavigate();

  const options = [
    {
      id: 'regular-expenses',
      title: 'Regular Expenses',
      description: 'Record standard operational and business expenses like supplies, rent, and utilities.',
      icon: FileText,
      color: 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white',
      border: 'hover:border-emerald-500'
    },
    {
      id: 'reimbursement',
      title: 'Reimbursement',
      description: 'Log out-of-pocket expenses reimbursed to personnel or partners.',
      icon: RefreshCcw,
      color: 'bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white',
      border: 'hover:border-amber-500'
    },
    {
      id: 'capitalisation',
      title: 'Capitalisation',
      description: 'Record funding injections or capital additions to the business accounts.',
      icon: Building,
      color: 'bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white',
      border: 'hover:border-blue-500'
    },
    {
      id: 'dividends',
      title: 'Dividends',
      description: 'Log profit shares and dividend distributions made to owners/shareholders.',
      icon: Coins,
      color: 'bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white',
      border: 'hover:border-purple-500'
    }
  ];

  return (
    <>
      <Helmet><title>Data Entry - Expenses</title></Helmet>
      
      <div className="animate-in fade-in duration-300 max-w-6xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Select Entry Type</h1>
            <p className="text-gray-500 mt-1">Choose the classification for your new financial record</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((option) => (
            <div 
              key={option.id}
              onClick={() => navigate(`/expenses/data-entry/${option.id}`)}
              className={`bg-white p-6 rounded-2xl border-2 border-transparent shadow-sm cursor-pointer transition-all duration-300 group hover:shadow-md ${option.border}`}
            >
              <div className="flex items-start gap-5">
                <div className={`p-4 rounded-xl transition-colors duration-300 ${option.color}`}>
                  <option.icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {option.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transform group-hover:translate-x-1 transition-all mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ExpensesDataEntry;