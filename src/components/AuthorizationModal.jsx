import React, { useState, useContext } from 'react';
import { AuthorizationContext } from '@/contexts/AuthorizationContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock, X } from 'lucide-react';

const AuthorizationModal = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useContext(AuthorizationContext);
  const [username, setUsername] = useState('Alex');
  const [password, setPassword] = useState('Aless@ndr0');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Lock className="w-4 h-4" />
            <span className="font-semibold">Authorization Required</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label className="text-gray-700">Username</Label>
            <input required value={username} onChange={e => setUsername(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
          </div>
          <div>
            <Label className="text-gray-700">Password</Label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Authorize</Button>
        </form>
      </div>
    </div>
  );
};

export default AuthorizationModal;