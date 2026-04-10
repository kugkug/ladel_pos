import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/sales/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Auth context resetPassword automatically prevents sending emails to unauthorized accounts
    // but still returns success=true to prevent email enumeration.
    const result = await resetPassword(email);
    setIsSubmitting(false);
    
    if (result.success) {
      setMessage('If this email is registered, you will receive a password reset link. Check your email for password reset instructions.');
    } else {
      setError(result.error || 'Failed to send reset link.');
    }
  };

  return (
    <div className="min-h-screen bg-[#2C3E50] flex flex-col justify-center items-center p-4">
      <Helmet><title>Forgot Password - APEX Hub</title></Helmet>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
        <Link to="/login" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-[#1B4D5C] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
        </Link>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-gray-600 mb-8 text-sm">Enter your authorized email address to receive password reset instructions.</p>

        {error && (
          <div className="mb-6 p-4 bg-[#E74C3C]/10 border border-[#E74C3C]/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#E74C3C] shrink-0 mt-0.5" />
            <p className="text-sm text-[#E74C3C] font-medium">{error}</p>
          </div>
        )}

        {message ? (
          <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-green-800 font-medium">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">Email Address</Label>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@apexph.com"
                className="w-full px-4 py-6 border-gray-200 focus-visible:ring-[#FF6B35] text-gray-900"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#1B4D5C] hover:bg-[#1B4D5C]/90 text-white py-6 text-lg font-bold shadow-lg transition-transform hover:scale-[1.02] disabled:hover:scale-100 rounded-xl"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;