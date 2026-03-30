import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API, useAuth } from '../App';
import { useTranslation } from 'react-i18next';
import { 
  Trophy, 
  Medal,
  Award,
  Flame,
  BookOpen,
  Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${API}/leaderboard`);
        setLeaderboard(response.data);
      } catch (e) {
        console.error('Failed to fetch leaderboard', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-amber-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-slate-500 font-mono">#{rank}</span>;
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-amber-500/20 to-amber-400/10 border-amber-500/30';
      case 2:
        return 'bg-gradient-to-r from-slate-400/20 to-slate-300/10 border-slate-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-700/20 to-amber-600/10 border-amber-600/30';
      default:
        return 'bg-card border-border';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            {t('leaderboard.title')}
          </h1>
          <p className="text-slate-400 text-lg">
            {t('leaderboard.subtitle')}
          </p>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-slate-400"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500/20" />
            <span>{t('leaderboard.xpPoints')}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>{t('academy.lessons')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            <span>{t('dashboard.certificatesEarned')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            <span>{t('leaderboard.streakLabel')}</span>
          </div>
        </motion.div>

        {/* Leaderboard */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i} className="bg-card border-border animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted" />
                    <div className="flex-1">
                      <div className="h-5 bg-muted rounded w-1/3 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Trophy className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold mb-2">{t('leaderboard.noRankings')}</h3>
              <p className="text-slate-400">{t('leaderboard.beFirst')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = user?.full_name === entry.name;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`border ${getRankStyle(entry.rank)} ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* Name & Stats */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">
                              {entry.name}
                              {isCurrentUser && <span className="text-primary ml-2">{t('leaderboard.you')}</span>}
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {entry.lessons_completed} {t('leaderboard.lessonsLabel')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              {entry.certificates} {t('dashboard.certificatesEarned')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Flame className="w-4 h-4" />
                              {entry.streak_days} {t('leaderboard.streakLabel')}
                            </span>
                          </div>
                        </div>

                        {/* XP */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-heading font-bold text-green-500">
                            {entry.xp_points.toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-500">XP</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">How to Earn XP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium">Complete Lessons</div>
                    <div className="text-slate-400">+50 XP per lesson</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <div className="font-medium">Pass Quizzes</div>
                    <div className="text-slate-400">Up to +100 XP</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="font-medium">Earn Certificates</div>
                    <div className="text-slate-400">+500 XP per cert</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
