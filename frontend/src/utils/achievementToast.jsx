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
  1: { bg: 'bg-amber-900/90', border: 'border-amber-600/60', icon: 'text-amber-500', label: 'Bronze', labelClass: 'text-amber-500' },
  2: { bg: 'bg-slate-800/90', border: 'border-slate-400/60', icon: 'text-slate-300', label: 'Silver', labelClass: 'text-slate-300' },
  3: { bg: 'bg-yellow-900/90', border: 'border-yellow-500/60', icon: 'text-yellow-400', label: 'Gold', labelClass: 'text-yellow-400' },
  4: { bg: 'bg-purple-900/90', border: 'border-purple-400/60', icon: 'text-purple-300', label: 'Prismatic', labelClass: 'text-purple-300' },
};

export function showAchievementToasts(newAchievements) {
  if (!newAchievements?.length) return;

  newAchievements.forEach((ach, i) => {
    const isHidden = ach.level === 5;
    const config = LEVEL_CONFIG[ach.level];
    const IconComponent = ICONS[ach.icon] || Trophy;

    const displayName = i18n.t(`achievements.${ach.id}.name`, { defaultValue: ach.name });
    const displayDesc = i18n.t(`achievements.${ach.id}.description`, { defaultValue: ach.description ?? '' });
    const label = i18n.t(`achievements.tiers.hidden`, { defaultValue: 'Hidden' });

    setTimeout(() => {
      toast.custom(() => (
        isHidden ? (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl min-w-[280px] max-w-[340px] relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0f0c29, #1a1040, #0f0c29)',
              border: '1px solid transparent',
              backgroundClip: 'padding-box',
              boxShadow: '0 0 0 1px rgba(168,85,247,0.5), 0 0 24px rgba(168,85,247,0.3), 0 0 48px rgba(99,102,241,0.15)',
            }}
          >
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                animation: 'shimmer 2.5s infinite',
              }}
            />
            <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
            <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', boxShadow: '0 0 12px rgba(168,85,247,0.6)' }}>
              <IconComponent className="w-5 h-5" style={{ color: '#c084fc' }} />
            </div>
            <div className="flex-1 min-w-0 relative">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#a78bfa' }}>
                {i18n.t('achievements.unlocked', { defaultValue: 'Achievement Unlocked' })}
              </p>
              <p className="text-sm font-bold text-white leading-tight">{displayName}</p>
              {displayDesc && <p className="text-[11px] leading-snug mt-0.5" style={{ color: '#94a3b8' }}>{displayDesc}</p>}
              <p className="text-[11px] font-medium mt-0.5" style={{ background: 'linear-gradient(90deg,#c084fc,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {label} · +{ach.xp} XP
              </p>
            </div>
          </div>
        ) : (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl ${config?.bg ?? 'bg-amber-900/90'} ${config?.border ?? 'border-amber-600/60'} min-w-[280px] max-w-[340px]`}>
            <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-black/30">
              <IconComponent className={`w-5 h-5 ${config?.icon ?? 'text-amber-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{i18n.t('achievements.unlocked', { defaultValue: 'Achievement Unlocked' })}</p>
              <p className="text-sm font-bold text-white leading-tight">{displayName}</p>
              {displayDesc && <p className="text-[11px] text-gray-400 leading-snug mt-0.5">{displayDesc}</p>}
              <p className={`text-[11px] font-medium mt-0.5 ${config?.labelClass ?? 'text-amber-500'}`}>{config?.label ?? 'Bronze'} · +{ach.xp} XP</p>
            </div>
          </div>
        )
      ), { duration: 6000 });
    }, i * 800);
  });
}
