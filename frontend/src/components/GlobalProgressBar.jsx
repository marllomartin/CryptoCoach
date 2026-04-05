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
  
  // Calculate level from XP
  const xp = user.xp_points || 0;
  const level = Math.floor(xp / 100) + 1;
  const xpForNextLevel = level * 100;
  const xpProgress = ((xp % 100) / 100) * 100;
  
  return (
    <div className={`bg-card/50 backdrop-blur-sm border-b border-border ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
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
          
          {/* Achievements hint */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Trophy className="w-4 h-4" />
            <span className="text-xs">{t('progressBar.badges', { count: user.achievements?.length || 0 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlobalProgressBar;
