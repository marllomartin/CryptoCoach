// Global Progress Bar Component
// Shows user's overall course progress across the platform

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../App';
import { Trophy, BookOpen, Star, Flame } from 'lucide-react';

export function GlobalProgressBar({ className = "" }) {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const completedLessons = user.completed_lessons?.length || 0;
  const totalLessons = 23; // Total lessons in all courses
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
              <span className="text-sm font-medium">Niv. {level}</span>
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
              <span className="text-sm">{completedLessons}/{totalLessons} leçons</span>
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
              <span className="text-sm font-medium">{user.streak_days}j</span>
            </div>
          )}
          
          {/* Achievements hint */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <Trophy className="w-4 h-4" />
            <span className="text-xs">{user.achievements?.length || 0} badges</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlobalProgressBar;
