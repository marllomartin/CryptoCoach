import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth, API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import {
  TrendingUp,
  BarChart3,
  Bell,
  BellPlus,
  Star,
  StarOff,
  Lock,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronLeft,
  Activity,
  Zap,
  Clock,
  Newspaper,
  Bot,
  Crown,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  X,
  ExternalLink,
  UserPlus
} from 'lucide-react';

// Fear & Greed colors
const getFearGreedColor = (value) => {
  if (value <= 25) return { color: 'text-red-500', bg: 'bg-red-500', labelKey: 'market.extremeFear' };
  if (value <= 45) return { color: 'text-orange-500', bg: 'bg-orange-500', labelKey: 'market.fear' };
  if (value <= 55) return { color: 'text-yellow-500', bg: 'bg-yellow-500', labelKey: 'market.neutral' };
  if (value <= 75) return { color: 'text-green-400', bg: 'bg-green-400', labelKey: 'market.greed' };
  return { color: 'text-green-500', bg: 'bg-green-500', labelKey: 'market.extremeGreed' };
};

// Format large numbers
const formatNumber = (num) => {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num?.toFixed(2);
};

// Format price change
const formatChange = (change) => {
  const formatted = change?.toFixed(2);
  return change >= 0 ? `+${formatted}%` : `${formatted}%`;
};

// Mini sparkline chart
function Sparkline({ data, color = '#22c55e', width = 80, height = 30 }) {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}

// Crypto row component
function CryptoRow({ crypto, rank, isWatchlisted, onToggleWatchlist, hasAlert, onSetAlert, showActions }) {
  const { t } = useTranslation();
  const isPositive = crypto.price_change_percentage_24h >= 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-4 bg-muted/30 hover:bg-muted/50 rounded-xl transition-all group"
    >
      <span className="text-sm text-slate-500 w-8">{rank}</span>
      
      <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{crypto.symbol?.toUpperCase()}</span>
          <span className="text-xs text-slate-400 truncate">{crypto.name}</span>
        </div>
      </div>
      
      <div className="hidden md:block">
        <Sparkline 
          data={crypto.sparkline_in_7d?.price?.slice(-24)} 
          color={isPositive ? '#22c55e' : '#ef4444'}
        />
      </div>
      
      <div className="text-right min-w-[100px]">
        <p className="font-semibold text-white">${crypto.current_price?.toLocaleString()}</p>
        <p className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {formatChange(crypto.price_change_percentage_24h)}
        </p>
      </div>
      
      <div className="hidden lg:block text-right min-w-[80px]">
        <p className="text-sm text-slate-400">${formatNumber(crypto.market_cap)}</p>
      </div>
      
      {showActions && (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleWatchlist(crypto.id)}
            className={`p-2 rounded-lg transition-colors ${isWatchlisted ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10'}`}
            title={isWatchlisted ? t('market.removeFromWatchlist') : t('market.addToWatchlist')}
          >
            {isWatchlisted ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onSetAlert(crypto)}
            className={`p-2 rounded-lg transition-colors ${hasAlert ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-primary hover:bg-primary/10'}`}
            title={t('market.setAlertTitle')}
          >
            {hasAlert ? <Bell className="w-4 h-4 fill-current" /> : <BellPlus className="w-4 h-4" />}
          </button>
        </div>
      )}
    </motion.div>
  );
}

// News item component
function NewsItem({ article, onOpen }) {
  return (
    <button
      onClick={() => onOpen(article.url)}
      className="w-full text-left block p-4 bg-muted/30 hover:bg-muted/50 rounded-xl transition-all group"
    >
      <div className="flex gap-4">
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt=""
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </p>
          <p className="text-sm text-slate-400 line-clamp-2 mb-2">{article.description}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{article.source}</span>
            <span>•</span>
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </button>
  );
}

// Guest prompt — shown instead of gated content for unsigned users
function GuestPrompt({ titleKey, descKey, t }) {
  return (
    <div className="text-center py-12">
      <UserPlus className="w-12 h-12 mx-auto mb-4 text-slate-500 opacity-50" />
      <p className="font-semibold text-white mb-2">{t(titleKey)}</p>
      <p className="text-sm text-slate-400 mb-6">{t(descKey)}</p>
      <Link to="/register">
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <UserPlus className="w-4 h-4" />
          {t('market.guestCTA')}
        </Button>
      </Link>
    </div>
  );
}

// AI Briefing component
function AIBriefing({ userTier, briefing }) {
  const { t, i18n } = useTranslation();
  const isLocked = userTier === 'free';

  if (isLocked) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/30 relative overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            {t('market.aiBriefing')}
            <Lock className="w-4 h-4 text-slate-400 ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="blur-sm mb-4">
            <p className="text-slate-300">
              "Bitcoin continues its consolidation above $65K support with key resistance at $70K.
              Ethereum shows strength with increasing L2 activity. Key events today include..."
            </p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-background/30">
            <Link to="/pricing">
              <Button className="gap-2 bg-primary hover:bg-primary/90">
                <Crown className="w-4 h-4" />
                {t('market.unlockAIInsights')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" />
          {t('market.aiBriefing')}
          <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full ml-auto">
            {new Date().toLocaleDateString(i18n.language)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {briefing ? (
          <div className="space-y-4">
            <p className="text-slate-300 leading-relaxed">{briefing.summary}</p>
            {briefing.keyEvents && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">{t('market.keyEventsToday')}</h4>
                <ul className="space-y-1">
                  {briefing.keyEvents.map((event, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                      <Zap className="w-3 h-3 text-primary" />
                      {event}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            {t('market.generatingBriefing')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Alert Modal
function AlertModal({ crypto, onClose, onSave }) {
  const { t } = useTranslation();
  const [priceAbove, setPriceAbove] = useState('');
  const [priceBelow, setPriceBelow] = useState('');

  const handleSave = () => {
    if (!priceAbove && !priceBelow) {
      toast.error(t('market.setAtLeastOne'));
      return;
    }
    onSave({
      cryptoId: crypto.id,
      symbol: crypto.symbol,
      currentPrice: crypto.current_price,
      priceAbove: priceAbove ? parseFloat(priceAbove) : null,
      priceBelow: priceBelow ? parseFloat(priceBelow) : null
    });
    onClose();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border border-border rounded-2xl p-6 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            {t('market.setPriceAlert')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 mb-6 p-3 bg-muted/50 rounded-xl">
          <img src={crypto.image} alt={crypto.name} className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-semibold text-white">{crypto.symbol?.toUpperCase()}</p>
            <p className="text-sm text-slate-400">{t('market.current', { price: crypto.current_price?.toLocaleString() })}</p>
          </div>
        </div>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm text-slate-400 mb-2 block flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-green-400" />
              {t('market.alertAbove')}
            </label>
            <Input
              type="number"
              placeholder={`e.g. ${(crypto.current_price * 1.1).toFixed(2)}`}
              value={priceAbove}
              onChange={e => setPriceAbove(e.target.value)}
              className="bg-muted"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-red-400" />
              {t('market.alertBelow')}
            </label>
            <Input
              type="number"
              placeholder={`e.g. ${(crypto.current_price * 0.9).toFixed(2)}`}
              value={priceBelow}
              onChange={e => setPriceBelow(e.target.value)}
              className="bg-muted"
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t('market.cancel')}
          </Button>
          <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90">
            {t('market.saveAlert')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main Component
export default function MarketIntelligencePage() {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();
  const [cryptos, setCryptos] = useState([]);
  const [globalData, setGlobalData] = useState(null);
  const [fearGreed, setFearGreed] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [activeTab, setActiveTab] = useState('market');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [newsPage, setNewsPage] = useState(0);
  const [newsBlocked, setNewsBlocked] = useState(false);
  const [newsViewed, setNewsViewed] = useState(0);

  const NEWS_PER_PAGE = 5;
  const FREE_NEWS_DAILY_LIMIT = 3;

  // Determine user tier limits
  const userTier = user?.subscription_tier || 'free';
  const isUnlimitedNews = ['pro', 'elite'].includes(userTier);
  const limits = {
    free: { cryptos: 10, watchlist: 3, alerts: 1 },
    starter: { cryptos: 50, watchlist: 10, alerts: 5 },
    pro: { cryptos: 100, watchlist: 30, alerts: 20 },
    elite: { cryptos: 999, watchlist: 999, alerts: 999 }
  }[userTier] || { cryptos: 10, watchlist: 3, alerts: 1 };

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch market data (news fetched separately when tab opens)
  const fetchData = useCallback(async () => {
    try {
      const [cryptoRes, globalRes] = await Promise.all([
        axios.get(`${API}/market/cryptos?limit=${limits.cryptos}`),
        axios.get(`${API}/market/global`)
      ]);

      setCryptos(cryptoRes.data.cryptos || []);
      setGlobalData(globalRes.data);
      setFearGreed(globalRes.data.fear_greed);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching market data:', error);
      setFearGreed({ value: 65, label: 'Greed' });
    } finally {
      setLoading(false);
    }
  }, [limits.cryptos]);

  // Check daily view status and fetch news
  const fetchNews = useCallback(async () => {
    try {
      if (user && token) {
        const statusRes = await axios.get(`${API}/market/news/daily-views`, { headers: authHeaders });
        const { viewed, blocked } = statusRes.data;
        setNewsViewed(viewed);
        if (blocked) {
          setNewsBlocked(true);
          return;
        }
      }
      const res = await axios.get(`${API}/market/news?limit=50`);
      setNews(res.data.articles || []);
    } catch (e) {
      console.error('Error fetching news:', e);
    }
  }, [user, token]);

  // Record article open and navigate to it
  const handleArticleOpen = async (url) => {
    if (user && token && !isUnlimitedNews) {
      try {
        const res = await axios.post(
          `${API}/market/news/view`,
          { article_url: url },
          { headers: authHeaders }
        );
        const { viewed, blocked, allowed } = res.data;
        setNewsViewed(viewed);
        if (!allowed) {
          setNewsBlocked(true);
          return;
        }
        if (blocked) setNewsBlocked(true);
      } catch (e) {
        console.error('Error recording news view:', e);
      }
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Fetch news when news tab is opened (only once per session)
  useEffect(() => {
    if (activeTab === 'news' && news.length === 0 && !newsBlocked) {
      fetchNews();
    }
  }, [activeTab]);
  
  // Load user's watchlist and alerts
  useEffect(() => {
    if (user) {
      const savedWatchlist = localStorage.getItem(`watchlist_${user.id}`);
      const savedAlerts = localStorage.getItem(`alerts_${user.id}`);
      if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
      if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
    }
  }, [user]);
  
  // Toggle watchlist
  const toggleWatchlist = (cryptoId) => {
    if (!user) {
      toast.error(t('market.loginToWatchlist'));
      return;
    }

    let newWatchlist;
    if (watchlist.includes(cryptoId)) {
      newWatchlist = watchlist.filter(id => id !== cryptoId);
    } else {
      if (watchlist.length >= limits.watchlist) {
        toast.error(t('market.watchlistLimitReached', { limit: limits.watchlist }));
        return;
      }
      newWatchlist = [...watchlist, cryptoId];
    }

    setWatchlist(newWatchlist);
    localStorage.setItem(`watchlist_${user.id}`, JSON.stringify(newWatchlist));
    toast.success(watchlist.includes(cryptoId) ? t('market.removedFromWatchlist') : t('market.addedToWatchlist'));
  };
  
  // Save alert
  const saveAlert = (alertData) => {
    if (!user) {
      toast.error(t('market.loginToAlerts'));
      return;
    }

    const existingAlertIndex = alerts.findIndex(a => a.cryptoId === alertData.cryptoId);
    let newAlerts;

    if (existingAlertIndex >= 0) {
      newAlerts = [...alerts];
      newAlerts[existingAlertIndex] = alertData;
    } else {
      if (alerts.length >= limits.alerts) {
        toast.error(t('market.alertLimitReached', { limit: limits.alerts }));
        return;
      }
      newAlerts = [...alerts, alertData];
    }

    setAlerts(newAlerts);
    localStorage.setItem(`alerts_${user.id}`, JSON.stringify(newAlerts));
    toast.success(t('market.alertSaved'));
  };
  
  // Filter cryptos by search
  const filteredCryptos = cryptos.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get watchlisted cryptos
  const watchlistedCryptos = cryptos.filter(c => watchlist.includes(c.id));
  
  const fgData = fearGreed ? getFearGreedColor(fearGreed.value) : null;
  
  // Skeleton shown inline while loading — no full-page block
  
  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-primary" />
                {t('market.title')}
              </h1>
              <p className="text-slate-400 mt-1">
                {t('market.subtitle')}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                {t('market.updated', { time: lastUpdate.toLocaleTimeString(i18n.language) })}
              </div>
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              {userTier !== 'elite' && (
                <Link to="/pricing">
                  <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-purple-500">
                    <Crown className="w-4 h-4" />
                    {t('market.upgrade')}
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          {/* Global Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-sm text-slate-400 mb-1">{t('market.marketCap')}</p>
                <p className="text-2xl font-bold text-white">
                  ${formatNumber(globalData?.total_market_cap?.usd || 2400000000000)}
                </p>
                <p className={`text-sm ${(globalData?.market_cap_change_percentage_24h_usd || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatChange(globalData?.market_cap_change_percentage_24h_usd || 1.5)}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-sm text-slate-400 mb-1">{t('market.volume24h')}</p>
                <p className="text-2xl font-bold text-white">
                  ${formatNumber(globalData?.total_volume?.usd || 89000000000)}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-sm text-slate-400 mb-1">{t('market.btcDominance')}</p>
                <p className="text-2xl font-bold text-white">
                  {(globalData?.market_cap_percentage?.btc || 52.3).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            
            <Card className={`border-border ${fgData?.bg}/10`}>
              <CardContent className="p-4">
                <p className="text-sm text-slate-400 mb-1">{t('market.fearGreed')}</p>
                <div className="flex items-center gap-3">
                  <p className={`text-2xl font-bold ${fgData?.color}`}>
                    {fearGreed?.value || 65}
                  </p>
                  <span className={`text-sm px-2 py-0.5 rounded-full ${fgData?.bg}/20 ${fgData?.color}`}>
                    {fgData ? t(fgData.labelKey) : ''}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'market', label: t('market.tabMarket'), icon: Activity },
              { id: 'watchlist', label: t('market.tabWatchlist', { count: watchlist.length }), icon: Star },
              { id: 'alerts', label: t('market.tabAlerts', { count: alerts.length }), icon: Bell },
              { id: 'news', label: t('market.tabNews'), icon: Newspaper },
              { id: 'ai', label: t('market.tabAI'), icon: Bot, premium: userTier === 'free' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white' 
                    : 'bg-muted/50 text-slate-400 hover:text-white hover:bg-muted'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.premium && <Lock className="w-3 h-3" />}
              </button>
            ))}
          </div>
          
          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'market' && (
                <>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      placeholder={t('market.searchPlaceholder')}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10 bg-muted/50"
                    />
                  </div>
                  
                  {/* Crypto List */}
                  <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        {t('market.topCryptos')}
                      </CardTitle>
                      <span className="text-sm text-slate-400">
                        {t('market.showing', { shown: filteredCryptos.length, limit: limits.cryptos })}
                        {userTier !== 'elite' && (
                          <Link to="/pricing" className="text-primary ml-2 hover:underline">
                            {t('market.unlockMore')}
                          </Link>
                        )}
                      </span>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                      {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 rounded-xl animate-pulse">
                            <div className="w-8 h-4 bg-muted rounded" />
                            <div className="w-8 h-8 bg-muted rounded-full" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-muted rounded w-20" />
                            </div>
                            <div className="space-y-2 text-right">
                              <div className="h-3 bg-muted rounded w-16" />
                              <div className="h-3 bg-muted rounded w-10 ml-auto" />
                            </div>
                          </div>
                        ))
                      ) : (
                        filteredCryptos.map((crypto, index) => (
                          <CryptoRow
                            key={crypto.id}
                            crypto={crypto}
                            rank={index + 1}
                            isWatchlisted={watchlist.includes(crypto.id)}
                            onToggleWatchlist={toggleWatchlist}
                            hasAlert={alerts.some(a => a.cryptoId === crypto.id)}
                            onSetAlert={setSelectedCrypto}
                            showActions={!!user}
                          />
                        ))
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
              
              {activeTab === 'watchlist' && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      {t('market.yourWatchlist')}
                      <span className="text-sm text-slate-400 ml-auto">
                        {watchlist.length}/{limits.watchlist}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {watchlistedCryptos.length > 0 ? (
                      <div className="space-y-2">
                        {watchlistedCryptos.map((crypto, index) => (
                          <CryptoRow
                            key={crypto.id}
                            crypto={crypto}
                            rank={index + 1}
                            isWatchlisted={true}
                            onToggleWatchlist={toggleWatchlist}
                            hasAlert={alerts.some(a => a.cryptoId === crypto.id)}
                            onSetAlert={setSelectedCrypto}
                            showActions={!!user}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{t('market.watchlistEmpty')}</p>
                        <p className="text-sm">{t('market.watchlistEmptyHint')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'alerts' && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-primary" />
                      {t('market.priceAlerts')}
                      <span className="text-sm text-slate-400 ml-auto">
                        {alerts.length}/{limits.alerts}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {alerts.length > 0 ? (
                      <div className="space-y-3">
                        {alerts.map((alert, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">{alert.symbol?.toUpperCase()}</span>
                              </div>
                              <div>
                                <p className="font-medium text-white">{alert.symbol?.toUpperCase()}</p>
                                <div className="flex gap-3 text-sm">
                                  {alert.priceAbove && (
                                    <span className="text-green-400">{t('market.above', { price: alert.priceAbove })}</span>
                                  )}
                                  {alert.priceBelow && (
                                    <span className="text-red-400">{t('market.below', { price: alert.priceBelow })}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const newAlerts = alerts.filter((_, i) => i !== index);
                                setAlerts(newAlerts);
                                localStorage.setItem(`alerts_${user.id}`, JSON.stringify(newAlerts));
                                toast.success(t('market.alertRemoved'));
                              }}
                              className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{t('market.noAlerts')}</p>
                        <p className="text-sm">{t('market.noAlertsHint')}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {activeTab === 'news' && (
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Newspaper className="w-5 h-5 text-blue-400" />
                      {t('market.cryptoNews')}
                    </CardTitle>
                    {user && !isUnlimitedNews && !newsBlocked && (
                      <span className="text-xs text-slate-400">
                        {t('market.newsViewsLeft', { left: Math.max(0, FREE_NEWS_DAILY_LIMIT - newsViewed), count: Math.max(0, FREE_NEWS_DAILY_LIMIT - newsViewed) })}
                      </span>
                    )}
                  </CardHeader>
                  <CardContent>
                    {!user ? (
                      <GuestPrompt titleKey="market.guestNewsTitle" descKey="market.guestNewsDesc" t={t} />
                    ) : newsBlocked ? (
                      <div className="text-center py-12">
                        <Lock className="w-12 h-12 mx-auto mb-4 text-slate-500 opacity-50" />
                        <p className="font-semibold text-white mb-2">{t('market.newsDailyLimitTitle')}</p>
                        <p className="text-sm text-slate-400 mb-6">{t('market.newsDailyLimitDesc')}</p>
                        <Link to="/pricing">
                          <Button className="gap-2 bg-primary hover:bg-primary/90">
                            <Crown className="w-4 h-4" />
                            {t('market.upgradeForMore')}
                          </Button>
                        </Link>
                      </div>
                    ) : news.length === 0 ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex gap-4 p-4 rounded-xl animate-pulse">
                            <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-muted rounded w-3/4" />
                              <div className="h-3 bg-muted rounded w-full" />
                              <div className="h-3 bg-muted rounded w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {news.slice(newsPage * NEWS_PER_PAGE, (newsPage + 1) * NEWS_PER_PAGE).map((article, index) => (
                            <NewsItem key={index} article={article} onOpen={handleArticleOpen} />
                          ))}
                        </div>
                        {/* Pagination */}
                        {news.length > NEWS_PER_PAGE && (
                          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                            <button
                              onClick={() => setNewsPage(p => Math.max(0, p - 1))}
                              disabled={newsPage === 0}
                              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              {t('market.prev')}
                            </button>
                            <span className="text-sm text-slate-500">
                              {newsPage + 1} / {Math.ceil(news.length / NEWS_PER_PAGE)}
                            </span>
                            <button
                              onClick={() => setNewsPage(p => Math.min(Math.ceil(news.length / NEWS_PER_PAGE) - 1, p + 1))}
                              disabled={(newsPage + 1) * NEWS_PER_PAGE >= news.length}
                              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              {t('market.next')}
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'ai' && (
                <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-primary" />
                      {t('market.aiBriefing')}
                      <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full ml-auto">{t('market.comingSoon')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!user
                      ? <GuestPrompt titleKey="market.guestAITitle" descKey="market.guestAIDesc" t={t} />
                      : <p className="text-slate-400 text-sm">{t('market.aiBriefingComingSoon')}</p>
                    }
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Briefing Coming Soon */}
              {activeTab !== 'ai' && (
                <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-primary" />
                      {t('market.aiBriefing')}
                      <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full ml-auto">{t('market.comingSoon')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-sm">{t('market.aiBriefingComingSoon')}</p>
                  </CardContent>
                </Card>
              )}
              
              {/* Quick Stats — only for signed-in users */}
              {user && <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">{t('market.yourStats')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t('market.tier')}</span>
                    <span className="font-medium text-white capitalize">{userTier}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t('market.tabWatchlist', { count: '' }).replace(' ()', '')}</span>
                    <span className="font-medium text-white">{watchlist.length}/{limits.watchlist}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t('market.tabAlerts', { count: '' }).replace(' ()', '')}</span>
                    <span className="font-medium text-white">{alerts.length}/{limits.alerts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{t('market.newsAccess')}</span>
                    <span className="font-medium text-white">{isUnlimitedNews ? t('market.unlimited') : t('market.perDay', { n: FREE_NEWS_DAILY_LIMIT })}</span>
                  </div>
                  {userTier !== 'elite' && (
                    <Link to="/pricing">
                      <Button className="w-full mt-2 gap-2">
                        <Crown className="w-4 h-4" />
                        {t('market.upgradeForMore')}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>}

              {/* Trending */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    {t('market.trending')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cryptos.slice(0, 5).map((crypto, index) => (
                    <div key={crypto.id} className="flex items-center gap-3">
                      <span className="text-sm text-slate-500 w-4">{index + 1}</span>
                      <img src={crypto.image} alt={crypto.name} className="w-6 h-6 rounded-full" />
                      <span className="font-medium text-white flex-1">{crypto.symbol?.toUpperCase()}</span>
                      <span className={crypto.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {formatChange(crypto.price_change_percentage_24h)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alert Modal */}
      <AnimatePresence>
        {selectedCrypto && (
          <AlertModal
            crypto={selectedCrypto}
            onClose={() => setSelectedCrypto(null)}
            onSave={saveAlert}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
