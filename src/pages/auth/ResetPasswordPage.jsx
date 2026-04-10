import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a hash fragment (Supabase uses hash fragment for implicit flow)
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      setHasToken(true);
    } else {
      // For testing in dev environment or normal flow, we'll just show the form
      // but in production we'd want to ensure session exists.
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setHasToken(true);
      });
    }
  }, []);

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { label: '', color: 'bg-gray-200', score: 0 };
    if (pass.length > 7) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score < 2) return { label: 'Weak', color: 'bg-red-500', score: 1 };
    if (score < 4) return { label: 'Fair', color: 'bg-yellow-500', score: 2 };
    if (score < 5) return { label: 'Good', color: 'bg-blue-500', score: 3 };
    return { label: 'Strong', color: 'bg-green-500', score: 4 };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return setError('Password must be at least 8 characters and include uppercase, lowercase, and numbers.');
    }
    if (password !== confirmPassword) return setError('Passwords do not match.');
    
    setIsSubmitting(true);
    const result = await updatePassword(password);
    
    if (result.success) {
      toast({ title: "Success", description: "Password reset successfully. You can now login." });
      navigate('/login');
    } else {
      setError(result.error || 'Failed to reset password.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2C3E50] flex flex-col justify-center items-center p-4">
      <Helmet><title>Create New Password - APEX Hub</title></Helmet>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
        <div className="mb-6 flex justify-center">
          <div className="bg-[#1B4D5C]/10 p-3 rounded-full">
            <CheckCircle2 className="w-8 h-8 text-[#1B4D5C]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Create New Password</h2>
        <p className="text-gray-600 mb-8 text-sm text-center">Your new password must be different from previous used passwords.</p>

        {error && (
          <div className="mb-6 p-4 bg-[#E74C3C]/10 border border-[#E74C3C]/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#E74C3C] shrink-0 mt-0.5" />
            <p className="text-sm text-[#E74C3C] font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-700 font-semibold">New Password</Label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-6 border-gray-200 focus-visible:ring-[#FF6B35] text-gray-900 pr-12"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 flex gap-1 h-1.5">
                  {[1,2,3,4].map(i => <div key={i} className={`flex-1 rounded-full ${i <= strength.score ? strength.color : 'bg-gray-200'}`}></div>)}
                </div>
                <span className={`text-xs font-bold w-12 text-right ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-semibold">Confirm Password</Label>
            <Input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-6 border-gray-200 focus-visible:ring-[#FF6B35] text-gray-900"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white py-6 text-lg font-bold shadow-lg transition-transform hover:scale-[1.02] disabled:hover:scale-100 rounded-xl"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;