import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, API } from '../App';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import axios from 'axios';
import {
  User, Edit2, Save, Camera, Trophy, Flame, Zap,
  Calendar, Target, TrendingUp, Award, Shield,
  BookOpen, Star, Crown, Clock, X, HelpCircle,
  Footprints, GraduationCap, BarChart2, Gem
} from 'lucide-react';
import { StreakInfoModal } from '../components/StreakInfoModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, token, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [streakInfo, setStreakInfo] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      setAchievements(achRes.data);
      setEditName(user.full_name);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveProfile = async () => {
    if (!editName.trim()) {
      toast.error(t('profile.nameRequired'));
      return;
    }

    setSaving(true);
    try {
      await axios.put(
        `${API}/auth/profile`,
        { full_name: editName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t('profile.profileUpdated'));
      setEditing(false);
      refreshUser?.();
    } catch (error) {
      toast.error(t('profile.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

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
                <div className="absolute -bottom-2 -right-2 bg-primary text-white text-sm font-bold px-4 py-1 rounded-full">
                  {t('profile.levelBadge', { level })}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                {editing ? (
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white text-xl font-bold"
                    />
                    <Button size="sm" onClick={saveProfile} disabled={saving}>
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-white">{user?.full_name}</h1>
                    <button onClick={() => setEditing(true)} className="p-1 hover:bg-gray-800 rounded">
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}
                
                <p className="text-primary font-medium mb-3">
                  {profile?.avatar?.title || t('profile.newUser')}
                </p>

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
              <div className="grid grid-cols-3 gap-4">
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
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{profile?.coins || 0}</p>
                  <p className="text-xs text-gray-400">{t('profile.coins')}</p>
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
                <StatRow icon={Crown} label={t('profile.certificatesEarned')} value={profile?.stats?.certificates_earned || 0} color="yellow" />
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
                {achievements.filter(a => a.earned).map((ach) => (
                  <AchievementCard key={ach.id} achievement={ach} />
                ))}
                {achievements.filter(a => a.earned).length === 0 && (
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
  'trending-up': TrendingUp,
  'book-open': BookOpen,
  'graduation-cap': GraduationCap,
  'trophy': Trophy,
  'bar-chart-2': BarChart2,
  'zap': Zap,
  'star': Star,
  'fire': Flame,
  'award': Award,
  'gem': Gem,
  'crown': Crown,
};

const LEVEL_STYLES = {
  1: {
    card: 'from-amber-800/30 to-amber-700/20 border-amber-700/50',
    icon: 'text-amber-600',
    badge: 'bg-amber-700/30 text-amber-500',
    label: 'Bronze',
  },
  2: {
    card: 'from-slate-500/30 to-slate-400/20 border-slate-400/50',
    icon: 'text-slate-300',
    badge: 'bg-slate-500/30 text-slate-300',
    label: 'Silver',
  },
  3: {
    card: 'from-yellow-500/30 to-yellow-400/20 border-yellow-500/50',
    icon: 'text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-400',
    label: 'Gold',
  },
  4: {
    card: 'from-purple-500/20 via-pink-500/20 to-cyan-500/20 border-purple-400/50',
    icon: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400',
    badge: 'bg-purple-500/20 text-purple-300',
    label: 'Prismatic',
  },
};

const AchievementCard = ({ achievement }) => {
  const { name, description, icon, level, xp_reward } = achievement;
  const IconComponent = ACHIEVEMENT_ICONS[icon] || Trophy;
  const styles = LEVEL_STYLES[level] || LEVEL_STYLES[1];

  return (
    <div className={`group relative p-4 rounded-xl border bg-gradient-to-br ${styles.card}`}>
      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 hidden group-hover:block w-52 pointer-events-none">
        <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl text-center">
          <p className="text-xs font-bold text-white">{name}</p>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{description}</p>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-700" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <IconComponent className={`w-6 h-6 shrink-0 ${styles.icon}`} />
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${styles.badge}`}>
            {styles.label}
          </span>
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-white">{name}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{description}</p>
        </div>
        <p className="text-xs font-medium text-primary">+{xp_reward} XP</p>
      </div>
    </div>
  );
};

export default ProfilePage;
