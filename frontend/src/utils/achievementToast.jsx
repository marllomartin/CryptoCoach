import React from 'react';
import { toast } from 'sonner';
import i18n from '../i18n';
import {
  Footprints, Flame, TrendingUp, BookOpen, GraduationCap,
  Trophy, BarChart2, Zap, Star, Award, Gem, Crown, Target,
  Gamepad2, Moon, RefreshCw, Shield,
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
  'target': Target,
  'gamepad-2': Gamepad2,
  'moon': Moon,
  'refresh-cw': RefreshCw,
  'shield': Shield,
};

const LEVEL_CONFIG = {
  1: { bg: 'bg-gradient-to-br from-amber-800/90 to-amber-700/80', border: 'border-amber-700/50', icon: 'text-amber-600', labelKey: 'achievements.tiers.bronze', labelClass: 'text-amber-500' },
  2: { bg: 'bg-gradient-to-br from-slate-500/80 to-slate-400/70', border: 'border-slate-400/50', icon: 'text-slate-300', labelKey: 'achievements.tiers.silver', labelClass: 'text-slate-300' },
  3: { bg: 'bg-gradient-to-br from-yellow-500/80 to-yellow-400/70', border: 'border-yellow-500/50', icon: 'text-yellow-400', labelKey: 'achievements.tiers.gold', labelClass: 'text-yellow-400' },
  4: { bg: 'bg-gradient-to-br from-purple-500/70 via-pink-500/70 to-cyan-500/70', border: 'border-purple-400/50', icon: 'text-fuchsia-300', labelKey: 'achievements.tiers.prismatic', labelClass: 'text-purple-300' },
  5: { bg: 'bg-gradient-to-br from-emerald-950/90 to-blue-950/90', border: 'border-teal-800/40', icon: 'text-teal-400', labelKey: 'achievements.tiers.hidden', labelClass: 'text-teal-300' },
};

export function showAchievementToasts(newAchievements) {
  if (!newAchievements?.length) return;

  newAchievements.forEach((ach, i) => {
    const config = LEVEL_CONFIG[ach.level] || LEVEL_CONFIG[1];
    const IconComponent = ICONS[ach.icon] || Trophy;

    const displayName = i18n.t(`achievements.${ach.id}.name`, { defaultValue: ach.name });
    const displayDesc = i18n.t(`achievements.${ach.id}.description`, { defaultValue: ach.description ?? '' });
    const label = i18n.t(config.labelKey, { defaultValue: config.labelKey });

    setTimeout(() => {
      toast.custom(() => (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl ${config.bg} ${config.border} min-w-[280px] max-w-[340px]`}>
          <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-black/30">
            <IconComponent className={`w-5 h-5 ${config.icon}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{i18n.t('achievements.unlocked', { defaultValue: 'Achievement Unlocked' })}</p>
            <p className="text-sm font-bold text-white leading-tight">{displayName}</p>
            {displayDesc && <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{displayDesc}</p>}
            <p className={`text-[11px] font-medium mt-0.5 ${config.labelClass}`}>{label} · +{ach.xp} XP</p>
          </div>
        </div>
      ), { duration: 5000 });
    }, i * 800);
  });
}
