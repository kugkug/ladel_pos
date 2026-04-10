import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2, AlertCircle, Hexagon, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';

const SignupPage = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '', terms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.fullName.length < 2) return setError('Full name must be at least 2 characters.');
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return setError('Please enter a valid email.');
    if (formData.password.length < 8 || !/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      return setError('Password must be at least 8 characters and include uppercase, lowercase, and numbers.');
    }
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');
    if (!formData.terms) return setError('Please accept the Terms & Conditions.');
    
    setIsSubmitting(true);
    const result = await signup(formData.email, formData.password, formData.fullName);
    
    if (result.success) {
      if (result.isFirst) {
        toast({ title: "Welcome!", description: "You are the first user - Account created as OWNER" });
      } else {
        toast({ title: "Account Created", description: "Account created as STAFF - Awaiting verification." });
      }
      navigate('/verify-email', { state: { email: formData.email } });
    } else {
      setError(result.error || 'Failed to create account. Email might already exist.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2C3E50] flex flex-col justify-center items-center p-4 py-12">
      <Helmet><title>Sign Up - APEX Hub</title></Helmet>
      
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-[#1B4D5C] p-8 text-center border-b border-white/10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-[#FF6B35] p-2 rounded-xl shadow-md">
              <Hexagon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">APEX <span className="text-[#5DADE2]">Hub</span></h1>
          </div>
          <p className="text-[#5DADE2] text-sm">Create your workspace account</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-[#E74C3C]/10 border border-[#E74C3C]/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#E74C3C] shrink-0 mt-0.5" />
              <p className="text-sm text-[#E74C3C] font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">Full Name</Label>
              <Input 
                value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
                placeholder="John Doe" className="w-full px-4 py-5 border-gray-200 focus-visible:ring-[#FF6B35] text-gray-900" required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">Email Address</Label>
              <Input 
                type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="name@company.com" className="w-full px-4 py-5 border-gray-200 focus-visible:ring-[#FF6B35] text-gray-900" required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-semibold">Password</Label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••" className="w-full px-4 py-5 border-gray-200 focus-visible:ring-[#FF6B35] text-gray-900 pr-12" required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
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
                type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="••••••••" className="w-full px-4 py-5 border-gray-200 focus-visible:ring-[#FF6B35] text-gray-900" required
              />
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox id="terms" checked={formData.terms} onCheckedChange={c => setFormData({...formData, terms: c})} className="border-gray-300 data-[state=checked]:bg-[#1B4D5C] mt-1" />
              <label htmlFor="terms" className="text-sm font-medium text-gray-600 leading-snug cursor-pointer">
                I agree to the <span className="text-[#5DADE2] hover:underline">Terms of Service</span> and <span className="text-[#5DADE2] hover:underline">Privacy Policy</span>.
              </label>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-[#1B4D5C] hover:bg-[#1B4D5C]/90 text-white py-6 text-lg font-bold shadow-lg transition-transform hover:scale-[1.02] disabled:hover:scale-100 rounded-xl mt-4">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#FF6B35] hover:text-[#1B4D5C] transition-colors">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;