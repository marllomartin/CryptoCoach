import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import axios from 'axios';
import { API } from '../App';

export function CouponInput({ onApply, language = 'en', originalPrice = 0 }) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const labels = {
    en: {
      title: 'Have a coupon code?',
      placeholder: 'Enter code',
      apply: 'Apply',
      invalid: 'Invalid or expired coupon code',
      discount: 'off',
      remove: 'Remove',
      saved: 'You save'
    },
    fr: {
      title: 'Avez-vous un code promo ?',
      placeholder: 'Entrez le code',
      apply: 'Appliquer',
      invalid: 'Code promo invalide ou expiré',
      discount: 'de réduction',
      remove: 'Supprimer',
      saved: 'Vous économisez'
    },
    ar: {
      title: 'هل لديك رمز قسيمة؟',
      placeholder: 'أدخل الرمز',
      apply: 'تطبيق',
      invalid: 'رمز قسيمة غير صالح أو منتهي الصلاحية',
      discount: 'خصم',
      remove: 'إزالة',
      saved: 'توفر'
    },
    pt: {
      title: 'Tem um código de cupom?',
      placeholder: 'Digite o código',
      apply: 'Aplicar',
      invalid: 'Código de cupom inválido ou expirado',
      discount: 'de desconto',
      remove: 'Remover',
      saved: 'Você economiza'
    }
  };

  const t = labels[language] || labels.en;

  const handleApply = async () => {
    if (!code.trim()) return;
    setIsValidating(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/coupons/validate`, { code: code.trim() });
      const coupon = res.data;
      setAppliedCoupon(coupon);
      onApply?.({ code: coupon.code, discount_pct: coupon.discount_pct });
    } catch {
      setError(t.invalid);
      setAppliedCoupon(null);
      onApply?.(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    setAppliedCoupon(null);
    setCode('');
    setError(null);
    onApply?.(null);
  };

  const discountAmount = appliedCoupon
    ? Math.round(originalPrice * appliedCoupon.discount_pct) / 100
    : 0;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
      >
        <Tag className="w-4 h-4" />
        {t.title}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {!appliedCoupon ? (
              <div className="flex gap-2">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                  placeholder={t.placeholder}
                  className="flex-1 uppercase font-mono"
                  disabled={isValidating}
                  data-testid="coupon-input"
                />
                <Button
                  type="button"
                  onClick={handleApply}
                  disabled={!code.trim() || isValidating}
                  variant="outline"
                  data-testid="coupon-apply-btn"
                >
                  {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : t.apply}
                </Button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <span className="font-mono font-bold text-green-400">{appliedCoupon.code}</span>
                      <span className="ml-2 text-sm text-slate-400">
                        {appliedCoupon.discount_pct}% {t.discount}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                  >
                    {t.remove}
                  </button>
                </div>
                {originalPrice > 0 && (
                  <p className="mt-2 text-sm text-green-400">
                    {t.saved}: <span className="font-bold">€{discountAmount.toFixed(2)}</span>
                  </p>
                )}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-red-400 text-sm mt-2"
              >
                <XCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CouponInput;
