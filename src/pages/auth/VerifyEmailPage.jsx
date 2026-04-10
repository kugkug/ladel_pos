import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet';

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'your email address';
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/sales/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = () => {
    setIsResending(true);
    // Simulate resend API call
    setTimeout(() => {
      setIsResending(false);
      setCountdown(60);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#2C3E50] flex flex-col justify-center items-center p-4">
      <Helmet><title>Verify Email - APEX Hub</title></Helmet>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-[#5DADE2]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-[#1B4D5C]" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          We've sent a verification link to <br/><span className="font-bold text-gray-900">{email}</span>. 
          Please click the link to verify your account.
        </p>

        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={handleResend}
            disabled={countdown > 0 || isResending}
            className="w-full py-6 text-base font-semibold border-gray-200"
          >
            {isResending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {countdown > 0 ? `Resend email in ${countdown}s` : 'Resend Verification Email'}
          </Button>
          
          <Link to="/login" className="flex items-center justify-center text-[#5DADE2] hover:text-[#1B4D5C] font-semibold transition-colors mt-6">
            Back to login <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;