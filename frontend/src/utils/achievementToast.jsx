import React from 'react';
import { toast } from 'sonner';
import {
  Footprints, Flame, TrendingUp, BookOpen, GraduationCap,
  Trophy, BarChart2, Zap, Star, Award, Gem, Crown
} from 'lucide-react';

const ICONS = {
  'footprints': Footprints,
  'flame': Flame,
  'fire': Flame,
  'trending-up': TrendingUp,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'trophy': Trophy,
  'bar-chart-2': BarChart2,
  'zap': Zap,
  'star': Star,
  'award': Award,
  'gem': Gem,
  'crown': Crown,
};

const LEVEL_CONFIG = {
  1: { bg: 'bg-amber-900/90', border: 'border-amber-600/60', icon: 'text-amber-500', label: 'Bronze', labelClass: 'text-amber-500' },
  2: { bg: 'bg-slate-800/90', border: 'border-slate-400/60', icon: 'text-slate-300', label: 'Silver', labelClass: 'text-slate-300' },
  3: { bg: 'bg-yellow-900/90', border: 'border-yellow-500/60', icon: 'text-yellow-400', label: 'Gold', labelClass: 'text-yellow-400' },
  4: { bg: 'bg-purple-900/90', border: 'border-purple-400/60', icon: 'text-purple-300', label: 'Prismatic', labelClass: 'text-purple-300' },
};

export function showAchievementToasts(newAchievements) {
  if (!newAchievements?.length) return;

  newAchievements.forEach((ach, i) => {
    const config = LEVEL_CONFIG[ach.level] || LEVEL_CONFIG[1];
    const IconComponent = ICONS[ach.icon] || Trophy;

    setTimeout(() => {
      toast.custom(() => (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl ${config.bg} ${config.border} min-w-[260px]`}>
          <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-black/30`}>
            <IconComponent className={`w-5 h-5 ${config.icon}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Achievement Unlocked</p>
            <p className="text-sm font-bold text-white leading-tight truncate">{ach.name}</p>
            <p className={`text-[11px] font-medium ${config.labelClass}`}>{config.label} · +{ach.xp} XP</p>
          </div>
        </div>
      ), { duration: 5000 });
    }, i * 800);
  });
}
