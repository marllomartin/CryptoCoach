import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, API } from '../App';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import axios from 'axios';
import {
  Trophy, Flame, Zap,
  Target, TrendingUp, Award,
  BookOpen, Star, Crown, HelpCircle,
  Footprints, GraduationCap, BarChart2, Gem, Lock, Settings,
  Moon, RefreshCw, Shield, Eye
} from 'lucide-react';
import { StreakInfoModal } from '../components/StreakInfoModal';
import { Progress } from '../components/ui/progress';
import PrismaticBurst from '../components/PrismaticBurst';
import Aurora from '../components/Aurora';


const ProfilePage = () => {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [streakInfo, setStreakInfo] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user || !token) return;

    try {
      const [profileRes, streakRes, achRes] = await Promise.all([
        axios.get(`${API}/v2/gamification/profile/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/v2/gamification/streak/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/v2/gamification/achievements/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setProfile(profileRes.data);
      setStreakInfo(streakRes.data);
      setAchievements(achRes.data.achievements ?? achRes.data);
      setHiddenCount(achRes.data.hidden_count ?? 0);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const level = profile?.level || 1;
  const xp = profile?.xp_points || 0;
  const levelProgress = profile?.level_progress || {};

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Profile Header */}
          <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-xl p-8 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-purple-600 p-1">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <span className="text-5xl font-bold text-white">
                      {user?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:-right-2 bg-primary text-white text-sm font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  {t('profile.levelBadge', { level })}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <h1 className="text-3xl font-bold text-white">{user?.full_name}</h1>
                  <button
                    onClick={() => navigate('/account')}
                    className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                    aria-label="Account settings"
                  >
                    <Settings className="w-4 h-4 text-gray-500 hover:text-white transition-colors" />
                  </button>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-white font-bold">{xp.toLocaleString()} XP</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">
                    {levelProgress.xp_in_level || 0} / {levelProgress.xp_needed || 100} {t('profile.toNextLevel', { level: level + 1 })}
                  </span>
                </div>
                <Progress value={levelProgress.progress || 0} className="h-2 max-w-md" />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative text-center p-3 bg-gray-800/50 rounded-lg">
                  <button
                    onClick={() => setStreakModalOpen(true)}
                    className="absolute top-2 right-2 text-gray-600 hover:text-orange-400 transition-colors"
                    aria-label={t('streak.modal.title')}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                  <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{streakInfo?.current_streak || 0}</p>
                  <p className="text-xs text-gray-400">{t('profile.streak')}</p>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{profile?.achievements_count || 0}</p>
                  <p className="text-xs text-gray-400">{t('profile.achievements')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Stats */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                {t('profile.statistics')}
              </h2>
              <div className="space-y-4">
                <StatRow icon={BookOpen} label={t('profile.lessonsCompleted')} value={profile?.stats?.lessons_completed || 0} color="blue" />
                <StatRow icon={Target} label={t('profile.quizzesPassed')} value={profile?.stats?.quizzes_completed || 0} color="green" />
                <StatRow icon={Award} label={t('profile.examsPassed')} value={profile?.stats?.exams_passed || 0} color="purple" />
                <StatRow icon={TrendingUp} label={t('profile.tradesExecuted')} value={profile?.stats?.trades_count || 0} color="cyan" />
                <StatRow icon={Award} label={t('profile.certificatesEarned')} value={profile?.stats?.certificates_earned || 0} color="yellow" />
              </div>
            </div>

            {/* Streak Info */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                {t('profile.streakMilestones')}
                <button
                  onClick={() => setStreakModalOpen(true)}
                  className="text-gray-600 hover:text-orange-400 transition-colors ml-auto"
                  aria-label={t('streak.modal.title')}
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </h2>

              <div className="mb-4 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{t('profile.currentStreak')}</p>
                    <p className="text-3xl font-bold text-orange-500">{streakInfo?.current_streak || 0} {t('profile.days')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">{t('profile.longestStreak')}</p>
                    <p className="text-xl font-bold text-white">{streakInfo?.longest_streak || 0} {t('profile.days')}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {streakInfo?.all_milestones?.map((milestone) => (
                  <div 
                    key={milestone.days}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      milestone.claimed ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {milestone.claimed ? (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Trophy className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-400">{milestone.days}</span>
                        </div>
                      )}
                      <span className={milestone.claimed ? 'text-white' : 'text-gray-400'}>
                        {milestone.title}
                      </span>
                    </div>
                    <span className="text-xs text-primary">+{milestone.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="md:col-span-2 bg-gray-900/60 border border-gray-800 rounded-xl p-6">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                {t('profile.achievementsCount', { count: profile?.achievements_count || 0 })}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[...achievements].sort((a, b) => a.level - b.level).map((ach) => (
                  <AchievementCard key={ach.id} achievement={ach} />
                ))}
                {hiddenCount > 0 && (
                  <div className="relative p-4 rounded-xl border bg-gradient-to-br from-gray-800/40 to-blue-950/30 border-blue-900/40 overflow-hidden flex flex-col items-center justify-center gap-2 min-h-[110px]">
                    <Eye className="w-6 h-6 text-blue-400/60" />
                    <p className="text-sm font-bold text-blue-300/80">+{hiddenCount} {t('achievements.tiers.hidden')}</p>
                    <p className="text-xs text-gray-500 text-center leading-snug">{t('profile.hiddenAchievementsHint')}</p>
                  </div>
                )}
                {achievements.length === 0 && hiddenCount === 0 && (
                  <p className="col-span-3 text-center text-gray-500 py-8">{t('profile.noAchievements')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <StreakInfoModal open={streakModalOpen} onClose={() => setStreakModalOpen(false)} />
    </Layout>
  );
};

const StatRow = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    cyan: 'text-cyan-500',
    yellow: 'text-yellow-500'
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${colors[color]}`} />
        <span className="text-gray-300">{label}</span>
      </div>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
};

const ACHIEVEMENT_ICONS = {
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
  'moon': Moon,
  'refresh-cw': RefreshCw,
  'shield': Shield,
};

const LEVEL_STYLES = {
  1: {
    card: 'from-amber-800/30 to-amber-700/20 border-amber-700/50',
    icon: 'text-amber-600',
    badge: 'bg-amber-700/30 text-amber-500',
    labelKey: 'achievements.tiers.bronze',
  },
  2: {
    card: 'from-slate-500/30 to-slate-400/20 border-slate-400/50',
    icon: 'text-slate-300',
    badge: 'bg-slate-500/30 text-slate-300',
    labelKey: 'achievements.tiers.silver',
  },
  3: {
    card: 'from-yellow-500/30 to-yellow-400/20 border-yellow-500/50',
    icon: 'text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-400',
    labelKey: 'achievements.tiers.gold',
  },
  4: {
    card: 'from-purple-500/20 via-pink-500/20 to-cyan-500/20 border-purple-400/50',
    icon: 'text-fuchsia-300',
    badge: 'bg-purple-500/20 text-purple-300',
    labelKey: 'achievements.tiers.prismatic',
  },
  5: {
    card: 'from-emerald-950/60 to-blue-950/60 border-teal-800/40',
    icon: 'text-teal-400',
    badge: 'bg-teal-950/70 text-teal-300',
    labelKey: 'achievements.tiers.hidden',
  },
};

const AchievementCard = ({ achievement }) => {
  const { t, i18n } = useTranslation();
  const { earned, id, name, description, icon, level, xp_reward, earned_at } = achievement;
  const IconComponent = ACHIEVEMENT_ICONS[icon] || Trophy;
  const styles = LEVEL_STYLES[level] || LEVEL_STYLES[1];
  const displayName = t(`achievements.${id}.name`, { defaultValue: name });
  const displayDesc = t(`achievements.${id}.description`, { defaultValue: description });

  const isGold      = earned && level === 3;
  const isPrismatic = earned && level === 4;
  const isHidden    = earned && level === 5;

  return (
    <div className={`relative p-4 rounded-xl border bg-gradient-to-br transition-all overflow-hidden ${
      earned
        ? `${styles.card} opacity-100`
        : 'from-gray-800/40 to-gray-800/20 border-gray-700/50 opacity-50 grayscale'
    } ${isGold ? 'shadow-[0_0_12px_2px_rgba(234,179,8,0.18)]' : ''
      } ${isPrismatic ? 'shadow-[0_0_18px_4px_rgba(168,85,247,0.28)]' : ''
      } ${isHidden ? 'shadow-[0_0_14px_2px_rgba(20,184,166,0.18)]' : ''}`}>

      {/* Prismatic burst — WebGL */}
      {isPrismatic && (
        <div className="pointer-events-none absolute inset-0 z-0 opacity-20" aria-hidden="true">
          <PrismaticBurst
            animationType="rotate3d"
            intensity={1.8}
            speed={0.4}
            distort={0}
            rayCount={0}
            fadeRadius={0.6}
            mixBlendMode="lighten"
            colors={['#a855f7', '#ec4899', '#06b6d4', '#e879f9', '#c084fc']}
          />
        </div>
      )}

      {/* Aurora — WebGL */}
      {isHidden && (
        <div className="pointer-events-none absolute inset-0 z-0 opacity-40" aria-hidden="true">
          <Aurora
            colorStops={['#0f766e', '#1d4ed8', '#0f766e']}
            amplitude={1.2}
            blend={0.6}
            speed={0.6}
          />
        </div>
      )}

      {!earned && (
        <div className="absolute top-2 ltr:right-2 rtl:left-2">
          <Lock className="w-3.5 h-3.5 text-gray-500" />
        </div>
      )}
      <div className="relative z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <IconComponent className={`w-6 h-6 shrink-0 ${earned ? styles.icon : 'text-gray-600'}`} />
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${earned ? styles.badge : 'bg-gray-700 text-gray-500'}`}>
            {t(styles.labelKey)}
          </span>
        </div>
        <div>
          <p className={`text-sm font-bold leading-tight ${earned ? 'text-white' : 'text-gray-500'}`}>{displayName}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{displayDesc}</p>
        </div>
        <div className="flex items-end justify-between gap-1">
          <p className={`text-xs font-medium ${earned ? 'text-primary' : 'text-gray-600'}`}>+{xp_reward} XP</p>
          {earned && earned_at && (
            <p className="text-[10px] text-gray-500 leading-none">
              {new Date(earned_at).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
