import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Crown, Rocket } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../App';
import { useTranslation } from 'react-i18next';

const tierIcons = {
  pro: Rocket,
  elite: Crown
};

const tierPrices = {
  pro: '€19.99',
  elite: '€25.00'
};

export const SubscriptionGate = ({
  requiredTier,
  feature,
  children
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const tierOrder = ['free', 'pro', 'elite'];
  const userTier = user?.subscription_tier || 'free';
  const userTierIndex = tierOrder.indexOf(userTier);
  const requiredTierIndex = tierOrder.indexOf(requiredTier);

  // Check if subscription is expired
  const isExpired = user?.subscription_expires &&
    new Date(user.subscription_expires) < new Date();

  const hasAccess = !isExpired && userTierIndex >= requiredTierIndex;

  if (hasAccess) {
    return children;
  }

  const Icon = tierIcons[requiredTier] || Lock;
  const tierNames = {
    pro: 'Pro',
    elite: 'Elite'
  };

  return (
    <motion.div
      className="min-h-[60vh] flex items-center justify-center px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      data-testid={`subscription-gate-${requiredTier}`}
    >
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Icon className="w-10 h-10 text-primary" />
        </div>

        <h2 className="font-heading text-2xl font-bold mb-3">
          {t('subscriptionGate.title')}
        </h2>

        <p className="text-slate-400 mb-6">
          {t('subscriptionGate.message', { feature, tier: tierNames[requiredTier] })}
        </p>

        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Icon className="w-6 h-6 text-primary" />
            <span className="font-heading font-bold text-lg">{tierNames[requiredTier]}</span>
            <span className="text-slate-400">{tierPrices[requiredTier]}{t('subscriptionGate.perMonth')}</span>
          </div>

          {requiredTier === 'pro' && (
            <ul className="text-sm text-slate-300 space-y-2 text-left">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {t('subscriptionGate.proFeature1')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {t('subscriptionGate.proFeature2')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {t('subscriptionGate.proFeature3')}
              </li>
            </ul>
          )}

          {requiredTier === 'elite' && (
            <ul className="text-sm text-slate-300 space-y-2 text-left">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {t('subscriptionGate.eliteFeature1')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {t('subscriptionGate.eliteFeature2')}
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {t('subscriptionGate.eliteFeature3')}
              </li>
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <Link to="/pricing">
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              data-testid="subscription-gate-upgrade-btn"
            >
              {t('subscriptionGate.viewPlans')}
            </Button>
          </Link>

          {!user && (
            <Link to="/login">
              <Button variant="outline" className="w-full" data-testid="subscription-gate-login-btn">
                {t('subscriptionGate.signIn')}
              </Button>
            </Link>
          )}
        </div>

        {isExpired && (
          <p className="text-sm text-amber-500 mt-4">
            {t('subscriptionGate.expired')}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// Hook to check subscription access
export const useSubscriptionAccess = () => {
  const { user } = useAuth();

  const tierOrder = ['free', 'pro', 'elite'];
  const userTier = user?.subscription_tier || 'free';
  const userTierIndex = tierOrder.indexOf(userTier);

  const isExpired = user?.subscription_expires &&
    new Date(user.subscription_expires) < new Date();

  const hasAccess = (requiredTier) => {
    if (isExpired) return false;
    const requiredIndex = tierOrder.indexOf(requiredTier);
    return userTierIndex >= requiredIndex;
  };

  const canAccessCourse = (level) => {
    if (isExpired) return level === 1;
    if (userTier === 'free') return level === 1;
    return true; // pro and elite can access all
  };

  return {
    userTier: isExpired ? 'free' : userTier,
    hasAccess,
    canAccessCourse,
    canAccessPremiumCourses: hasAccess('pro'),
    canAccessSimulator: hasAccess('pro'),
    canAccessExams: hasAccess('pro'),
    canAccessCertificates: hasAccess('pro'),
    canAccessAIMentor: hasAccess('elite'),
    isExpired
  };
};

export default SubscriptionGate;
