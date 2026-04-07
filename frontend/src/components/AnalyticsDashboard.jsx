import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Users, TrendingUp, BookOpen, Award,
  DollarSign, Activity, BarChart3, PieChart,
  Loader2, ArrowUpRight, ArrowDownRight, RefreshCw,
  UserPlus, CreditCard
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { API } from '../App';
import { toast } from 'sonner';

// ── Mini SVG line chart ────────────────────────────────────────────────────
function LineSparkline({ data, color = '#6366f1', height = 40 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="w-full" style={{ height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="2.5" points={pts} vectorEffect="non-scaling-stroke" />
      <polygon fill={`url(#sg-${color.replace('#','')})`} points={`0,100 ${pts} 100,100`} />
    </svg>
  );
}

// ── Mini bar chart ─────────────────────────────────────────────────────────
function BarSparkline({ data, labels, color = '#6366f1', height = 130 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data) || 1;
  // Only show every Nth label to avoid crowding
  const step = data.length > 14 ? Math.ceil(data.length / 7) : 1;
  return (
    <div className="flex items-end justify-between gap-0.5" style={{ height }}>
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
          <div
            className="w-full rounded-t-sm transition-all duration-500"
            style={{ height: `${(val / max) * 85}%`, backgroundColor: color, minHeight: val > 0 ? 3 : 0 }}
          />
          <span className="text-[9px] text-slate-600 truncate w-full text-center">
            {i % step === 0 ? (labels?.[i] || '') : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ title, value, growth, icon: Icon, color, sparkline, sparkColor }) {
  const isPositive = growth >= 0;
  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-slate-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {growth !== undefined && (
              <div className={`flex items-center gap-1 mt-1.5 text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{Math.abs(growth)}%</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        {sparkline && <LineSparkline data={sparkline} color={sparkColor || '#6366f1'} height={36} />}
      </CardContent>
    </Card>
  );
}

// ── Main dashboard ─────────────────────────────────────────────────────────
export function AnalyticsDashboard({ token }) {
  const { t } = useTranslation();
  const [loading, setLoading]     = useState(true);
  const [stats, setStats]         = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/admin/analytics?period=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(data);
    } catch {
      toast.error(t('admin.analytics.loadError'));
    } finally {
      setLoading(false);
    }
  }, [timeRange, token, t]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-20 text-slate-400">{t('admin.analytics.loadError')}</div>;
  }

  const ranges = [
    { key: '7d',  label: t('admin.analytics.range7d')  },
    { key: '30d', label: t('admin.analytics.range30d') },
    { key: '90d', label: t('admin.analytics.range90d') },
  ];

  const subColors = { free: 'bg-slate-500', pro: 'bg-blue-500', elite: 'bg-purple-500' };
  const subTotal  = Object.values(stats.subscription_distribution).reduce((a, b) => a + b, 0) || 1;

  const fmtCurrency = (n) => `$${Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('admin.analytics.title')}</h2>
          <p className="text-slate-400 text-sm">{t('admin.analytics.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            {ranges.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeRange(key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  timeRange === key ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('admin.analytics.totalUsers')}
          value={stats.total_users.toLocaleString()}
          icon={Users}
          color="bg-blue-500"
          sparkline={stats.daily_signups}
          sparkColor="#3b82f6"
        />
        <StatCard
          title={t('admin.analytics.newUsers')}
          value={stats.new_users_in_range.toLocaleString()}
          growth={stats.user_growth}
          icon={UserPlus}
          color="bg-emerald-500"
          sparkline={stats.daily_signups}
          sparkColor="#10b981"
        />
        <StatCard
          title={t('admin.analytics.totalRevenue')}
          value={fmtCurrency(stats.total_revenue)}
          growth={stats.revenue_growth}
          icon={DollarSign}
          color="bg-amber-500"
          sparkline={stats.daily_revenue}
          sparkColor="#f59e0b"
        />
        <StatCard
          title={t('admin.analytics.revenueInRange')}
          value={fmtCurrency(stats.revenue_in_range)}
          icon={CreditCard}
          color="bg-purple-500"
          sparkline={stats.daily_revenue}
          sparkColor="#a855f7"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Activity,  color: 'text-pink-400',   val: stats.active_users.toLocaleString(),          label: t('admin.analytics.activeUsers') },
          { icon: BookOpen,  color: 'text-green-400',  val: stats.total_lessons_completed.toLocaleString(), label: t('admin.analytics.lessonsCompleted') },
          { icon: Award,     color: 'text-yellow-400', val: stats.total_certificates.toLocaleString(),    label: t('admin.analytics.certificates') },
          { icon: TrendingUp,color: 'text-cyan-400',   val: stats.avg_lessons_per_user,                   label: t('admin.analytics.avgLessonsPerUser') },
        ].map(({ icon: Icon, color, val, label }, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <Icon className={`w-7 h-7 ${color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-white">{val}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily signups */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              {t('admin.analytics.dailySignups')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarSparkline data={stats.daily_signups} labels={stats.daily_labels} color="#3b82f6" height={130} />
          </CardContent>
        </Card>

        {/* Subscription distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="w-4 h-4 text-purple-400" />
              {t('admin.analytics.subscriptionDist')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.subscription_distribution).map(([tier, count]) => {
                const pct = ((count / subTotal) * 100).toFixed(1);
                const label = t(`admin.analytics.${tier}`, tier);
                return (
                  <div key={tier}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-slate-300">{label}</span>
                      <span className="text-slate-400">{count.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7 }}
                        className={`h-full rounded-full ${subColors[tier] || 'bg-slate-500'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top lessons */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-4 h-4 text-green-400" />
              {t('admin.analytics.topLessons')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.top_lessons.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">—</p>
            ) : (
              <div className="space-y-2">
                {stats.top_lessons.map((lesson, i) => (
                  <div key={lesson.id} className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{lesson.title}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary shrink-0">
                      {lesson.completions.toLocaleString()} {t('admin.analytics.completions')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent signups */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              {t('admin.analytics.recentSignups')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recent_activity.map((item, i) => {
                const tierColors = { free: 'text-slate-400', pro: 'text-blue-400', elite: 'text-purple-400' };
                const ago = item.time
                  ? (() => {
                      const diff = Math.floor((Date.now() - new Date(item.time)) / 1000);
                      if (diff < 3600) return `${Math.floor(diff / 60)}m`;
                      if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
                      return `${Math.floor(diff / 86400)}d`;
                    })()
                  : '';
                return (
                  <div key={i} className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{item.user}</p>
                      <p className={`text-xs ${tierColors[item.tier] || 'text-slate-400'} capitalize`}>{item.tier}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">{ago}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
