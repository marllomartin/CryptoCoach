// Trial Badge Component
// Shows free trial status with countdown

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Gift, Lock, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function TrialBadge({
  trialStatus,
  onUpgradeClick,
  compact = false
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  if (!trialStatus) return null;
  
  const { 
    has_trial, 
    trial_active, 
    days_remaining, 
    is_preview_only,
    preview_seconds 
  } = trialStatus;
  
  // Paid user - no badge needed
  if (!has_trial && !is_preview_only) return null;
  
  // Active trial
  if (trial_active && days_remaining > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${compact ? 'inline-flex' : 'flex'} items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30`}
      >
        <Gift className="w-4 h-4 text-green-400" />
        <span className="text-sm font-medium text-green-400">
          {t('trialBadge.freeTrial')}
        </span>
        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full">
          <Clock className="w-3 h-3 text-green-300" />
          <span className="text-xs font-bold text-green-300">
            {t(days_remaining > 1 ? 'trialBadge.daysRemaining_other' : 'trialBadge.daysRemaining_one', { count: days_remaining })}
          </span>
        </div>
      </motion.div>
    );
  }
  
  // Trial expired or preview only
  if (is_preview_only) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className={`${compact ? 'inline-flex' : 'flex'} items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30`}>
          <Lock className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-400">
            {t('trialBadge.previewSeconds', { seconds: preview_seconds })}
          </span>
        </div>
        {!compact && (
          <Button
            size="sm"
            onClick={() => onUpgradeClick ? onUpgradeClick() : navigate('/pricing')}
            className="w-full bg-gradient-to-r from-primary to-purple-500 hover:opacity-90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t('trialBadge.unlockAccess')}
          </Button>
        )}
      </motion.div>
    );
  }
  
  return null;
}

// Countdown timer for trial
export function TrialCountdown({ endDate, onExpire }) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0 });
  
  React.useEffect(() => {
    if (!endDate) return;
    
    const calculateTimeLeft = () => {
      const end = new Date(endDate);
      const now = new Date();
      const diff = end - now;
      
      if (diff <= 0) {
        onExpire?.();
        return { days: 0, hours: 0, minutes: 0 };
      }
      
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      };
    };
    
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
    
    return () => clearInterval(timer);
  }, [endDate, onExpire]);
  
  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="w-4 h-4 text-green-400" />
      <span className="text-green-400">
        {timeLeft.days > 0 && `${timeLeft.days}${t('trialBadge.dayUnit')} `}
        {timeLeft.hours}{t('trialBadge.hourUnit')} {timeLeft.minutes}{t('trialBadge.minuteUnit')} {t('trialBadge.remaining')}
      </span>
    </div>
  );
}

export default TrialBadge;
