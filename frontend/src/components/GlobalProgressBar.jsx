// Global Progress Bar Component
// Shows user's overall course progress across the platform

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../App';
import { Trophy, BookOpen, Star, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function GlobalProgressBar({ className = "", courseLessons }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const completedInCourse = courseLessons?.length
    ? courseLessons.filter(l => user.completed_lessons?.includes(l.id)).length
    : null;
  const totalLessons = courseLessons?.length || 23;
  const completedLessons = completedInCourse ?? (user.completed_lessons?.length || 0);
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  // Calculate level from XP — must match backend calculate_level() thresholds
  const XP_THRESHOLDS = [
    0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200,
    6600, 8200, 10000, 12000, 14200, 16600, 19200, 22000, 25000, 28200,
    31600, 35200, 39000, 43000, 47200, 51600, 56200, 61000, 66000, 71200,
    76600, 82200, 88000, 94000, 100200
  ];
  const xp = user.xp_points || 0;
  let level = XP_THRESHOLDS.length;
  for (let i = 1; i < XP_THRESHOLDS.length; i++) {
    if (xp < XP_THRESHOLDS[i]) { level = i; break; }
  }
  const xpAtLevel = XP_THRESHOLDS[level - 1] || 0;
  const xpAtNext = XP_THRESHOLDS[level] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  const xpProgress = Math.round(((xp - xpAtLevel) / (xpAtNext - xpAtLevel)) * 100);

  return (
    <div className={`sticky top-16 z-40 bg-card/80 backdrop-blur-sm border-b border-border ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-2">

        {/* Desktop layout */}
        <div className="hidden md:flex items-center justify-between gap-4">
          {/* Level & XP */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{t('progressBar.level', { level })}</span>
            </div>
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-slate-400">{xp} XP</span>
          </div>

          {/* Course Progress */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm">{t('progressBar.lessons', { completed: completedLessons, total: totalLessons })}</span>
            </div>
            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-slate-400">{progressPercent}%</span>
          </div>

          {/* Streak */}
          {user.streak_days > 0 && (
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">{t('progressBar.streak', { days: user.streak_days })}</span>
            </div>
          )}

          {/* Achievements */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Trophy className="w-4 h-4" />
            <span className="text-xs">{t('progressBar.badges', { count: user.achievements?.length || 0 })}</span>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="flex md:hidden items-center justify-between gap-3">
          {/* Level */}
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
            <span className="text-xs font-medium">{t('progressBar.level', { level })}</span>
          </div>

          {/* XP */}
          <span className="text-xs text-slate-400">{xp} XP</span>

          {/* Lesson count */}
          <div className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs">{completedLessons}/{totalLessons}</span>
          </div>

          {/* Streak */}
          {user.streak_days > 0 && (
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="text-xs font-medium">{user.streak_days}</span>
            </div>
          )}

          {/* Achievements — icon only */}
          <div className="flex items-center gap-1 text-slate-400">
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs">{user.achievements?.length || 0}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default GlobalProgressBar;
