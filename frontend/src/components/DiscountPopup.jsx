import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Mail, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

// Discount popup - shows once, after 30s or 50% scroll
export function DiscountPopup({ language = 'en' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const DISCOUNT_CODE = 'CRYPTO15';
  const STORAGE_KEY = 'discount_popup_shown';
  
  const labels = {
    en: {
      title: 'Wait! Get 15% OFF',
      subtitle: 'Your first month subscription',
      description: 'Enter your email and get an exclusive discount code for your first month. Join thousands of crypto learners!',
      placeholder: 'Enter your email',
      cta: 'Get My 15% OFF',
      success: 'Your discount code:',
      copy: 'Code copied!',
      note: 'Use this code at checkout',
      noThanks: 'No thanks, I\'ll pay full price'
    },
    fr: {
      title: 'Attendez ! -15%',
      subtitle: 'Sur votre premier mois',
      description: 'Entrez votre email et obtenez un code de réduction exclusif pour votre premier mois. Rejoignez des milliers d\'apprenants crypto !',
      placeholder: 'Entrez votre email',
      cta: 'Obtenir mes -15%',
      success: 'Votre code promo :',
      copy: 'Code copié !',
      note: 'Utilisez ce code au checkout',
      noThanks: 'Non merci, je paierai le plein tarif'
    },
    ar: {
      title: 'انتظر! خصم 15%',
      subtitle: 'على اشتراكك الأول',
      description: 'أدخل بريدك الإلكتروني واحصل على رمز خصم حصري لشهرك الأول.',
      placeholder: 'أدخل بريدك الإلكتروني',
      cta: 'احصل على خصم 15%',
      success: 'رمز الخصم الخاص بك:',
      copy: 'تم نسخ الرمز!',
      note: 'استخدم هذا الرمز عند الدفع',
      noThanks: 'لا شكرًا'
    }
  };
  
  const t = labels[language] || labels.en;
  
  useEffect(() => {
    // Check if popup was already shown
    const wasShown = localStorage.getItem(STORAGE_KEY);
    if (wasShown) return;
    
    let triggered = false;
    
    // Trigger after 30 seconds
    const timer = setTimeout(() => {
      if (!triggered) {
        triggered = true;
        setIsVisible(true);
      }
    }, 30000);
    
    // Trigger on 50% scroll
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50 && !triggered) {
        triggered = true;
        setIsVisible(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error(language === 'fr' ? 'Email invalide' : 'Invalid email');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call (in production, save email to database/newsletter service)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsSubmitted(true);
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.setItem('discount_email', email);
  };
  
  const copyCode = () => {
    navigator.clipboard.writeText(DISCOUNT_CODE);
    toast.success(t.copy);
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
            onClick={handleClose}
          >
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md mt-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-br from-card via-card to-primary/10 border border-primary/30 rounded-2xl p-6 shadow-2xl shadow-primary/20">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse bg-primary/50 rounded-full blur-xl" />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
              
              {!isSubmitted ? (
                <div className="mt-8 text-center">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {t.title}
                  </h2>
                  <p className="text-primary font-semibold text-lg mb-4">
                    {t.subtitle}
                  </p>
                  <p className="text-slate-400 text-sm mb-6">
                    {t.description}
                  </p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.placeholder}
                        className="pl-10 h-12 bg-muted/50"
                        data-testid="discount-email-input"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white font-bold"
                      data-testid="discount-submit-btn"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          {t.cta}
                        </span>
                      )}
                    </Button>
                  </form>
                  
                  <button
                    onClick={handleClose}
                    className="mt-4 text-xs text-slate-500 hover:text-slate-400 transition-colors"
                  >
                    {t.noThanks}
                  </button>
                </div>
              ) : (
                <div className="mt-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mb-2">
                    {t.success}
                  </h2>
                  
                  <button
                    onClick={copyCode}
                    className="group my-4 px-6 py-3 bg-gradient-to-r from-primary/20 to-purple-500/20 border-2 border-dashed border-primary rounded-xl hover:border-solid transition-all cursor-pointer"
                    data-testid="discount-code-display"
                  >
                    <span className="text-3xl font-mono font-bold text-primary group-hover:scale-105 transition-transform inline-block">
                      {DISCOUNT_CODE}
                    </span>
                  </button>
                  
                  <p className="text-sm text-slate-400 mb-4">
                    {t.note}
                  </p>
                  
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="w-full"
                  >
                    {language === 'fr' ? 'Continuer' : 'Continue'}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
          </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DiscountPopup;
