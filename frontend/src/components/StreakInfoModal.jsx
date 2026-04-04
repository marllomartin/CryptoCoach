import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function StreakInfoModal({ open, onClose }) {
  const { t } = useTranslation();

  if (!open) return null;

  // Visual example: 7-day week grid
  // days: null = future, true = done, false = missed, 'today' = today
  const exampleWeek = [
    { label: t('streak.modal.exMon'), done: true },
    { label: t('streak.modal.exTue'), done: true },
    { label: t('streak.modal.exWed'), done: true },
    { label: t('streak.modal.exThu'), done: true },
    { label: t('streak.modal.exFri'), done: true },
    { label: t('streak.modal.exSat'), done: true },
    { label: t('streak.modal.exSun'), today: true },
  ];

  // Example showing a broken streak
  const brokenWeek = [
    { label: t('streak.modal.exMon'), done: true },
    { label: t('streak.modal.exTue'), done: true },
    { label: t('streak.modal.exWed'), done: false },
    { label: t('streak.modal.exThu'), done: false },
    { label: t('streak.modal.exFri'), done: true },
    { label: t('streak.modal.exSat'), done: false },
    { label: t('streak.modal.exSun'), today: true },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-amber-500" />
                <h2 className="text-lg font-bold text-foreground">{t('streak.modal.title')}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 text-sm text-muted-foreground">
              {/* Rule 1 */}
              <div className="flex gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-amber-500" />
                </div>
                <p>{t('streak.modal.rule1')}</p>
              </div>

              {/* Visual: good streak */}
              <div>
                <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  {t('streak.modal.exGoodLabel')}
                </p>
                <div className="flex gap-1.5">
                  {exampleWeek.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-full aspect-square rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                        day.today
                          ? 'bg-amber-500 text-white'
                          : day.done
                            ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                            : 'bg-red-500/15 border border-red-500/30 text-red-400'
                      }`}>
                        {day.today ? '🔥' : day.done ? '✓' : '✗'}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{day.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-amber-500 mt-1.5 font-medium">
                  {t('streak.modal.exGoodResult')}
                </p>
              </div>

              {/* Rule 2 */}
              <div className="flex gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>
                <p>{t('streak.modal.rule2')}</p>
              </div>

              {/* Visual: broken streak */}
              <div>
                <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  {t('streak.modal.exBrokenLabel')}
                </p>
                <div className="flex gap-1.5">
                  {brokenWeek.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-full aspect-square rounded-md flex items-center justify-center text-xs font-bold ${
                        day.today
                          ? 'bg-amber-500 text-white'
                          : day.done
                            ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                            : 'bg-red-500/15 border border-red-500/30 text-red-400'
                      }`}>
                        {day.today ? '🔥' : day.done ? '✓' : '✗'}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{day.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-red-400 mt-1.5 font-medium">
                  {t('streak.modal.exBrokenResult')}
                </p>
              </div>

              {/* Rule 3 */}
              <div className="flex gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <p>{t('streak.modal.rule3')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default StreakInfoModal;
