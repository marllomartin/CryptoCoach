import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API } from '../App';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import axios from 'axios';
import { 
  Trophy, Flame, Target, TrendingUp, Award, Zap, 
  ChevronRight, Star, Crown, Users, BookOpen, 
  BarChart3, Wallet, Gift, Clock, ArrowUp, ArrowDown, Map
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

const HubPage = () => {
  const { user, token, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [gamificationProfile, setGamificationProfile] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [marketOverview, setMarketOverview] = useState(null);
  const [quests, setQuests] = useState({ daily: [], weekly: [] });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user || !token) return;
    
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [profileRes, portfolioRes, marketRes, questsRes, leaderboardRes] = await Promise.all([
        axios.get(`${API}/v2/gamification/profile/${user.id}`, { headers }).catch(() => null),
        axios.get(`${API}/v2/trading/portfolio/${user.id}`, { headers }).catch(() => null),
        axios.get(`${API}/v2/trading/market/overview`, { headers }).catch(() => null),
        axios.get(`${API}/v2/gamification/quests/${user.id}`, { headers }).catch(() => null),
        axios.get(`${API}/v2/gamification/leaderboard?limit=5`, { headers }).catch(() => null)
      ]);

      if (profileRes?.data) setGamificationProfile(profileRes.data);
      if (portfolioRes?.data) setPortfolio(portfolioRes.data);
      if (marketRes?.data) setMarketOverview(marketRes.data);
      if (questsRes?.data) setQuests(questsRes.data);
      if (leaderboardRes?.data) setLeaderboard(leaderboardRes.data);

      // Update streak
      await axios.post(`${API}/v2/gamification/streak/${user.id}`, {}, { headers }).catch(() => null);
      
    } catch (error) {
      console.error('Error fetching hub data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">{t('common.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const level = gamificationProfile?.level || 1;
  const xp = gamificationProfile?.xp_points || 0;
  const levelProgress = gamificationProfile?.level_progress || { progress: 0, xp_needed: 100 };
  const streak = gamificationProfile?.streak_days || 0;
  const coins = gamificationProfile?.coins || 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-8" data-testid="hub-page">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Hero Section - Player Status */}
          <div className="relative mb-8" data-testid="player-status-section">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-600/10 to-primary/20 rounded-2xl blur-3xl"></div>
            <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                
                {/* Avatar & Level */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 p-1">
                      <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">{user?.full_name?.charAt(0) || 'U'}</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-primary text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                      {t('hub.level')} {level}
                    </div>
                  </div>
                  
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1" data-testid="user-name">{user?.full_name}</h1>
                    <p className="text-primary font-medium" data-testid="user-title">{gamificationProfile?.avatar?.title || 'title_newbie'}</p>
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span data-testid="xp-points">{xp.toLocaleString()} {t('hub.xp')}</span>
                        <span className="text-gray-600">•</span>
                        <span>{levelProgress.xp_in_level || 0} / {levelProgress.xp_needed || 100} {t('hub.towardsLevel')} {level + 1}</span>
                      </div>
                      <Progress value={levelProgress.progress || 0} className="h-2 w-64" />
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4" data-testid="quick-stats">
                  <StatCard icon={Flame} label={t('hub.streak')} value={`${streak} ${t('hub.days')}`} color="orange" testId="stat-streak" />
                  <StatCard icon={Star} label={t('hub.coins')} value={coins.toLocaleString()} color="yellow" testId="stat-coins" />
                  <StatCard icon={Trophy} label={t('hub.achievements')} value={gamificationProfile?.achievements_count || 0} color="purple" testId="stat-achievements" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left Column - Quests & Progress */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Daily Quests */}
              <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-xl p-6" data-testid="daily-quests-section">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    {t('hub.dailyQuests')}
                  </h2>
                  <span className="text-sm text-gray-400">{t('hub.resetIn')} 14h</span>
                </div>
                
                <div className="space-y-3" data-testid="quests-list">
                  {quests.daily?.length > 0 ? quests.daily.map((quest) => (
                    <QuestCard key={quest.id} quest={quest} />
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t('quests.noQuests')}</p>
                      <p className="text-sm">{t('quests.comeBackTomorrow')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Market Overview */}
              <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-xl p-6" data-testid="market-overview-section">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    {t('hub.liveMarket')}
                  </h2>
                  <Link to="/trading-arena">
                    <Button variant="ghost" size="sm" className="text-primary">
                      {t('hub.tradingArena')} <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
                
                {marketOverview?.prices && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="market-prices-grid">
                    {Object.entries(marketOverview.prices).slice(0, 8).map(([symbol, data]) => (
                      <CryptoCard key={symbol} symbol={symbol} data={data} />
                    ))}
                  </div>
                )}
                
                {marketOverview && (
                  <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                    <span className="text-gray-400">{t('hub.marketSentiment')}:</span>
                    <span className={`font-bold ${marketOverview.market_sentiment === 'bullish' ? 'text-green-500' : 'text-red-500'}`}>
                      {marketOverview.market_sentiment === 'bullish' ? `🚀 ${t('hub.bullish')}` : `🐻 ${t('hub.bearish')}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Portfolio Summary */}
              {portfolio && (
                <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-xl p-6" data-testid="portfolio-section">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-blue-500" />
                      {t('hub.myPortfolio')}
                    </h2>
                    <Link to="/trading-arena">
                      <Button variant="outline" size="sm">{t('hub.trade')}</Button>
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center" data-testid="portfolio-total-value">
                      <p className="text-gray-400 text-sm">{t('hub.totalValue')}</p>
                      <p className="text-2xl font-bold text-white">${portfolio.total_value?.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center" data-testid="portfolio-cash">
                      <p className="text-gray-400 text-sm">{t('hub.availableCash')}</p>
                      <p className="text-2xl font-bold text-green-500">${portfolio.balance?.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center" data-testid="portfolio-pnl">
                      <p className="text-gray-400 text-sm">{t('hub.totalPnL')}</p>
                      <p className={`text-2xl font-bold ${portfolio.total_pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {portfolio.total_pnl >= 0 ? '+' : ''}{portfolio.total_pnl?.toLocaleString(undefined, {maximumFractionDigits: 2})}$
                      </p>
                    </div>
                  </div>
                  
                  {portfolio.career_level && (
                    <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-gray-300">{t('hub.careerRank')}:</span>
                      <span className="font-bold text-primary">{portfolio.career_level.current?.name || 'Stagiaire'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Quick Actions & Leaderboard */}
            <div className="space-y-6">
              
              {/* Quick Actions */}
              <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-xl p-6" data-testid="quick-actions-section">
                <h2 className="text-lg font-bold text-white mb-4">{t('hub.quickActions')}</h2>
                <div className="space-y-3">
                  <Link to="/crypto-quest" className="block" data-testid="action-crypto-quest">
                    <ActionButton icon={Map} label="Crypto Quest" sublabel={t('quest.subtitle')} />
                  </Link>
                  <Link to="/academy" className="block" data-testid="action-academy">
                    <ActionButton icon={BookOpen} label={t('hub.continueLearning')} sublabel={`23 ${t('hub.lessonsAvailable')}`} />
                  </Link>
                  <Link to="/trading-arena" className="block" data-testid="action-trading-arena">
                    <ActionButton icon={TrendingUp} label={t('hub.tradingArena')} sublabel={t('hub.proSimulator')} />
                  </Link>
                  <Link to="/simulator" className="block">
                    <ActionButton icon={BarChart3} label={t('hub.classicSimulator')} sublabel={t('hub.simpleMode')} />
                  </Link>
                  <Link to="/leaderboard" className="block">
                    <ActionButton icon={Trophy} label={t('nav.leaderboard')} sublabel={t('hub.viewAllPlayers')} />
                  </Link>
                </div>
              </div>

              {/* Top Players */}
              <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-xl p-6" data-testid="leaderboard-section">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    {t('hub.topPlayers')}
                  </h2>
                  <Link to="/leaderboard">
                    <Button variant="ghost" size="sm" className="text-primary text-xs">
                      {t('hub.viewAll')}
                    </Button>
                  </Link>
                </div>
                
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((player, index) => (
                    <LeaderboardRow key={player.user_id} player={player} rank={index + 1} currentUserId={user?.id} />
                  ))}
                </div>
              </div>

              {/* Achievements Progress */}
              <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-xl p-6" data-testid="achievements-section">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    {t('hub.achievements')}
                  </h2>
                  <span className="text-sm text-gray-400">{gamificationProfile?.achievements_count || 0}/12</span>
                </div>
                
                <Progress value={(gamificationProfile?.achievements_count || 0) / 12 * 100} className="h-2 mb-4" />
                
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        i < (gamificationProfile?.achievements_count || 0) 
                          ? 'bg-gradient-to-br from-purple-600 to-primary' 
                          : 'bg-gray-800'
                      }`}
                    >
                      {i < (gamificationProfile?.achievements_count || 0) ? (
                        <Trophy className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-gray-600">?</span>
                      )}
                    </div>
                  ))}
                </div>
                
                <Link to="/achievements" className="block mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    Voir tous les achievements
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Sub-components
const StatCard = ({ icon: Icon, label, value, color, testId }) => {
  const colors = {
    orange: 'text-orange-500 bg-orange-500/10',
    yellow: 'text-yellow-500 bg-yellow-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    green: 'text-green-500 bg-green-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
  };
  
  return (
    <div className={`px-4 py-3 rounded-xl ${colors[color]} flex items-center gap-3`} data-testid={testId}>
      <Icon className={`w-5 h-5 ${colors[color].split(' ')[0]}`} />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

const QuestCard = ({ quest }) => {
  const progress = Math.min((quest.progress / quest.target) * 100, 100);
  
  return (
    <div className={`p-4 rounded-lg border ${quest.completed ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-800/50 border-gray-700'}`} data-testid="quest-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target className={`w-4 h-4 ${quest.completed ? 'text-green-500' : 'text-primary'}`} />
          <span className="font-medium text-white">{quest.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-yellow-500">{quest.coins_reward} 🪙</span>
          <span className="text-primary">+{quest.xp_reward} XP</span>
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-2">{quest.description}</p>
      <div className="flex items-center gap-2">
        <Progress value={progress} className="h-2 flex-1" />
        <span className="text-sm text-gray-400">{quest.progress}/{quest.target}</span>
      </div>
    </div>
  );
};

const CryptoCard = ({ symbol, data }) => {
  const isPositive = data.change_24h >= 0;
  
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800/70 transition-colors" data-testid={`crypto-card-${symbol}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-white">{symbol}</span>
        {isPositive ? (
          <ArrowUp className="w-4 h-4 text-green-500" />
        ) : (
          <ArrowDown className="w-4 h-4 text-red-500" />
        )}
      </div>
      <p className="text-lg font-medium text-white">
        ${data.price?.toLocaleString(undefined, {maximumFractionDigits: data.price < 1 ? 4 : 2})}
      </p>
      <p className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? '+' : ''}{data.change_24h?.toFixed(2)}%
      </p>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, sublabel }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer group">
    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1">
      <p className="font-medium text-white">{label}</p>
      <p className="text-xs text-gray-500">{sublabel}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors" />
  </div>
);

const LeaderboardRow = ({ player, rank, currentUserId }) => {
  const isCurrentUser = player.user_id === currentUserId;
  const rankColors = {
    1: 'text-yellow-500',
    2: 'text-gray-400',
    3: 'text-amber-600'
  };
  
  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg ${isCurrentUser ? 'bg-primary/10 border border-primary/30' : 'hover:bg-gray-800/50'} transition-colors`}>
      <span className={`w-6 text-center font-bold ${rankColors[rank] || 'text-gray-500'}`}>
        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
      </span>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-sm font-bold">
        {player.name?.charAt(0) || 'U'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate text-sm">{player.name}</p>
        <p className="text-xs text-gray-500">Niv. {player.level}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-primary text-sm">{player.xp_points?.toLocaleString()}</p>
        <p className="text-xs text-gray-500">XP</p>
      </div>
    </div>
  );
};

export default HubPage;
