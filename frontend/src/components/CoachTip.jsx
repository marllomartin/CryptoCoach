import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function CoachTip({ tip: tipProp, language = 'en' }) {
  const { t } = useTranslation();

  const tip = tipProp || '';

  if (!tip) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="my-8"
    >
      <div className="relative pt-8 pb-5 px-5 bg-amber-500/5 border border-amber-500/20 rounded-xl overflow-hidden">
        {/* Opening quote */}
        <span className="absolute top-1 left-3 text-5xl font-serif leading-none text-amber-500/20 select-none">&ldquo;</span>
        {/* Closing quote */}
        <span className="absolute bottom-1 right-3 text-5xl font-serif leading-none text-amber-500/20 select-none">&rdquo;</span>

        <div className="relative flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-sm font-semibold text-amber-400">
            {t('coachTip.title')}
          </span>
        </div>
        <p className={`relative text-slate-300 leading-relaxed ${language === 'ar' ? 'text-right' : ''}`}>
          {tip}
        </p>
      </div>
    </motion.div>
  );
}

export default CoachTip;
