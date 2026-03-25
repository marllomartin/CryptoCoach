import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import HCaptcha from '@hcaptcha/react-hcaptcha';

const COMMON_PASSWORDS = new Set([
  'password','123456','12345678','qwerty','abc123',
  'monkey','master','dragon','letmein','login',
  'admin','welcome','password1','bitcoin','crypto'
]);

function getPasswordRules(password) {
  return {
    minLength:   password.length >= 8,
    maxLength:   password.length <= 128,
    notCommon:   !COMMON_PASSWORDS.has(password.toLowerCase()),
    hasUpper:    /[A-Z]/.test(password),
    hasLower:    /[a-z]/.test(password),
    hasDigit:    /\d/.test(password),
    hasSpecial:  /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

function isPasswordValid(rules) {
  const complexity = [rules.hasUpper, rules.hasLower, rules.hasDigit, rules.hasSpecial].filter(Boolean).length;
  return rules.minLength && rules.maxLength && rules.notCommon && complexity >= 3;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const captchaRef = useRef(null);

  // Redirect if already logged in
  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const rules = getPasswordRules(formData.password);
    if (!isPasswordValid(rules)) {
      toast.error('Password does not meet the requirements');
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.full_name);
      toast.success('Account created! Welcome to TheCryptoCoach!');
      navigate('/dashboard');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Registration failed');
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "Access to all free courses",
    "Track your learning progress",
    "Earn certificates",
    "AI-powered mentorship"
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-glow opacity-30" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <span className="font-heading font-bold text-2xl">TheCryptoCoach</span>
        </Link>

        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl">Create Account</CardTitle>
            <CardDescription>Start your crypto education journey today</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Benefits */}
            <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium mb-2">What you'll get:</p>
              <ul className="space-y-1">
                {benefits.map(benefit => (
                  <li key={benefit} className="text-sm text-slate-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-muted border-border h-12"
                    data-testid="register-name-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-muted border-border h-12"
                    data-testid="register-email-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10 bg-muted border-border h-12"
                    data-testid="register-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.password && (() => {
                  const r = getPasswordRules(formData.password);
                  const complexity = [r.hasUpper, r.hasLower, r.hasDigit, r.hasSpecial].filter(Boolean).length;
                  const rules = [
                    { label: 'At least 8 characters', ok: r.minLength },
                    { label: 'Uppercase letter (A–Z)', ok: r.hasUpper },
                    { label: 'Lowercase letter (a–z)', ok: r.hasLower },
                    { label: 'Number (0–9)', ok: r.hasDigit },
                    { label: 'Special character (!@#$...)', ok: r.hasSpecial },
                    { label: 'Not a common password', ok: r.notCommon },
                  ];
                  return (
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-1">
                      <p className="text-xs text-slate-400 mb-2">
                        Complexity: <span className={complexity >= 3 ? 'text-green-400' : 'text-amber-400'}>{complexity}/4</span> (need 3+)
                      </p>
                      {rules.map(({ label, ok }) => (
                        <div key={label} className="flex items-center gap-2">
                          {ok
                            ? <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                            : <XCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}
                          <span className={`text-xs ${ok ? 'text-green-400' : 'text-slate-500'}`}>{label}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`pl-10 bg-muted border-border h-12 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-green-500 focus-visible:ring-green-500'
                        : ''
                    }`}
                    data-testid="register-confirm-password-input"
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <div className="flex items-center gap-1.5 text-red-400 text-xs">
                    <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    Passwords do not match
                  </div>
                )}
              </div>

              {/* CAPTCHA */}
              <HCaptcha
                sitekey={process.env.REACT_APP_HCAPTCHA_SITE_KEY}
                onVerify={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
                ref={captchaRef}
                theme="dark"
              />

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-lg mt-6"
                disabled={loading || !captchaToken || !isPasswordValid(getPasswordRules(formData.password)) || formData.password !== formData.confirmPassword}
                data-testid="register-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Free Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-primary hover:underline">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
}
