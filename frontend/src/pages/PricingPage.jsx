import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Rocket, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { useAuth, API } from '../App';
import { Testimonials } from '../components/Testimonials';
import { CouponInput } from '../components/CouponInput';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { SocialProof, SocialProofMini } from '../components/SocialProof';

const tiers = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Commencez votre voyage crypto',
    icon: Star,
    features: [
      'Niveau 1: Fondamentaux Crypto (8 leçons)',
      'Accès au Glossaire Crypto',
      'Blog & Insights',
      'Classement basique',
      '3 jours d\'essai vidéo (Leçon 1)'
    ],
    cta: 'Commencer gratuitement',
    popular: false
  },
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 9.99,
    annualPrice: 79.99,
    description: 'Pour les investisseurs débutants',
    icon: Zap,
    features: [
      'Tout dans Free +',
      'Niveau 2: Crypto Investor (8 leçons)',
      'Quiz interactifs',
      'Simulateur de Trading',
      'Suivi de progression',
      'Audio & Vidéo Premium'
    ],
    cta: 'Commencer',
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 19.99,
    annualPrice: 159.99,
    description: 'Pour les investisseurs sérieux',
    icon: Rocket,
    features: [
      'Tout dans Starter +',
      'Niveau 3: Stratège Avancé (7 leçons)',
      'Examens de certification',
      'Certificats PDF avec QR',
      'Accès complet au classement',
      'Présentations Vidéo'
    ],
    cta: 'Devenir Pro',
    popular: false
  },
  {
    id: 'elite',
    name: 'Elite',
    monthlyPrice: 25.00,
    annualPrice: 199.99,
    description: 'Accès illimité et AI Mentor',
    icon: Crown,
    features: [
      'Tout dans Pro +',
      'AI Crypto Mentor (CryptoCoach AI)',
      'Stratégies avancées exclusives',
      'Support prioritaire',
      'Accès anticipé au nouveau contenu'
    ],
    cta: 'Rejoindre l\'Elite',
    popular: false,
    bestValue: true
  }
];

const PricingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

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
      toast.error('Vérification du paiement expirée. Veuillez vérifier votre email.');
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
        toast.success('Paiement réussi! Votre abonnement est activé.');
        await refreshUser();
        setCheckingPayment(false);
        // Clear URL params
        navigate('/pricing', { replace: true });
        return;
      } else if (response.data.status === 'expired') {
        toast.error('Session de paiement expirée. Veuillez réessayer.');
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
      toast.info('Veuillez vous connecter pour vous abonner');
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
      toast.error('Erreur lors de la création de la session de paiement');
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
              <UrgencyBadge language="fr" type="countdown" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Choisissez votre{' '}
              <span className="text-primary">parcours</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des plans flexibles pour tous les niveaux. Commencez gratuitement et évoluez à votre rythme.
            </p>
            
            {/* Social Proof Mini */}
            <div className="mt-4 flex justify-center">
              <SocialProofMini language="fr" />
            </div>
            
            {/* Billing Toggle */}
            <div className="mt-8 inline-flex items-center gap-4 p-1.5 bg-muted rounded-full">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  !isAnnual ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  isAnnual ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Annuel
                <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs">
                  -33%
                </span>
              </button>
            </div>
            
            {/* Trial info */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
              <Star className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">3 premières leçons gratuites avec vidéo premium</span>
            </div>
          </motion.div>

          {/* Checking payment overlay */}
          {checkingPayment && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-lg text-foreground">Vérification du paiement...</p>
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
                        Populaire
                      </span>
                    </div>
                  )}
                  
                  {tier.bestValue && !tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                        Meilleur Rapport
                      </span>
                    </div>
                  )}

                  {isCurrentTier && (
                    <div className="absolute -top-4 right-4">
                      <span className="bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                        Actuel
                      </span>
                    </div>
                  )}

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
                                {isAnnual ? '/an' : '/mois'}
                              </span>
                            )}
                          </div>
                          {isAnnual && savings > 0 && (
                            <div className="mt-1">
                              <span className="text-sm text-green-400">
                                Économisez €{savings}/an
                              </span>
                            </div>
                          )}
                          {isAnnual && price > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              soit €{(price / 12).toFixed(2)}/mois
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
                        language="fr"
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
                        Chargement...
                      </>
                    ) : isCurrentTier ? (
                      'Plan actuel'
                    ) : isUpgrade ? (
                      `Passer à ${tier.name}`
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
              Questions fréquentes
            </h2>
            <div className="max-w-2xl mx-auto space-y-4 text-left">
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-2">
                  Puis-je annuler à tout moment ?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Oui, vous pouvez annuler votre abonnement à tout moment. Vous conserverez l'accès jusqu'à la fin de votre période de facturation.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-2">
                  Comment fonctionne le certificat ?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Après avoir réussi l'examen de certification (80% minimum), vous recevez un certificat PDF téléchargeable avec un QR code de vérification.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-foreground mb-2">
                  Qu'est-ce que l'AI Crypto Mentor ?
                </h3>
                <p className="text-sm text-muted-foreground">
                  CryptoCoach AI est un assistant IA alimenté par GPT qui répond à vos questions sur la crypto, vous aide à comprendre les concepts et vous guide dans votre apprentissage.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Social Proof Stats */}
          <div className="mt-16">
            <SocialProof language="fr" />
          </div>

          {/* Testimonials */}
          <Testimonials language="fr" />
        </div>
      </div>
    </Layout>
  );
};

export default PricingPage;
