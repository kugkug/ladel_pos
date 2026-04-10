import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2, AlertCircle, Hexagon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { loginWithCredentials, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || "/home";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      setPassword('');
      return;
    }
    
    if (!trimmedPassword) {
      setError('Please enter your password.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await loginWithCredentials(trimmedEmail, trimmedPassword, rememberMe);
      
      if (result.success) {
        toast({ title: "Welcome back!", description: "Successfully logged in." });
        navigate(from, { replace: true });
      } else {
        // Now accurately displays "User not found" thanks to AuthContext updates
        setError(result.error || 'Invalid email or password');
        setPassword('');
      }
    } catch (err) {
      console.error('Login exception:', err);
      setError('A network error occurred. Please check your connection and try again.');
      setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2C3E50] flex flex-col justify-center items-center p-4">
      <Helmet><title>Login - APEX Hub</title></Helmet>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-[#1B4D5C] p-8 text-center border-b border-white/10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-[#FF6B35] p-2 rounded-xl shadow-md">
              <Hexagon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">APEX <span className="text-[#5DADE2]">Hub</span></h1>
          </div>
          <p className="text-[#5DADE2] text-sm">Sign in to your authorized account</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-[#E74C3C]/10 border border-[#E74C3C]/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-[#E74C3C] shrink-0 mt-0.5" />
              <p className="text-sm text-[#E74C3C] font-medium">{error}</p>
            </div>
          )}

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

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-gray-700 font-semibold">Password</Label>
                <Link to="/forgot-password" className="text-sm font-medium text-[#5DADE2] hover:text-[#1B4D5C] transition-colors">Forgot password?</Link>
              </div>
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
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked)}
                className="border-gray-300 data-[state=checked]:bg-[#FF6B35] data-[state=checked]:border-[#FF6B35]" 
              />
              <label htmlFor="remember" className="text-sm font-medium text-gray-600 leading-none cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white py-6 text-lg font-bold shadow-lg transition-transform hover:scale-[1.02] disabled:hover:scale-100 rounded-xl"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;