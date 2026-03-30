import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { useAuth, API } from '../App';
import { useTranslation } from 'react-i18next';

const SubscriptionSuccessPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, refreshUser } = useAuth();
  const [status, setStatus] = useState('checking'); // checking, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMessage(t('subscriptionSuccess.checkingMessage'));
    const sessionId = searchParams.get('session_id');
    if (sessionId && token) {
      pollPaymentStatus(sessionId);
    } else if (!token) {
      setStatus('error');
      setMessage(t('subscriptionSuccess.errorLogin'));
    } else {
      setStatus('error');
      setMessage(t('subscriptionSuccess.errorNoSession'));
    }
  }, [searchParams, token]);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 10;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setStatus('error');
      setMessage(t('subscriptionSuccess.errorTimeout'));
      return;
    }

    try {
      const response = await axios.get(
        `${API}/subscription/checkout-status/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.payment_status === 'paid') {
        setStatus('success');
        setMessage(t('subscriptionSuccess.successMessage', { tier: response.data.tier?.toUpperCase() || '' }));
        await refreshUser();
        toast.success(t('subscriptionSuccess.activated'));
        return;
      } else if (response.data.status === 'expired') {
        setStatus('error');
        setMessage(t('subscriptionSuccess.errorExpired'));
        return;
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment:', error);
      setStatus('error');
      setMessage(t('subscriptionSuccess.errorMessage'));
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background flex items-center justify-center py-20">
        <motion.div
          className="max-w-md w-full mx-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            {status === 'checking' && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {t('subscriptionSuccess.checking')}
                </h1>
                <p className="text-muted-foreground">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                </motion.div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {t('subscriptionSuccess.success')}
                </h1>
                <p className="text-muted-foreground mb-8">{message}</p>
                <div className="space-y-3">
                  <Button
                    data-testid="go-to-dashboard-btn"
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => navigate('/dashboard')}
                  >
                    {t('subscriptionSuccess.goToDashboard')}
                  </Button>
                  <Button
                    data-testid="go-to-academy-btn"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/academy')}
                  >
                    {t('subscriptionSuccess.exploreAcademy')}
                  </Button>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {t('subscriptionSuccess.error')}
                </h1>
                <p className="text-muted-foreground mb-8">{message}</p>
                <div className="space-y-3">
                  <Button
                    data-testid="try-again-btn"
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => navigate('/pricing')}
                  >
                    {t('subscriptionSuccess.tryAgain')}
                  </Button>
                  <Button
                    data-testid="contact-support-btn"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/contact')}
                  >
                    {t('subscriptionSuccess.contactSupport')}
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SubscriptionSuccessPage;
