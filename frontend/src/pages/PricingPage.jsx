import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Rocket, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { useAuth, API } from '../App';
import { Testimonials } from '../components/Testimonials';
import { CouponInput } from '../components/CouponInput';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { SocialProof, SocialProofMini } from '../components/SocialProof';

const TIER_META = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    icon: Star,
    popular: false
  },
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 9.99,
    annualPrice: 79.99,
    icon: Zap,
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 19.99,
    annualPrice: 159.99,
    icon: Rocket,
    popular: false,
  },
  {
    id: 'elite',
    name: 'Elite',
    monthlyPrice: 25.00,
    annualPrice: 199.99,
    icon: Crown,
    popular: false,
    bestValue: true
  }
];

const PricingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token, refreshUser } = useAuth();
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const tiers = TIER_META.map(meta => {
    const featuresCount = { free: 5, starter: 6, pro: 6, elite: 5 };
    const count = featuresCount[meta.id];
    const features = Array.from({ length: count }, (_, i) =>
      t(`pricing.tiers.${meta.id}.feature${i + 1}`)
    );
    return {
      ...meta,
      description: t(`pricing.tiers.${meta.id}.description`),
      features,
      cta: t(`pricing.tiers.${meta.id}.cta`)
    };
  });

  // Check for payment success
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId && token) {
      pollPaymentStatus(sessionId);
    }
  }, [searchParams, token]);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      toast.error(t('pricing.checkingPayment'));
      setCheckingPayment(false);
      return;
    }

    setCheckingPayment(true);

    try {
      const response = await axios.get(
        `${API}/subscription/checkout-status/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.payment_status === 'paid') {
        toast.success(t('pricing.paymentSuccess'));
        await refreshUser();
        setCheckingPayment(false);
        // Clear URL params
        navigate('/pricing', { replace: true });
        return;
      } else if (response.data.status === 'expired') {
        toast.error(t('pricing.paymentExpired'));
        setCheckingPayment(false);
        return;
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment:', error);
      setCheckingPayment(false);
    }
  };

  const handleSubscribe = async (tierId) => {
    if (tierId === 'free') {
      if (!user) {
        navigate('/register');
      } else {
        navigate('/dashboard');
      }
      return;
    }

    if (!user) {
      toast.info(t('pricing.signInToSubscribe'));
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }

    setLoading(tierId);

    try {
      const response = await axios.post(
        `${API}/subscription/create-checkout`,
        {
          tier: tierId,
          origin_url: window.location.origin
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Redirect to Stripe
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(t('pricing.paymentError'));
      setLoading(null);
    }
  };

  const currentTier = user ? (user.subscription_tier || 'free') : null;

  return (
    <Layout>
      <div className="min-h-screen bg-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Urgency Badge */}
            <div className="flex justify-center mb-6">
              <UrgencyBadge language={i18n.language} type="countdown" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {t('pricing.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>

            {/* Social Proof Mini */}
            <div className="mt-4 flex justify-center">
              <SocialProofMini language={i18n.language} />
            </div>
            
            {/* Billing Toggle */}
            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center gap-4 p-1.5 bg-muted rounded-full">
                <button
                  onClick={() => setIsAnnual(false)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    !isAnnual ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('pricing.monthly')}
                </button>
                <button
                  onClick={() => setIsAnnual(true)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    isAnnual ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t('pricing.annual')}
                  <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs">
                    -33%
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Checking payment overlay */}
          {checkingPayment && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-lg text-foreground">{t('pricing.checkingPayment')}</p>
              </div>
            </div>
          )}

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier, index) => {
              const Icon = tier.icon;
              const isCurrentTier = currentTier && currentTier === tier.id;
              const isUpgrade = currentTier ? tiers.findIndex(t => t.id === currentTier) < index : false;
              
              return (
                <motion.div
                  key={tier.id}
                  data-testid={`pricing-card-${tier.id}`}
                  className={`relative rounded-2xl p-6 ${
                    tier.popular 
                      ? 'bg-gradient-to-b from-primary/20 to-card border-2 border-primary' 
                      : 'bg-card border border-border'
                  } ${isCurrentTier ? 'ring-2 ring-green-500' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                        {t('pricing.popular')}
                      </span>
                    </div>
                  )}

                  {(tier.bestValue && !tier.popular) || isCurrentTier ? (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                      {tier.bestValue && !tier.popular && (
                        <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium px-4 py-1 rounded-full whitespace-nowrap">
                          {t('pricing.bestValue')}
                        </span>
                      )}
                      {isCurrentTier && (
                        <span className="bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap">
                          {t('pricing.currentPlanBadge')}
                        </span>
                      )}
                    </div>
                  ) : null}

                  <div className="mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      tier.popular ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <Icon className={`h-6 w-6 ${tier.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </div>

                  <div className="mb-6">
                    {(() => {
                      const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
                      const savings = isAnnual && tier.monthlyPrice > 0 
                        ? Math.round((tier.monthlyPrice * 12) - tier.annualPrice) 
                        : 0;
                      return (
                        <>
                          <div className="flex items-baseline">
                            <span className="text-4xl font-bold text-foreground">
                              €{price.toFixed(2)}
                            </span>
                            {price > 0 && (
                              <span className="text-muted-foreground ml-2">
                                {isAnnual ? t('pricing.perYear') : t('pricing.perMonth')}
                              </span>
                            )}
                          </div>
                          {isAnnual && savings > 0 && (
                            <div className="mt-1">
                              <span className="text-sm text-green-400">
                                {t('pricing.savePerYear', { savings })}
                              </span>
                            </div>
                          )}
                          {isAnnual && price > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {t('pricing.perMonthBilled', { price: (price / 12).toFixed(2) })}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                          tier.popular ? 'text-primary' : 'text-green-500'
                        }`} />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Coupon Input for paid tiers */}
                  {tier.monthlyPrice > 0 && (
                    <div className="mb-4">
                      <CouponInput
                        onApply={setAppliedCoupon}
                        language={i18n.language}
                        originalPrice={isAnnual ? tier.annualPrice : tier.monthlyPrice}
                      />
                    </div>
                  )}

                  <Button
                    data-testid={`subscribe-${tier.id}-btn`}
                    className={`w-full ${
                      tier.popular
                        ? 'bg-primary hover:bg-primary/90'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                    onClick={() => handleSubscribe(tier.id)}
                    disabled={loading === tier.id || isCurrentTier}
                  >
                    {loading === tier.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t('pricing.loading')}
                      </>
                    ) : isCurrentTier ? (
                      t('pricing.currentPlan')
                    ) : isUpgrade ? (
                      t('pricing.upgradeTo', { tier: tier.name })
                    ) : (
                      tier.cta
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* FAQ / Features */}
          <motion.div 
            className="mt-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {t('pricing.faq.title')}
            </h2>
            <div className="max-w-2xl mx-auto space-y-4 text-left">
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-2">
                  {t('pricing.faq.cancelQ')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('pricing.faq.cancelA')}
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-2">
                  {t('pricing.faq.certQ')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('pricing.faq.certA')}
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-2">
                  {t('pricing.faq.mentorQ')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('pricing.faq.mentorA')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Social Proof Stats */}
          <div className="mt-16">
            <SocialProof language={i18n.language} />
          </div>

          {/* Testimonials */}
          <Testimonials language={i18n.language} />
        </div>
      </div>
    </Layout>
  );
};

export default PricingPage;
