import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame } from 'lucide-react';

// Urgency badge for limited time offers
export function UrgencyBadge({ endDate, language = 'en', type = 'countdown' }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  
  const labels = {
    en: {
      ending: 'Offer ends in',
      limited: 'Limited time offer',
      lastChance: 'Last chance!',
      hours: 'h',
      minutes: 'm',
      seconds: 's'
    },
    fr: {
      ending: 'Offre expire dans',
      limited: 'Offre limitée',
      lastChance: 'Dernière chance !',
      hours: 'h',
      minutes: 'm',
      seconds: 's'
    },
    ar: {
      ending: 'ينتهي العرض في',
      limited: 'عرض محدود',
      lastChance: 'فرصة أخيرة!',
      hours: 'س',
      minutes: 'د',
      seconds: 'ث'
    }
  };
  
  const t = labels[language] || labels.en;
  
  useEffect(() => {
    // Default: 48 hours from now if no endDate provided
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 48 * 60 * 60 * 1000);
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = end - now;
      
      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      };
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [endDate]);
  
  const isUrgent = timeLeft.hours < 24;
  
  if (type === 'simple') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full"
      >
        <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
        <span className="text-sm font-medium text-orange-300">
          {t.limited}
        </span>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl ${
        isUrgent 
          ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/40' 
          : 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40'
      }`}
    >
      <div className="flex items-center gap-2">
        {isUrgent ? (
          <Flame className="w-5 h-5 text-red-400 animate-pulse" />
        ) : (
          <Clock className="w-5 h-5 text-amber-400" />
        )}
        <span className={`text-sm font-medium ${isUrgent ? 'text-red-300' : 'text-amber-300'}`}>
          {isUrgent ? t.lastChance : t.ending}
        </span>
      </div>
      
      <div className="flex items-center gap-1 font-mono">
        <div className={`px-2 py-1 rounded ${isUrgent ? 'bg-red-500/30' : 'bg-amber-500/30'}`}>
          <span className={`text-lg font-bold ${isUrgent ? 'text-red-300' : 'text-amber-300'}`}>
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-xs text-slate-400">{t.hours}</span>
        </div>
        <span className={isUrgent ? 'text-red-400' : 'text-amber-400'}>:</span>
        <div className={`px-2 py-1 rounded ${isUrgent ? 'bg-red-500/30' : 'bg-amber-500/30'}`}>
          <span className={`text-lg font-bold ${isUrgent ? 'text-red-300' : 'text-amber-300'}`}>
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-xs text-slate-400">{t.minutes}</span>
        </div>
        <span className={isUrgent ? 'text-red-400' : 'text-amber-400'}>:</span>
        <div className={`px-2 py-1 rounded ${isUrgent ? 'bg-red-500/30' : 'bg-amber-500/30'}`}>
          <span className={`text-lg font-bold ${isUrgent ? 'text-red-300' : 'text-amber-300'}`}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-xs text-slate-400">{t.seconds}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default UrgencyBadge;
