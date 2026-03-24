import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { useAuth, API } from '../App';

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { token, refreshUser } = useAuth();
  const [status, setStatus] = useState('checking'); // checking, success, error
  const [message, setMessage] = useState('Vérification du paiement...');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId && token) {
      pollPaymentStatus(sessionId);
    } else if (!token) {
      setStatus('error');
      setMessage('Veuillez vous connecter pour vérifier votre paiement');
    } else {
      setStatus('error');
      setMessage('Session de paiement non trouvée');
    }
  }, [searchParams, token]);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 10;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setStatus('error');
      setMessage('La vérification a pris trop de temps. Veuillez vérifier votre tableau de bord.');
      return;
    }

    try {
      const response = await axios.get(
        `${API}/subscription/checkout-status/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.payment_status === 'paid') {
        setStatus('success');
        setMessage(`Félicitations! Votre abonnement ${response.data.tier?.toUpperCase() || ''} est maintenant actif.`);
        await refreshUser();
        toast.success('Abonnement activé avec succès!');
        return;
      } else if (response.data.status === 'expired') {
        setStatus('error');
        setMessage('La session de paiement a expiré.');
        return;
      }

      // Continue polling
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment:', error);
      setStatus('error');
      setMessage('Erreur lors de la vérification du paiement.');
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
                  Vérification en cours
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
                  Paiement réussi!
                </h1>
                <p className="text-muted-foreground mb-8">{message}</p>
                <div className="space-y-3">
                  <Button 
                    data-testid="go-to-dashboard-btn"
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => navigate('/dashboard')}
                  >
                    Accéder au tableau de bord
                  </Button>
                  <Button 
                    data-testid="go-to-academy-btn"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/academy')}
                  >
                    Explorer l'académie
                  </Button>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Erreur
                </h1>
                <p className="text-muted-foreground mb-8">{message}</p>
                <div className="space-y-3">
                  <Button 
                    data-testid="try-again-btn"
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => navigate('/pricing')}
                  >
                    Réessayer
                  </Button>
                  <Button 
                    data-testid="contact-support-btn"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/contact')}
                  >
                    Contacter le support
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
