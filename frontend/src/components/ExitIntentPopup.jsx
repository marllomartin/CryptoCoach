import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Gift, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

// Exit Intent Popup - Detects when user is about to leave
export function ExitIntentPopup({ language = 'en' }) {
  const [isVisible, setIsVisible] = useState(false);
  const hasTriggeredRef = useRef(false);
  const navigate = useNavigate();
  
  const STORAGE_KEY = 'exit_intent_shown';
  
  const labels = {
    en: {
      title: "Wait! Don't leave yet",
      subtitle: 'You were so close to starting your crypto journey!',
      description: "Get a special offer: Subscribe now and get your first month at 50% off. Don't miss this opportunity to transform your financial future.",
      cta: 'Claim 50% OFF',
      secondary: 'Continue browsing',
      urgency: 'This offer expires in 10 minutes'
    },
    fr: {
      title: "Attendez ! Ne partez pas",
      subtitle: 'Vous étiez si proche de commencer votre parcours crypto !',
      description: "Offre spéciale : Abonnez-vous maintenant et obtenez votre premier mois à -50%. Ne manquez pas cette opportunité de transformer votre avenir financier.",
      cta: 'Obtenir -50%',
      secondary: 'Continuer la navigation',
      urgency: 'Cette offre expire dans 10 minutes'
    },
    ar: {
      title: 'انتظر! لا تغادر بعد',
      subtitle: 'كنت قريبًا جدًا من بدء رحلتك في العملات المشفرة!',
      description: 'عرض خاص: اشترك الآن واحصل على الشهر الأول بخصم 50%. لا تفوت هذه الفرصة لتحويل مستقبلك المالي.',
      cta: 'احصل على خصم 50%',
      secondary: 'متابعة التصفح',
      urgency: 'ينتهي هذا العرض خلال 10 دقائق'
    }
  };
  
  const t = labels[language] || labels.en;
  
  useEffect(() => {
    // Check if already shown
    const wasShown = localStorage.getItem(STORAGE_KEY);
    if (wasShown) return;
    
    const handleMouseLeave = (e) => {
      // Detect if mouse is leaving through the top of the page
      if (e.clientY <= 0 && !hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        setIsVisible(true);
      }
    };
    
    // Add delay before enabling detection
    const timeout = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000); // Wait 5 seconds before enabling
    
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };
  
  const handleClaim = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.setItem('exit_discount_code', 'EXIT50');
    navigate('/pricing');
    setIsVisible(false);
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-full max-w-lg p-4"
          >
            <div className="relative bg-gradient-to-br from-card via-card to-red-500/10 border-2 border-red-500/30 rounded-2xl p-8 shadow-2xl shadow-red-500/20">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
              
              {/* Warning icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ 
                    duration: 0.5,
                    repeat: 2
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
              </div>
              
              {/* Content */}
              <div className={`text-center ${language === 'ar' ? 'rtl' : ''}`}>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {t.title}
                </h2>
                <p className="text-lg text-red-400 font-semibold mb-4">
                  {t.subtitle}
                </p>
                <p className="text-slate-400 text-sm mb-6">
                  {t.description}
                </p>
                
                {/* Urgency */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full mb-6">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-red-400 font-medium">{t.urgency}</span>
                </div>
                
                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleClaim}
                    className="w-full h-14 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-lg font-bold"
                    data-testid="exit-intent-cta"
                  >
                    <Gift className="w-5 h-5 mr-2" />
                    {t.cta}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <button
                    onClick={handleClose}
                    className="w-full text-sm text-slate-500 hover:text-slate-400 transition-colors py-2"
                  >
                    {t.secondary}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ExitIntentPopup;
