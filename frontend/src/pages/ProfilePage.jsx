import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, API } from '../App';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import axios from 'axios';
import { 
  User, Edit2, Save, Camera, Trophy, Flame, Zap, 
  Calendar, Target, TrendingUp, Award, Shield, 
  BookOpen, Star, Crown, Clock, X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { user, token, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [streakInfo, setStreakInfo] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user || !token) return;

    try {
      const [profileRes, streakRes] = await Promise.all([
        axios.get(`${API}/v2/gamification/profile/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/v2/streak/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setProfile(profileRes.data);
      setStreakInfo(streakRes.data);
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
      toast.error('Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await axios.put(
        `${API}/auth/profile`,
        { full_name: editName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Profile updated!');
      setEditing(false);
      refreshUser?.();
    } catch (error) {
      toast.error('Failed to update profile');
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
                  Lv. {level}
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
                  {profile?.avatar?.title || 'Nouveau Venu'}
                </p>

                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-white font-bold">{xp.toLocaleString()} XP</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">
                    {levelProgress.xp_in_level || 0} / {levelProgress.xp_needed || 100} to Lv. {level + 1}
                  </span>
                </div>
                <Progress value={levelProgress.progress || 0} className="h-2 max-w-md" />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <Flame className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{streakInfo?.current_streak || 0}</p>
                  <p className="text-xs text-gray-400">Streak</p>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{profile?.coins || 0}</p>
                  <p className="text-xs text-gray-400">Coins</p>
                </div>
                <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                  <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                  <p className="text-xl font-bold text-white">{profile?.achievements_count || 0}</p>
                  <p className="text-xs text-gray-400">Achievements</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Stats */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Statistics
              </h2>
              <div className="space-y-4">
                <StatRow icon={BookOpen} label="Lessons Completed" value={profile?.stats?.lessons_completed || 0} color="blue" />
                <StatRow icon={Target} label="Quizzes Passed" value={profile?.stats?.quizzes_completed || 0} color="green" />
                <StatRow icon={Award} label="Exams Passed" value={profile?.stats?.exams_passed || 0} color="purple" />
                <StatRow icon={TrendingUp} label="Trades Executed" value={profile?.stats?.trades_count || 0} color="cyan" />
                <StatRow icon={Crown} label="Certificates Earned" value={profile?.stats?.certificates_earned || 0} color="yellow" />
              </div>
            </div>

            {/* Streak Info */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Streak Milestones
              </h2>
              
              <div className="mb-4 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Current Streak</p>
                    <p className="text-3xl font-bold text-orange-500">{streakInfo?.current_streak || 0} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Longest Streak</p>
                    <p className="text-xl font-bold text-white">{streakInfo?.longest_streak || 0} days</p>
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
                Achievements ({profile?.achievements_count || 0}/12)
              </h2>
              
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, i) => {
                  const earned = i < (profile?.achievements_count || 0);
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-xl flex items-center justify-center ${
                        earned 
                          ? 'bg-gradient-to-br from-yellow-500/30 to-orange-500/30 border border-yellow-500/50' 
                          : 'bg-gray-800/50 border border-gray-700'
                      }`}
                    >
                      {earned ? (
                        <Trophy className="w-8 h-8 text-yellow-500" />
                      ) : (
                        <span className="text-2xl text-gray-600">?</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
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

export default ProfilePage;
