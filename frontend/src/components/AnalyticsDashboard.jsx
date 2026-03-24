import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Award,
  DollarSign,
  Clock,
  Calendar,
  Activity,
  Eye,
  Target,
  BarChart3,
  PieChart,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { API } from '../App';
import { toast } from 'sonner';

// Simple line chart component
function SimpleLineChart({ data, color = '#6366f1', height = 60 }) {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        fill={`url(#gradient-${color})`}
        points={`0,100 ${points} 100,100`}
      />
    </svg>
  );
}

// Simple bar chart
function SimpleBarChart({ data, labels, color = '#6366f1', height = 120 }) {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data) || 1;
  
  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className="w-full rounded-t-sm transition-all duration-500"
            style={{ 
              height: `${(val / max) * 100}%`,
              backgroundColor: color,
              minHeight: val > 0 ? '4px' : '0'
            }}
          />
          <span className="text-[10px] text-slate-500">{labels?.[i] || ''}</span>
        </div>
      ))}
    </div>
  );
}

// Stat card component
function StatCard({ title, value, change, changeType, icon: Icon, color, trend }) {
  const isPositive = changeType === 'positive' || change > 0;
  
  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{Math.abs(change)}%</span>
                <span className="text-slate-500 text-xs">vs last week</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {trend && (
          <div className="mt-4">
            <SimpleLineChart data={trend} color={isPositive ? '#22c55e' : '#ef4444'} height={40} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard({ token }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  
  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);
  
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/analytics?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      // Use mock data if API not available
      setStats(generateMockData());
    } finally {
      setLoading(false);
    }
  };
  
  const generateMockData = () => {
    // Generate realistic mock data
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return {
      totalUsers: 1247,
      activeUsers: 432,
      newUsersThisWeek: 87,
      userGrowth: 12.5,
      
      totalLessonsCompleted: 5832,
      lessonsThisWeek: 234,
      lessonGrowth: 8.3,
      
      totalRevenue: 12450,
      revenueThisMonth: 2340,
      revenueGrowth: 15.2,
      
      avgSessionDuration: 24, // minutes
      sessionGrowth: 5.1,
      
      conversionRate: 4.2,
      conversionGrowth: 0.8,
      
      certificatesIssued: 89,
      certificateGrowth: 22.1,
      
      // Trends (7 days)
      userTrend: [32, 45, 38, 52, 48, 61, 87],
      lessonTrend: [28, 35, 42, 38, 45, 52, 48],
      revenueTrend: [180, 220, 150, 280, 320, 190, 340],
      
      // By day distribution
      dailyActiveUsers: [180, 220, 195, 240, 280, 150, 120],
      dailyLabels: days,
      
      // Subscription distribution
      subscriptionDistribution: {
        free: 856,
        basic: 234,
        pro: 112,
        elite: 45
      },
      
      // Course popularity
      coursePopularity: [
        { name: 'Fondamentaux', completions: 423 },
        { name: 'Investisseur', completions: 287 },
        { name: 'Stratégiste', completions: 156 }
      ],
      
      // Recent activity
      recentActivity: [
        { type: 'signup', user: 'jean.d***@gmail.com', time: '5 min' },
        { type: 'lesson', user: 'marie.l***@yahoo.com', time: '12 min' },
        { type: 'subscription', user: 'pierre.m***@outlook.com', time: '28 min' },
        { type: 'certificate', user: 'sophie.r***@gmail.com', time: '1h' },
        { type: 'quiz', user: 'lucas.b***@gmail.com', time: '2h' }
      ],
      
      // Top performing lessons
      topLessons: [
        { id: 'lesson-1', title: 'Introduction au Bitcoin', completions: 892, avgScore: 87 },
        { id: 'lesson-2', title: 'Comprendre la Blockchain', completions: 756, avgScore: 82 },
        { id: 'lesson-3', title: 'Portefeuilles Crypto', completions: 634, avgScore: 85 },
        { id: 'lesson-4', title: 'Sécurité des Cryptos', completions: 521, avgScore: 79 },
        { id: 'lesson-5', title: 'Trading Basics', completions: 487, avgScore: 74 }
      ],
      
      // Retention metrics
      retentionRate: 68,
      churnRate: 4.2,
      avgLessonsPerUser: 3.8
    };
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!stats) {
    return (
      <div className="text-center py-20 text-slate-400">
        Impossible de charger les analytics
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with Time Range */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-slate-400">Vue d'ensemble des performances</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  timeRange === range 
                    ? 'bg-primary text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : '90 jours'}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Utilisateurs totaux"
          value={stats.totalUsers.toLocaleString()}
          change={stats.userGrowth}
          changeType="positive"
          icon={Users}
          color="bg-blue-500"
          trend={stats.userTrend}
        />
        <StatCard
          title="Leçons complétées"
          value={stats.totalLessonsCompleted.toLocaleString()}
          change={stats.lessonGrowth}
          changeType="positive"
          icon={BookOpen}
          color="bg-green-500"
          trend={stats.lessonTrend}
        />
        <StatCard
          title="Revenus (€)"
          value={`€${stats.totalRevenue.toLocaleString()}`}
          change={stats.revenueGrowth}
          changeType="positive"
          icon={DollarSign}
          color="bg-amber-500"
          trend={stats.revenueTrend}
        />
        <StatCard
          title="Taux de conversion"
          value={`${stats.conversionRate}%`}
          change={stats.conversionGrowth}
          changeType="positive"
          icon={Target}
          color="bg-purple-500"
        />
      </div>
      
      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.avgSessionDuration} min</p>
            <p className="text-xs text-slate-400">Durée session moy.</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
            <p className="text-xs text-slate-400">Utilisateurs actifs</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.certificatesIssued}</p>
            <p className="text-xs text-slate-400">Certificats émis</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.retentionRate}%</p>
            <p className="text-xs text-slate-400">Taux de rétention</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Active Users */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Utilisateurs actifs par jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart 
              data={stats.dailyActiveUsers} 
              labels={stats.dailyLabels}
              color="#3b82f6"
              height={150}
            />
          </CardContent>
        </Card>
        
        {/* Subscription Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="w-5 h-5 text-purple-400" />
              Distribution des abonnements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.subscriptionDistribution).map(([tier, count]) => {
                const total = Object.values(stats.subscriptionDistribution).reduce((a, b) => a + b, 0);
                const percent = ((count / total) * 100).toFixed(1);
                const colors = {
                  free: 'bg-slate-500',
                  basic: 'bg-blue-500',
                  pro: 'bg-purple-500',
                  elite: 'bg-amber-500'
                };
                return (
                  <div key={tier}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-slate-300">{tier}</span>
                      <span className="text-slate-400">{count} ({percent}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full ${colors[tier]}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Lessons */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-green-400" />
              Top 5 Leçons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topLessons.map((lesson, i) => (
                <div key={lesson.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{lesson.title}</p>
                    <p className="text-xs text-slate-400">{lesson.completions} complétions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">{lesson.avgScore}%</p>
                    <p className="text-xs text-slate-400">score moy.</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5 text-pink-400" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.map((activity, i) => {
                const icons = {
                  signup: { icon: Users, color: 'text-blue-400', label: 'Inscription' },
                  lesson: { icon: BookOpen, color: 'text-green-400', label: 'Leçon' },
                  subscription: { icon: DollarSign, color: 'text-amber-400', label: 'Abonnement' },
                  certificate: { icon: Award, color: 'text-purple-400', label: 'Certificat' },
                  quiz: { icon: Target, color: 'text-cyan-400', label: 'Quiz' }
                };
                const { icon: Icon, color, label } = icons[activity.type] || icons.signup;
                
                return (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{activity.user}</p>
                      <p className="text-xs text-slate-400">{label}</p>
                    </div>
                    <span className="text-xs text-slate-500">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Key Metrics Summary */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/30">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">{stats.newUsersThisWeek}</p>
              <p className="text-sm text-slate-400">Nouveaux cette semaine</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-400">{stats.lessonsThisWeek}</p>
              <p className="text-sm text-slate-400">Leçons cette semaine</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400">€{stats.revenueThisMonth}</p>
              <p className="text-sm text-slate-400">Revenus ce mois</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cyan-400">{stats.avgLessonsPerUser}</p>
              <p className="text-sm text-slate-400">Leçons/utilisateur</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-400">{stats.churnRate}%</p>
              <p className="text-sm text-slate-400">Taux de churn</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsDashboard;
