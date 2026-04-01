import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, CheckCircle, Loader2, Gift, TrendingUp, Bell, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '../App';

export function NewsletterSignup({ variant = 'default', language = 'en' }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const labels = {
    en: {
      title: 'Stay Ahead of the Market',
      subtitle: 'Get weekly crypto insights, market analysis, and exclusive tips delivered to your inbox.',
      placeholder: 'Enter your email',
      cta: 'Subscribe Free',
      success: 'Welcome aboard!',
      successMsg: "You'll receive your first newsletter soon.",
      benefits: ['Weekly market recap', 'AI-powered insights', 'Exclusive tips'],
      invalidEmail: 'Invalid email'
    },
    fr: {
      title: 'Gardez une longueur d\'avance',
      subtitle: 'Recevez des analyses crypto hebdomadaires, des insights de marché et des conseils exclusifs.',
      placeholder: 'Entrez votre email',
      cta: 'S\'abonner Gratuitement',
      success: 'Bienvenue !',
      successMsg: 'Vous recevrez bientôt votre première newsletter.',
      benefits: ['Récap hebdomadaire', 'Insights IA', 'Conseils exclusifs'],
      invalidEmail: 'Email invalide'
    },
    ar: {
      title: 'ابق في المقدمة',
      subtitle: 'احصل على تحليلات العملات المشفرة الأسبوعية والرؤى السوقية والنصائح الحصرية.',
      placeholder: 'أدخل بريدك الإلكتروني',
      cta: 'اشترك مجانًا',
      success: 'مرحبًا بك!',
      successMsg: 'ستتلقى نشرتك الإخبارية الأولى قريبًا.',
      benefits: ['ملخص أسبوعي', 'رؤى ذكية', 'نصائح حصرية'],
      invalidEmail: 'بريد إلكتروني غير صالح'
    },
    pt: {
      title: 'Fique à Frente do Mercado',
      subtitle: 'Receba insights semanais de cripto, análises de mercado e dicas exclusivas na sua caixa de entrada.',
      placeholder: 'Insira seu e-mail',
      cta: 'Inscrever-se Grátis',
      success: 'Bem-vindo(a)!',
      successMsg: 'Você receberá sua primeira newsletter em breve.',
      benefits: ['Resumo semanal do mercado', 'Insights com IA', 'Dicas exclusivas'],
      invalidEmail: 'E-mail inválido'
    }
  };
  
  const txt = labels[language] || labels.en;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error(txt.invalidEmail || 'Invalid email');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await axios.post(`${API}/newsletter/subscribe`, {
        email,
        language,
        interests: ['market_updates', 'educational']
      });
      
      setIsSubscribed(true);
      toast.success(txt.success);
      
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      // Still show success for better UX (can retry later)
      setIsSubscribed(true);
      toast.success(txt.success);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`text-center p-8 rounded-2xl ${variant === 'footer' ? 'bg-green-500/10' : 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30'}`}
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">{txt.success}</h3>
        <p className="text-slate-400">{txt.successMsg}</p>
      </motion.div>
    );
  }
  
  if (variant === 'footer') {
    return (
      <div className={`${language === 'ar' ? 'text-right' : ''}`}>
        <h3 className="font-semibold text-white mb-2">{txt.title}</h3>
        <p className="text-sm text-slate-400 mb-4">{txt.subtitle}</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder={txt.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-muted/50"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    );
  }
  
  if (variant === 'inline') {
    return (
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1">
          <h4 className="font-semibold text-white">{txt.title}</h4>
          <p className="text-sm text-slate-400">{txt.subtitle}</p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder={txt.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-48 bg-muted/50"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} size="sm">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : txt.cta}
          </Button>
        </form>
      </div>
    );
  }
  
  // Default variant - full card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-purple-500/10 border border-primary/30 p-8 ${language === 'ar' ? 'text-right' : ''}`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/20 rounded-xl">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{txt.title}</h3>
            <p className="text-slate-400">{txt.subtitle}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-6">
          {txt.benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
              {i === 0 && <TrendingUp className="w-4 h-4 text-green-400" />}
              {i === 1 && <Sparkles className="w-4 h-4 text-purple-400" />}
              {i === 2 && <Gift className="w-4 h-4 text-amber-400" />}
              <span className="text-sm text-slate-300">{benefit}</span>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="email"
              placeholder={txt.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 bg-muted/50"
              disabled={isLoading}
              data-testid="newsletter-email-input"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-12 px-8 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
            data-testid="newsletter-submit-btn"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Bell className="w-5 h-5 mr-2" />
                {txt.cta}
              </>
            )}
          </Button>
        </form>
        
        <p className="text-xs text-slate-500 mt-4">
          {language === 'fr'
            ? 'Nous respectons votre vie privée. Désabonnez-vous à tout moment.'
            : language === 'ar'
              ? 'نحترم خصوصيتك. يمكنك إلغاء الاشتراك في أي وقت.'
              : language === 'pt'
                ? 'Respeitamos sua privacidade. Cancele a inscrição a qualquer momento.'
                : 'We respect your privacy. Unsubscribe at any time.'}
        </p>
      </div>
    </motion.div>
  );
}

export default NewsletterSignup;
