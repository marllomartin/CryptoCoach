import React, { useState, useEffect, useRef } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API, useAuth } from '../App';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import {
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  Crown,
  Shield,
  Settings,
  RefreshCw,
  TrendingUp,
  Mail,
  Globe,
  HelpCircle,
  Tag,
  Calendar,
  Percent,
  XCircle,
  Award
} from 'lucide-react';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import NewsletterAdminTab from '../components/NewsletterAdminTab';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator';
  const defaultTab = isAdmin || isModerator ? 'dashboard' : 'courses';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Check admin access
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!['admin', 'moderator', 'editor'].includes(user.role)) {
      toast.error(t('admin.accessDenied'));
      navigate('/');
      return;
    }

    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error(t('admin.errors.loadingStats'));
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                {t('admin.title')}
              </h1>
              <p className="text-slate-400 mt-1">{t('admin.subtitle')}</p>
            </div>
            <Button onClick={fetchStats} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('admin.refresh')}
            </Button>
          </div>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap w-full mb-8 h-auto gap-1">
              {isAdmin && (
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {t('admin.tabs.dashboard')}
                </TabsTrigger>
              )}
              {isAdmin && (
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  {t('admin.tabs.analytics')}
                </TabsTrigger>
              )}
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {t('admin.tabs.courses')}
              </TabsTrigger>
              {(isAdmin || isModerator) && (
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('admin.tabs.users')}
                </TabsTrigger>
              )}
              <TabsTrigger value="newsletter" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('admin.tabs.newsletter')}
              </TabsTrigger>
              <TabsTrigger value="blog" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('admin.tabs.blog')}
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="promotions" className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  {t('admin.tabs.promotions')}
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="dashboard">
              <DashboardTab stats={stats} />
            </TabsContent>
            
            <TabsContent value="analytics">
              <AnalyticsDashboard token={token} />
            </TabsContent>
            
            <TabsContent value="courses">
              <CoursesTab token={token} currentUser={user} />
            </TabsContent>

            <TabsContent value="users">
              <UsersTab token={token} currentUser={user} />
            </TabsContent>

            <TabsContent value="newsletter">
              <NewsletterAdminTab token={token} />
            </TabsContent>

            <TabsContent value="blog">
              <BlogTab token={token} currentUser={user} />
            </TabsContent>
            

            <TabsContent value="promotions">
              <PromotionsTab token={token} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}

// Dashboard Tab Component
function DashboardTab({ stats }) {
  const { t } = useTranslation();
  if (!stats) return null;

  const statCards = [
    { label: t('admin.dashboard.stats.users'), value: stats.total_users, icon: Users, color: 'text-blue-500' },
    { label: t('admin.dashboard.stats.newUsers'), value: stats.recent_signups, icon: Plus, color: 'text-green-500' },
    { label: t('admin.dashboard.stats.courses'), value: stats.courses_count, icon: BookOpen, color: 'text-purple-500' },
    { label: t('admin.dashboard.stats.lessons'), value: stats.lessons_count, icon: FileText, color: 'text-orange-500' },
    { label: t('admin.dashboard.stats.articles'), value: stats.blog_posts_count, icon: FileText, color: 'text-pink-500' },
    { label: t('admin.dashboard.stats.transactions'), value: stats.paid_transactions, icon: Crown, color: 'text-yellow-500' },
  ];
  
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Subscription Breakdown */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">{t('admin.dashboard.subscriptionBreakdown')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(stats.active_subscriptions || {}).map(([tier, count]) => (
              <div key={tier} className="text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-primary">{count}</p>
                <p className="text-sm text-slate-400 capitalize">{tier}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Supported languages config
const Flag = ({ countryCode }) => (
  <ReactCountryFlag
    countryCode={countryCode}
    svg
    style={{ width: '1.1em', height: '1.1em', borderRadius: '2px', objectFit: 'cover' }}
  />
);

const LANG_OPTIONS = [
  { code: 'en', label: 'English', countryCode: 'GB' },
  { code: 'fr', label: 'Français', countryCode: 'FR' },
  { code: 'ar', label: 'العربية', countryCode: 'SA' },
  { code: 'pt', label: 'Português', countryCode: 'BR' },
];

const EMPTY_COURSE_TRANSLATIONS = () =>
  Object.fromEntries(LANG_OPTIONS.map(({ code }) => [code, { title: '', description: '', topics: '' }]));

const EMPTY_LESSON_TRANSLATIONS = () =>
  Object.fromEntries(LANG_OPTIONS.map(({ code }) => [code, { title: '', subtitle: '', content: '', learning_objectives: '', examples: '', summary: '', recommended_readings: '', coach_tip: '' }]));

/** Badge showing language availability for a course or lesson.
 *  Trial courses/lessons show a locked "Trial" pill followed by all 4 green flags.
 *  Other items show a green flag per language with content, grey for missing. */
function LangBadges({ translations }) {
  const trans = translations ?? {};
  return (
    <div className="flex gap-1 flex-wrap mt-1">
      {LANG_OPTIONS.map(({ code, countryCode }) => {
        const entry = trans[code];
        const hasContent = entry && entry.title && entry.title.trim();
        return (
          <span
            key={code}
            className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${hasContent ? 'bg-green-500/20 text-green-400' : 'bg-muted text-slate-500'}`}
            title={hasContent ? `${code.toUpperCase()} available` : `${code.toUpperCase()} missing`}
          >
            <Flag countryCode={countryCode} /> {code.toUpperCase()}
          </span>
        );
      })}
    </div>
  );
}

/** Multi-language tabs form for a course */
function CourseForm({ initial, onSave, onCancel, saving }) {
  const [level, setLevel] = useState(initial?.level ?? 1);
  const [thumbnail, setThumbnail] = useState(initial?.thumbnail ?? '');
  const [durationHours, setDurationHours] = useState(initial?.duration_hours ?? 0);
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? false);
  const [colorFrom, setColorFrom] = useState(initial?.color_from ?? '#1e3a5f');
  const [colorTo, setColorTo] = useState(initial?.color_to ?? '#0f2027');
  const [translations, setTranslations] = useState(() => {
    const base = EMPTY_COURSE_TRANSLATIONS();
    if (initial?.translations) {
      // Merge existing translations — all 4 tabs always present
      for (const [lang, val] of Object.entries(initial.translations)) {
        base[lang] = {
          title: val.title ?? '',
          description: val.description ?? '',
          topics: Array.isArray(val.topics) ? val.topics.join(', ') : (val.topics ?? ''),
        };
      }
    } else if (initial) {
      // No translations yet — seed EN tab from top-level fields so existing content is preserved
      base['en'] = {
        title: initial.title ?? '',
        description: initial.description ?? '',
        topics: Array.isArray(initial.topics) ? initial.topics.join(', ') : (initial.topics ?? ''),
      };
    }
    return base;
  });
  const [activeLang, setActiveLang] = useState('en');

  const updateTrans = (lang, field, value) =>
    setTranslations(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));

  const handleSave = () => {
    // Build translations payload — only include languages with a non-empty title
    const payload = {};
    for (const [lang, val] of Object.entries(translations)) {
      if (val.title.trim()) {
        payload[lang] = {
          title: val.title.trim(),
          description: val.description.trim(),
          topics: val.topics.split(',').map(s => s.trim()).filter(Boolean),
        };
      }
    }
    if (!Object.keys(payload).length) {
      toast.error('At least one language must have a title.');
      return;
    }
    onSave({ level: Number(level), thumbnail, duration_hours: Number(durationHours), is_published: isPublished, color_from: colorFrom, color_to: colorTo, translations: payload });
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 space-y-4">
        {/* Non-language fields */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Level</label>
            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="w-full bg-muted border border-border rounded px-3 py-2 text-sm"
            >
              <option value={1}>1 – Foundations</option>
              <option value={2}>2 – Investor</option>
              <option value={3}>3 – Strategist</option>
              <option value={4}>4 – Advanced</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Duration (hours)</label>
            <Input type="number" min={0} value={durationHours} onChange={e => setDurationHours(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="rounded" />
              Published
            </label>
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Thumbnail URL</label>
          <Input placeholder="https://..." value={thumbnail} onChange={e => setThumbnail(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Card gradient — start color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorFrom}
                onChange={e => setColorFrom(e.target.value)}
                className="w-10 h-9 rounded cursor-pointer border border-border bg-muted p-0.5"
              />
              <Input
                value={colorFrom}
                onChange={e => setColorFrom(e.target.value)}
                placeholder="#1e3a5f"
                className="font-mono text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Card gradient — end color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorTo}
                onChange={e => setColorTo(e.target.value)}
                className="w-10 h-9 rounded cursor-pointer border border-border bg-muted p-0.5"
              />
              <Input
                value={colorTo}
                onChange={e => setColorTo(e.target.value)}
                placeholder="#0f2027"
                className="font-mono text-sm"
              />
            </div>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-slate-400 mb-1 block">Preview</label>
            <div
              className="h-10 rounded-lg border border-border"
              style={{ background: `linear-gradient(to bottom right, ${colorFrom}, ${colorTo})` }}
            />
          </div>
        </div>

        {/* Language tabs */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex border-b border-border bg-muted/50">
            {LANG_OPTIONS.map(({ code, countryCode, label }) => {
              const hasContent = translations[code]?.title?.trim();
              return (
                <button
                  key={code}
                  onClick={() => setActiveLang(code)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeLang === code
                      ? 'bg-primary/20 text-primary border-b-2 border-primary'
                      : 'text-slate-400 hover:text-foreground'
                  }`}
                >
                  <Flag countryCode={countryCode} />
                  <span>{label}</span>
                  {hasContent && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                </button>
              );
            })}
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Title</label>
              <Input
                value={translations[activeLang]?.title ?? ''}
                onChange={e => updateTrans(activeLang, 'title', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Description</label>
              <Textarea
                rows={3}
                value={translations[activeLang]?.description ?? ''}
                onChange={e => updateTrans(activeLang, 'description', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Topics — comma separated</label>
              <Input
                value={translations[activeLang]?.topics ?? ''}
                onChange={e => updateTrans(activeLang, 'topics', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Course
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Multi-language tabs form for a lesson */
function LessonForm({ courseId, initial, onSave, onCancel, saving }) {
  const [order, setOrder] = useState((initial?.order ?? 0) + 1);
  const [translations, setTranslations] = useState(() => {
    const base = EMPTY_LESSON_TRANSLATIONS();
    if (initial?.translations) {
      for (const [lang, val] of Object.entries(initial.translations)) {
        base[lang] = {
          title: val.title ?? '',
          subtitle: val.subtitle ?? '',
          content: val.content ?? '',
          learning_objectives: Array.isArray(val.learning_objectives)
            ? val.learning_objectives.join('\n')
            : (val.learning_objectives ?? ''),
          examples: Array.isArray(val.examples) ? val.examples.join('\n') : (val.examples ?? ''),
          summary: val.summary ?? '',
          recommended_readings: Array.isArray(val.recommended_readings)
            ? val.recommended_readings.join('\n')
            : (val.recommended_readings ?? ''),
          coach_tip: val.coach_tip ?? '',
        };
      }
    } else if (initial) {
      // No translations yet — seed EN tab from top-level fields so existing content is preserved
      base['en'] = {
        title: initial.title ?? '',
        subtitle: initial.subtitle ?? '',
        content: initial.content ?? '',
        learning_objectives: Array.isArray(initial.learning_objectives)
          ? initial.learning_objectives.join('\n')
          : (initial.learning_objectives ?? ''),
        examples: Array.isArray(initial.examples) ? initial.examples.join('\n') : (initial.examples ?? ''),
        summary: initial.summary ?? '',
        recommended_readings: Array.isArray(initial.recommended_readings)
          ? initial.recommended_readings.join('\n')
          : (initial.recommended_readings ?? ''),
        coach_tip: initial.coach_tip ?? '',
      };
    }
    return base;
  });

  // Checkpoints state — stored with per-language text dicts
  const [checkpoints, setCheckpoints] = useState(() => {
    return (initial?.checkpoints || []).map((cp, i) => ({
      _key: `cp-${Date.now()}-${i}`,
      type: cp.type || 'quiz',
      position: cp.position ?? i,
      question: typeof cp.question === 'object' && !Array.isArray(cp.question)
        ? cp.question
        : { en: typeof cp.question === 'string' ? cp.question : '' },
      options: typeof cp.options === 'object' && !Array.isArray(cp.options)
        ? Object.fromEntries(Object.entries(cp.options).map(([k, v]) => [k, Array.isArray(v) ? v.join('\n') : (v || '')]))
        : { en: Array.isArray(cp.options) ? cp.options.join('\n') : '' },
      answer: cp.answer ?? 0,
      explanation: typeof cp.explanation === 'object' && !Array.isArray(cp.explanation)
        ? cp.explanation
        : { en: typeof cp.explanation === 'string' ? cp.explanation : '' },
    }));
  });

  const [activeLang, setActiveLang] = useState('en');

  const updateTrans = (lang, field, value) =>
    setTranslations(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));

  const addCheckpoint = () => {
    setCheckpoints(prev => [...prev, {
      _key: `cp-${Date.now()}`,
      type: 'quiz',
      position: prev.length,
      question: Object.fromEntries(LANG_OPTIONS.map(({ code }) => [code, ''])),
      options: Object.fromEntries(LANG_OPTIONS.map(({ code }) => [code, ''])),
      answer: 0,
      explanation: Object.fromEntries(LANG_OPTIONS.map(({ code }) => [code, ''])),
    }]);
  };

  const removeCheckpoint = (key) =>
    setCheckpoints(prev => prev.filter(cp => cp._key !== key));

  const updateCheckpoint = (key, field, value) =>
    setCheckpoints(prev => prev.map(cp => cp._key === key ? { ...cp, [field]: value } : cp));

  const updateCheckpointLang = (key, field, lang, value) =>
    setCheckpoints(prev => prev.map(cp =>
      cp._key === key ? { ...cp, [field]: { ...cp[field], [lang]: value } } : cp
    ));

  const handleSave = () => {
    const payload = {};
    for (const [lang, val] of Object.entries(translations)) {
      if (val.title.trim()) {
        payload[lang] = {
          title: val.title.trim(),
          subtitle: val.subtitle.trim(),
          content: val.content.trim(),
          learning_objectives: val.learning_objectives.split('\n').map(s => s.trim()).filter(Boolean),
          examples: val.examples.split('\n').map(s => s.trim()).filter(Boolean),
          summary: val.summary.trim(),
          recommended_readings: val.recommended_readings.split('\n').map(s => s.trim()).filter(Boolean),
          coach_tip: val.coach_tip.trim() || null,
        };
      }
    }
    if (!Object.keys(payload).length) {
      toast.error('At least one language must have a title.');
      return;
    }
    const checkpointPayload = checkpoints
      .filter(cp => Object.values(cp.question).some(v => v.trim()))
      .map((cp, i) => ({
        id: cp._key,
        type: cp.type,
        position: i,
        question: Object.fromEntries(Object.entries(cp.question).filter(([, v]) => v.trim())),
        options: Object.fromEntries(
          Object.entries(cp.options).map(([k, v]) => [k, v.split('\n').map(s => s.trim()).filter(Boolean)])
        ),
        answer: Number(cp.answer),
        explanation: Object.fromEntries(Object.entries(cp.explanation).filter(([, v]) => v.trim())),
      }));
    onSave({ course_id: courseId, order: Number(order) - 1, translations: payload, checkpoints: checkpointPayload });
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Order (position in course)</label>
            <Input type="number" min={1} value={order} onChange={e => setOrder(e.target.value)} />
          </div>
        </div>

        {/* Language tabs */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex border-b border-border bg-muted/50">
            {LANG_OPTIONS.map(({ code, countryCode, label }) => {
              const hasContent = translations[code]?.title?.trim();
              return (
                <button
                  key={code}
                  onClick={() => setActiveLang(code)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeLang === code
                      ? 'bg-primary/20 text-primary border-b-2 border-primary'
                      : 'text-slate-400 hover:text-foreground'
                  }`}
                >
                  <Flag countryCode={countryCode} />
                  <span>{label}</span>
                  {hasContent && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                </button>
              );
            })}
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Title</label>
              <Input
                value={translations[activeLang]?.title ?? ''}
                onChange={e => updateTrans(activeLang, 'title', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Subtitle</label>
              <Input
                value={translations[activeLang]?.subtitle ?? ''}
                onChange={e => updateTrans(activeLang, 'subtitle', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Content — Markdown</label>
              <Textarea
                rows={8}
                value={translations[activeLang]?.content ?? ''}
                onChange={e => updateTrans(activeLang, 'content', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Learning objectives — one per line</label>
              <Textarea
                rows={3}
                value={translations[activeLang]?.learning_objectives ?? ''}
                onChange={e => updateTrans(activeLang, 'learning_objectives', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Examples — one per line</label>
              <Textarea
                rows={3}
                value={translations[activeLang]?.examples ?? ''}
                onChange={e => updateTrans(activeLang, 'examples', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Summary</label>
              <Textarea
                rows={2}
                value={translations[activeLang]?.summary ?? ''}
                onChange={e => updateTrans(activeLang, 'summary', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Recommended readings — one per line</label>
              <Textarea
                rows={2}
                value={translations[activeLang]?.recommended_readings ?? ''}
                onChange={e => updateTrans(activeLang, 'recommended_readings', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Coach's Tip <span className="text-slate-600">(optional)</span></label>
              <Textarea
                rows={3}
                value={translations[activeLang]?.coach_tip ?? ''}
                onChange={e => updateTrans(activeLang, 'coach_tip', e.target.value)}
                placeholder="Leave blank to hide the Coach's Tip section for this language"
              />
            </div>
          </div>
        </div>

        {/* Checkpoints — "Check Your Understanding" */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
            <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span>Check Your Understanding</span>
              <span className="text-xs font-normal text-slate-500">(optional checkpoints)</span>
            </span>
            <Button size="sm" variant="outline" onClick={addCheckpoint}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Question
            </Button>
          </div>
          {checkpoints.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No checkpoint questions — section will be hidden in the lesson.</p>
          ) : (
            <div className="p-4 space-y-5">
              {checkpoints.map((cp, idx) => (
                <div key={cp._key} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Question {idx + 1}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeCheckpoint(cp._key)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Question text ({activeLang.toUpperCase()})</label>
                    <Input
                      value={cp.question[activeLang] ?? ''}
                      onChange={e => updateCheckpointLang(cp._key, 'question', activeLang, e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Options — one per line ({activeLang.toUpperCase()})</label>
                    <Textarea
                      rows={4}
                      value={cp.options[activeLang] ?? ''}
                      onChange={e => updateCheckpointLang(cp._key, 'options', activeLang, e.target.value)}
                      placeholder={"Option A\nOption B\nOption C\nOption D"}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Correct answer</label>
                      <select
                        value={cp.answer}
                        onChange={e => updateCheckpoint(cp._key, 'answer', Number(e.target.value))}
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground"
                      >
                        {(cp.options[activeLang] || cp.options['en'] || '')
                          .split('\n').map(s => s.trim()).filter(Boolean)
                          .map((opt, i) => (
                            <option key={i} value={i}>{String.fromCharCode(65 + i)}: {opt.slice(0, 30)}</option>
                          ))
                        }
                        {!(cp.options[activeLang] || cp.options['en'] || '').trim() && (
                          [0,1,2,3].map(i => <option key={i} value={i}>{String.fromCharCode(65 + i)}</option>)
                        )}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Explanation ({activeLang.toUpperCase()})</label>
                    <Input
                      value={cp.explanation[activeLang] ?? ''}
                      onChange={e => updateCheckpointLang(cp._key, 'explanation', activeLang, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Lesson
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/** Multi-language quiz editor for a single lesson */
function QuizForm({ lessonId, lessonTitle, token, onClose }) {
  const [activeLang, setActiveLang] = useState('en');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/admin/lessons/${lessonId}/quiz`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuestions((res.data.questions || []).map((q, i) => ({
          _key: i,
          question_type: q.question_type || 'multiple_choice',
          correct_answer_index: q.correct_answer_index ?? 0,
          translations: Object.fromEntries(
            LANG_OPTIONS.map(({ code }) => [code, {
              question: q.translations?.[code]?.question || '',
              options: (q.translations?.[code]?.options || []).join('\n'),
              explanation: q.translations?.[code]?.explanation || '',
            }])
          )
        })));
      } catch {
        // No quiz yet — start empty
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [lessonId]);

  const emptyQuestion = () => ({
    _key: Date.now(),
    question_type: 'multiple_choice',
    correct_answer_index: 0,
    translations: Object.fromEntries(LANG_OPTIONS.map(({ code }) => [code, { question: '', options: '', explanation: '' }]))
  });

  const addQuestion = () => setQuestions(prev => [...prev, emptyQuestion()]);
  const removeQuestion = (key) => setQuestions(prev => prev.filter(q => q._key !== key));
  const updateQ = (key, field, value) =>
    setQuestions(prev => prev.map(q => q._key === key ? { ...q, [field]: value } : q));
  const updateTrans = (key, lang, field, value) =>
    setQuestions(prev => prev.map(q =>
      q._key === key
        ? { ...q, translations: { ...q.translations, [lang]: { ...q.translations[lang], [field]: value } } }
        : q
    ));

  const handleSave = async () => {
    if (questions.length === 0) { toast.error('Add at least one question'); return; }
    setSaving(true);
    try {
      const payload = {
        questions: questions.map(q => ({
          question_type: q.question_type,
          correct_answer_index: Number(q.correct_answer_index),
          translations: Object.fromEntries(
            LANG_OPTIONS
              .filter(({ code }) => q.translations[code]?.question?.trim())
              .map(({ code }) => [code, {
                question: q.translations[code].question.trim(),
                options: q.translations[code].options.split('\n').map(s => s.trim()).filter(Boolean),
                explanation: q.translations[code].explanation.trim(),
              }])
          )
        })).filter(q => Object.keys(q.translations).length > 0)
      };
      if (payload.questions.length === 0) { toast.error('Each question needs at least one language filled'); return; }
      await axios.put(`${API}/admin/lessons/${lessonId}/quiz`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Quiz saved');
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          Quiz — {lessonTitle}
        </CardTitle>
        <div className="flex gap-2 flex-wrap mt-2">
          {LANG_OPTIONS.map(({ code, countryCode, label }) => (
            <button
              key={code}
              onClick={() => setActiveLang(code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeLang === code
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'bg-muted text-slate-400 hover:text-foreground'
              }`}
            >
              <Flag countryCode={countryCode} /> {label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.length === 0 && (
          <p className="text-slate-400 text-center py-4 text-sm">No questions yet. Add your first one below.</p>
        )}
        {questions.map((q, idx) => {
          const enOptions = (q.translations['en']?.options || '').split('\n').filter(Boolean);
          return (
            <div key={q._key} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-slate-400 w-6">Q{idx + 1}</span>
                <select
                  value={q.question_type}
                  onChange={e => updateQ(q._key, 'question_type', e.target.value)}
                  className="bg-muted border border-border rounded px-2 py-1 text-sm"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True / False</option>
                </select>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Correct:</span>
                  <select
                    value={q.correct_answer_index}
                    onChange={e => updateQ(q._key, 'correct_answer_index', Number(e.target.value))}
                    className="bg-muted border border-border rounded px-2 py-1 text-sm"
                  >
                    {q.question_type === 'true_false' ? (
                      <>
                        <option value={0}>True</option>
                        <option value={1}>False</option>
                      </>
                    ) : enOptions.length > 0
                      ? enOptions.map((opt, i) => (
                          <option key={i} value={i}>{String.fromCharCode(65 + i)}: {opt.slice(0, 28)}</option>
                        ))
                      : [0, 1, 2, 3].map(i => (
                          <option key={i} value={i}>{String.fromCharCode(65 + i)}</option>
                        ))
                    }
                  </select>
                </div>
                <Button size="sm" variant="ghost" onClick={() => removeQuestion(q._key)} className="ml-auto">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Question text</label>
                <Input
                  value={q.translations[activeLang]?.question ?? ''}
                  onChange={e => updateTrans(q._key, activeLang, 'question', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  {q.question_type === 'true_false' ? 'Options — e.g. True / False' : 'Options — one per line'}
                </label>
                <Textarea
                  rows={4}
                  value={q.translations[activeLang]?.options ?? ''}
                  onChange={e => updateTrans(q._key, activeLang, 'options', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Explanation</label>
                <Input
                  value={q.translations[activeLang]?.explanation ?? ''}
                  onChange={e => updateTrans(q._key, activeLang, 'explanation', e.target.value)}
                />
              </div>
            </div>
          );
        })}
        <Button variant="outline" onClick={addQuestion} className="w-full">
          <Plus className="w-4 h-4 mr-2" /> Add Question
        </Button>
        <div className="flex gap-2 justify-end pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ExamForm({ courseId, courseTitle, token, onClose }) {
  const [activeLang, setActiveLang] = useState('en');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
  const [passingScore, setPassingScore] = useState(80);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/admin/courses/${courseId}/exam`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTimeLimitMinutes(res.data.time_limit_minutes ?? 30);
        setPassingScore(res.data.passing_score ?? 80);
        setQuestions((res.data.questions || []).map((q, i) => {
          // Support both new (translations) and legacy flat format
          if (q.translations) {
            return {
              _key: i,
              question_type: q.question_type || 'multiple_choice',
              correct_answer_index: q.correct_answer_index ?? 0,
              translations: Object.fromEntries(
                LANG_OPTIONS.map(({ code }) => [code, {
                  question: q.translations?.[code]?.question || '',
                  options: (q.translations?.[code]?.options || []).join('\n'),
                  explanation: q.translations?.[code]?.explanation || '',
                }])
              )
            };
          }
          // Legacy flat: map EN options to index
          const options = q.options || [];
          const correctIdx = Math.max(0, options.indexOf(q.correct_answer));
          return {
            _key: i,
            question_type: q.question_type || 'multiple_choice',
            correct_answer_index: correctIdx,
            translations: Object.fromEntries(
              LANG_OPTIONS.map(({ code }) => [code, {
                question: code === 'en' ? (q.question || '') : '',
                options: code === 'en' ? options.join('\n') : '',
                explanation: code === 'en' ? (q.explanation || '') : '',
              }])
            )
          };
        }));
      } catch {
        // No exam yet — start empty
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const emptyQuestion = () => ({
    _key: Date.now(),
    question_type: 'multiple_choice',
    correct_answer_index: 0,
    translations: Object.fromEntries(LANG_OPTIONS.map(({ code }) => [code, { question: '', options: '', explanation: '' }]))
  });

  const addQuestion = () => setQuestions(prev => [...prev, emptyQuestion()]);
  const removeQuestion = (key) => setQuestions(prev => prev.filter(q => q._key !== key));
  const updateQ = (key, field, value) =>
    setQuestions(prev => prev.map(q => q._key === key ? { ...q, [field]: value } : q));
  const updateTrans = (key, lang, field, value) =>
    setQuestions(prev => prev.map(q =>
      q._key === key
        ? { ...q, translations: { ...q.translations, [lang]: { ...q.translations[lang], [field]: value } } }
        : q
    ));

  const handleSave = async () => {
    if (questions.length === 0) { toast.error('Add at least one question'); return; }
    setSaving(true);
    try {
      const payload = {
        time_limit_minutes: Number(timeLimitMinutes),
        passing_score: Number(passingScore),
        questions: questions.map(q => ({
          question_type: q.question_type,
          correct_answer_index: Number(q.correct_answer_index),
          translations: Object.fromEntries(
            LANG_OPTIONS
              .filter(({ code }) => q.translations[code]?.question?.trim())
              .map(({ code }) => [code, {
                question: q.translations[code].question.trim(),
                options: q.translations[code].options.split('\n').map(s => s.trim()).filter(Boolean),
                explanation: q.translations[code].explanation.trim(),
              }])
          )
        })).filter(q => Object.keys(q.translations).length > 0)
      };
      if (payload.questions.length === 0) { toast.error('Each question needs at least one language filled'); return; }
      await axios.put(`${API}/admin/courses/${courseId}/exam`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Exam saved');
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to save exam');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Certification Exam — {courseTitle}
        </CardTitle>
        {/* Settings row */}
        <div className="flex flex-wrap gap-4 mt-2">
          <label className="flex items-center gap-2 text-sm text-slate-400">
            Time limit (min)
            <input
              type="number"
              min={5}
              max={180}
              value={timeLimitMinutes}
              onChange={e => setTimeLimitMinutes(e.target.value)}
              className="w-20 bg-muted border border-border rounded px-2 py-1 text-sm text-foreground"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-400">
            Passing score (%)
            <input
              type="number"
              min={1}
              max={100}
              value={passingScore}
              onChange={e => setPassingScore(e.target.value)}
              className="w-20 bg-muted border border-border rounded px-2 py-1 text-sm text-foreground"
            />
          </label>
        </div>
        {/* Language tabs */}
        <div className="flex gap-2 flex-wrap mt-2">
          {LANG_OPTIONS.map(({ code, countryCode, label }) => (
            <button
              key={code}
              onClick={() => setActiveLang(code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeLang === code
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'bg-muted text-slate-400 hover:text-foreground'
              }`}
            >
              <Flag countryCode={countryCode} /> {label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.length === 0 && (
          <p className="text-slate-400 text-center py-4 text-sm">No questions yet. Add your first one below.</p>
        )}
        {questions.map((q, idx) => {
          const enOptions = (q.translations['en']?.options || '').split('\n').filter(Boolean);
          return (
            <div key={q._key} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-slate-400 w-6">Q{idx + 1}</span>
                <select
                  value={q.question_type}
                  onChange={e => updateQ(q._key, 'question_type', e.target.value)}
                  className="bg-muted border border-border rounded px-2 py-1 text-sm"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True / False</option>
                </select>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400">Correct:</span>
                  <select
                    value={q.correct_answer_index}
                    onChange={e => updateQ(q._key, 'correct_answer_index', Number(e.target.value))}
                    className="bg-muted border border-border rounded px-2 py-1 text-sm"
                  >
                    {q.question_type === 'true_false' ? (
                      <>
                        <option value={0}>True</option>
                        <option value={1}>False</option>
                      </>
                    ) : enOptions.length > 0
                      ? enOptions.map((opt, i) => (
                          <option key={i} value={i}>{String.fromCharCode(65 + i)}: {opt.slice(0, 28)}</option>
                        ))
                      : [0, 1, 2, 3].map(i => (
                          <option key={i} value={i}>{String.fromCharCode(65 + i)}</option>
                        ))
                    }
                  </select>
                </div>
                <Button size="sm" variant="ghost" onClick={() => removeQuestion(q._key)} className="ml-auto">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Question text</label>
                <Input
                  value={q.translations[activeLang]?.question ?? ''}
                  onChange={e => updateTrans(q._key, activeLang, 'question', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  {q.question_type === 'true_false' ? 'Options — e.g. True / False' : 'Options — one per line'}
                </label>
                <Textarea
                  rows={4}
                  value={q.translations[activeLang]?.options ?? ''}
                  onChange={e => updateTrans(q._key, activeLang, 'options', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Explanation</label>
                <Input
                  value={q.translations[activeLang]?.explanation ?? ''}
                  onChange={e => updateTrans(q._key, activeLang, 'explanation', e.target.value)}
                />
              </div>
            </div>
          );
        })}
        <Button variant="outline" onClick={addQuestion} className="w-full">
          <Plus className="w-4 h-4 mr-2" /> Add Question
        </Button>
        <div className="flex gap-2 justify-end pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Exam
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Courses Tab Component
function CoursesTab({ token, currentUser }) {
  const canDelete = ['admin', 'moderator'].includes(currentUser?.role);
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form visibility state
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [selectedLessonForQuiz, setSelectedLessonForQuiz] = useState(null);
  const [showExamForm, setShowExamForm] = useState(false);
  const [selectedCourseForExam, setSelectedCourseForExam] = useState(null);

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API}/admin/courses`, { headers: authHeaders });
      setCourses(response.data.courses);
    } catch (error) {
      toast.error(t('admin.errors.loadingCourses'));
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (courseId) => {
    try {
      const response = await axios.get(`${API}/admin/lessons?course_id=${courseId}`, { headers: authHeaders });
      setLessons(response.data.lessons);
      setSelectedCourse(courseId);
    } catch (error) {
      toast.error(t('admin.errors.loadingLessons'));
    }
  };

  const saveCourse = async (payload) => {
    setSaving(true);
    try {
      if (editingCourse) {
        await axios.put(`${API}/admin/courses/${editingCourse.id}`, payload, { headers: authHeaders });
        toast.success('Course updated');
      } else {
        await axios.post(`${API}/admin/courses`, payload, { headers: authHeaders });
        toast.success('Course created');
      }
      setShowCourseForm(false);
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('admin.errors.creationError'));
    } finally {
      setSaving(false);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!confirm('Delete this course and all its lessons?')) return;
    try {
      await axios.delete(`${API}/admin/courses/${courseId}`, { headers: authHeaders });
      toast.success('Course deleted');
      if (selectedCourse === courseId) {
        setSelectedCourse(null);
        setLessons([]);
      }
      fetchCourses();
    } catch (error) {
      toast.error(t('admin.errors.deletionError'));
    }
  };

  const saveLesson = async (payload) => {
    setSaving(true);
    try {
      if (editingLesson) {
        await axios.put(`${API}/admin/lessons/${editingLesson.id}`, payload, { headers: authHeaders });
        toast.success('Lesson updated');
      } else {
        await axios.post(`${API}/admin/lessons`, payload, { headers: authHeaders });
        toast.success('Lesson created');
      }
      setShowLessonForm(false);
      setEditingLesson(null);
      fetchLessons(selectedCourse);
    } catch (error) {
      toast.error(error.response?.data?.detail || t('admin.errors.creationError'));
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await axios.delete(`${API}/admin/lessons/${lessonId}`, { headers: authHeaders });
      toast.success('Lesson deleted');
      fetchLessons(selectedCourse);
    } catch (error) {
      toast.error(t('admin.errors.deletionError'));
    }
  };

  /** Derive a display title — checks translations first (prefer EN), falls back to top-level title field */
  const getDisplayTitle = (item) => {
    const t = item?.translations;
    if (t) return t.en?.title || t.fr?.title || t.ar?.title || t.pt?.title || '(untitled)';
    return item?.title || '(untitled)';
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Course Form */}
      {showCourseForm && (
        <div className="space-y-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {editingCourse ? 'Edit Course' : 'New Course'}
          </h3>
          <CourseForm
            initial={editingCourse}
            onSave={saveCourse}
            onCancel={() => { setShowCourseForm(false); setEditingCourse(null); }}
            saving={saving}
          />
        </div>
      )}

      {/* Lesson Form */}
      {showLessonForm && (
        <div className="space-y-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {editingLesson ? 'Edit Lesson' : 'New Lesson'}
          </h3>
          <LessonForm
            courseId={selectedCourse}
            initial={editingLesson}
            onSave={saveLesson}
            onCancel={() => { setShowLessonForm(false); setEditingLesson(null); }}
            saving={saving}
          />
        </div>
      )}

      {/* Quiz Form */}
      {showQuizForm && selectedLessonForQuiz && (
        <div className="space-y-2">
          <QuizForm
            lessonId={selectedLessonForQuiz.id}
            lessonTitle={getDisplayTitle(selectedLessonForQuiz)}
            token={token}
            onClose={() => { setShowQuizForm(false); setSelectedLessonForQuiz(null); }}
          />
        </div>
      )}

      {/* Exam Form */}
      {showExamForm && selectedCourseForExam && (
        <div className="space-y-2">
          <ExamForm
            courseId={selectedCourseForExam.id}
            courseTitle={getDisplayTitle(selectedCourseForExam)}
            token={token}
            onClose={() => { setShowExamForm(false); setSelectedCourseForExam(null); }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              {t('admin.courses.title')}
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setShowCourseForm(true); setEditingCourse(null); setShowLessonForm(false); }}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {courses.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">No courses yet.</p>
            )}
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => { fetchLessons(course.id); setShowCourseForm(false); setShowLessonForm(false); setShowQuizForm(false); setSelectedLessonForQuiz(null); setShowExamForm(false); setSelectedCourseForExam(null); }}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCourse === course.id
                    ? 'bg-primary/20 border border-primary'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{getDisplayTitle(course)}</p>
                    <p className="text-xs text-slate-400">
                      Level {course.level} · {course.lessons_count} lessons
                    </p>
                    <LangBadges translations={course.translations} />
                  </div>
                  <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedCourseForExam(course);
                              setShowExamForm(true);
                              setShowCourseForm(false);
                              setShowLessonForm(false);
                              setShowQuizForm(false);
                            }}
                          >
                            <Award className="w-3.5 h-3.5 text-amber-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Manage certification exam</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setEditingCourse(course); setShowCourseForm(true); setShowLessonForm(false); setShowExamForm(false); }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit course</TooltipContent>
                      </Tooltip>
                      {canDelete && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteCourse(course.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete course</TooltipContent>
                        </Tooltip>
                      )}
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Lessons List */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              {t('admin.courses.lessonsTitle')} {selectedCourse && `(${lessons.length})`}
              {selectedCourse && !showLessonForm && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setShowLessonForm(true); setEditingLesson(null); setShowCourseForm(false); }}
                >
                  <Plus className="w-4 h-4 mr-1" /> {t('admin.courses.addLesson')}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCourse ? (
              <p className="text-slate-400 text-center py-8">{t('admin.courses.selectCourse')}</p>
            ) : lessons.length === 0 ? (
              <p className="text-slate-400 text-center py-8">{t('admin.courses.noLessons')}</p>
            ) : (
              <div className="space-y-3">
                {[...lessons].sort((a, b) => a.order - b.order).map((lesson) => (
                  <div key={lesson.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {lesson.order + 1}. {getDisplayTitle(lesson)}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                          <span className="text-xs text-slate-400">
                            {lesson.duration_minutes} min
                          </span>
                          <span className="text-xs text-slate-400">
                            {lesson.audio_full ? `🔊 ${t('admin.media.audio')}` : `⚪ ${t('admin.courses.noAudio')}`}
                          </span>
                          <span className="text-xs text-slate-400">
                            {lesson.hero_image ? `🖼️ Image` : `⚪ ${t('admin.courses.noImage')}`}
                          </span>
                          <LangBadges translations={lesson.translations} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 mt-1 sm:mt-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedLessonForQuiz(lesson);
                                  setShowQuizForm(true);
                                  setShowLessonForm(false);
                                  setShowCourseForm(false);
                                }}
                              >
                                <HelpCircle className="w-4 h-4 text-primary" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Manage quiz</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setEditingLesson(lesson); setShowLessonForm(true); setShowCourseForm(false); setShowQuizForm(false); }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit lesson</TooltipContent>
                          </Tooltip>
                          {canDelete && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="ghost" onClick={() => deleteLesson(lesson.id)}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete lesson</TooltipContent>
                            </Tooltip>
                          )}
                        </TooltipProvider>
                      </div>
                    </div>

                    {/* Media preview */}
                    {(lesson.audio_full || lesson.hero_image) && (
                      <div className="mt-3 flex gap-4">
                        {lesson.hero_image && (
                          <img
                            src={lesson.hero_image}
                            alt="hero"
                            className="w-24 h-16 object-cover rounded"
                          />
                        )}
                        {lesson.audio_full && (
                          <audio controls className="h-8">
                            <source src={`${API.replace('/api', '')}${lesson.audio_full}`} type="audio/mpeg" />
                          </audio>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Users Tab Component
function UsersTab({ token, currentUser }) {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const canEditRoles = currentUser?.role === 'admin';
  const canEditSubscriptions = ['admin', 'moderator'].includes(currentUser?.role);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${API}/admin/users?search=${search}&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(response.data.users);
      setTotal(response.data.total);
    } catch (error) {
      toast.error(t('admin.errors.loadingUsers'));
    } finally {
      setLoading(false);
    }
  };

  const updateUserTier = async (userId, tier) => {
    try {
      await axios.put(
        `${API}/admin/users/${userId}?subscription_tier=${tier}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t('admin.users.subscriptionUpdated'));
      fetchUsers();
    } catch (error) {
      toast.error(t('admin.errors.updateError'));
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      await axios.put(
        `${API}/admin/users/${userId}?role=${role}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Role updated');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('admin.errors.updateError'));
    }
  };

  const tierStyle = {
    free:  { badge: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',    select: 'border-slate-500/40 text-slate-300' },
    pro:   { badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30', select: 'border-purple-500/40 text-purple-300' },
    elite: { badge: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', select: 'border-yellow-500/40 text-yellow-300' },
  };

  const roleStyle = {
    admin:     { badge: 'bg-red-500/20 text-red-400 border border-red-500/30',       select: 'border-red-500/40 text-red-400' },
    moderator: { badge: 'bg-purple-500/20 text-purple-400 border border-purple-500/30', select: 'border-purple-500/40 text-purple-400' },
    editor:    { badge: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',    select: 'border-blue-500/40 text-blue-400' },
    none:      { badge: 'bg-slate-500/20 text-slate-400 border border-slate-500/30', select: 'border-slate-500/40 text-slate-400' },
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('admin.users.title', { total })}</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t('admin.users.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">{t('admin.users.tableHeaders.email')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">{t('admin.users.tableHeaders.name')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">{t('admin.users.tableHeaders.subscription')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">{t('admin.users.tableHeaders.xp')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">{t('admin.users.tableHeaders.registration')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const userRole = u.role || 'none';
                  const userTier = u.subscription_tier || 'free';
                  const rs = roleStyle[userRole] || roleStyle.none;
                  const ts = tierStyle[userTier] || tierStyle.free;
                  return (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-4 text-sm">{u.email}</td>
                      <td className="py-3 px-4 text-sm">{u.full_name}</td>
                      <td className="py-3 px-4">
                        {canEditRoles ? (
                          <select
                            className={`bg-background border rounded px-2 py-1 text-xs font-medium ${rs.select}`}
                            value={userRole}
                            onChange={(e) => updateUserRole(u.id, e.target.value)}
                          >
                            <option value="none">none</option>
                            <option value="editor">editor</option>
                            <option value="moderator">moderator</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${rs.badge}`}>
                            {userRole}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {canEditSubscriptions ? (
                          <select
                            className={`bg-background border rounded px-2 py-1 text-xs font-medium ${ts.select}`}
                            value={userTier}
                            onChange={(e) => updateUserTier(u.id, e.target.value)}
                          >
                            <option value="free">standard</option>
                            <option value="pro">pro</option>
                            <option value="elite">elite</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${ts.badge}`}>
                            {userTier === 'free' ? 'standard' : userTier}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">{u.xp_points || 0}</td>
                      <td className="py-3 px-4 text-sm text-slate-400">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Blog Tab Component
function BlogTab({ token, currentUser }) {
  const canDelete = ['admin', 'moderator'].includes(currentUser?.role);
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Education',
    tags: [],
    thumbnail: '',
    read_time: 5
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/admin/blog`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(response.data.posts);
    } catch (error) {
      toast.error(t('admin.errors.loadingArticles'));
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file) => new Promise((resolve, reject) => {
    const MAX_PX = 1200;
    const QUALITY = 0.82;
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Compression failed')), 'image/jpeg', QUALITY);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('file', new File([compressed], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
      const res = await axios.post(`${API}/admin/upload-image`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const absoluteUrl = API.replace('/api', '') + res.data.url;
      setFormData(prev => ({ ...prev, thumbnail: absoluteUrl }));
      toast.success(t('admin.blog.imageUploaded'));
    } catch (err) {
      const serverMsg = err?.response?.data?.detail;
      toast.error(serverMsg || t('admin.blog.imageUploadError'));
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const createPost = async () => {
    try {
      await axios.post(`${API}/admin/blog`, null, {
        params: formData,
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('admin.blog.created'));
      setShowForm(false);
      setFormData({ title: '', slug: '', excerpt: '', content: '', category: 'Education', tags: [], thumbnail: '', read_time: 5 });
      fetchPosts();
    } catch (error) {
      toast.error(t('admin.errors.creationError'));
    }
  };

  const deletePost = async (postId) => {
    if (!confirm(t('admin.blog.deleteConfirm'))) return;
    try {
      await axios.delete(`${API}/admin/blog/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('admin.blog.deleted'));
      fetchPosts();
    } catch (error) {
      toast.error(t('admin.errors.deletionError'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t('admin.blog.title', { count: posts.length })}</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('admin.blog.newPost')}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-4">
            <Input
              placeholder={t('admin.blog.form.title')}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
            />
            <Input
              placeholder={t('admin.blog.form.slug')}
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
            />
            <Input
              placeholder={t('admin.blog.form.excerpt')}
              value={formData.excerpt}
              onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
            />
            <Textarea
              placeholder={t('admin.blog.form.content')}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={10}
            />
            <Input
              placeholder={t('admin.blog.form.category')}
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            />
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                placeholder={t('admin.blog.form.readTime')}
                value={formData.read_time}
                onChange={(e) => setFormData({...formData, read_time: parseInt(e.target.value) || 5})}
                className="w-32"
              />
              <span className="text-sm text-slate-400">{t('admin.blog.form.minutes')}</span>
            </div>

            {/* Thumbnail upload */}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleImageUpload}
              />
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('admin.blog.form.uploading')}</>
                    : <><Image className="w-4 h-4 mr-2" />{t('admin.blog.form.uploadImage')}</>
                  }
                </Button>
                {formData.thumbnail && (
                  <span className="text-xs text-green-400 truncate max-w-xs">{formData.thumbnail}</span>
                )}
              </div>
              {formData.thumbnail && (
                <img
                  src={formData.thumbnail.startsWith('/api') ? `${API.replace('/api', '')}${formData.thumbnail}` : formData.thumbnail}
                  alt="thumbnail preview"
                  className="h-24 w-auto rounded-lg object-cover border border-border"
                />
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={createPost}>{t('admin.blog.publish')}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>{t('admin.blog.cancel')}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="bg-card border-border overflow-hidden">
            {post.thumbnail && (
              <img
                src={post.thumbnail}
                alt={post.title}
                className="w-full h-32 object-cover"
              />
            )}
            <CardContent className="p-4">
              <h3 className="font-medium mb-2 line-clamp-2">{post.title}</h3>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary">{post.category}</span>
                <div className="flex gap-2">
                  {canDelete && (
                    <Button size="sm" variant="ghost" onClick={() => deletePost(post.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ==================== PROMOTIONS TAB ====================

function PromotionsTab({ token }) {
  const { t } = useTranslation();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', discount_pct: 20, ends_at: '' });
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', discount_pct: 15, expires_at: '' });

  const fetchPromotions = async () => {
    try {
      const res = await axios.get(`${API}/admin/promotions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromotions(res.data);
    } catch {
      toast.error(t('admin.promotions.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await axios.get(`${API}/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(res.data);
    } catch {
      toast.error(t('admin.coupons.loadError'));
    } finally {
      setCouponsLoading(false);
    }
  };

  useEffect(() => { fetchPromotions(); fetchCoupons(); }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.expires_at) return toast.error(t('admin.coupons.fillAll'));
    setCouponSaving(true);
    try {
      const expiresAtIso = new Date(couponForm.expires_at).toISOString();
      await axios.post(
        `${API}/admin/coupons`,
        { code: couponForm.code, discount_pct: Number(couponForm.discount_pct), expires_at: expiresAtIso },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t('admin.coupons.created'));
      setCouponForm({ code: '', discount_pct: 15, expires_at: '' });
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.detail || t('admin.coupons.createError'));
    } finally {
      setCouponSaving(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await axios.delete(`${API}/admin/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('admin.coupons.deleted'));
      fetchCoupons();
    } catch {
      toast.error(t('admin.coupons.deleteError'));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.ends_at) return toast.error(t('admin.promotions.fillAll'));
    setSaving(true);
    try {
      const endsAtIso = new Date(form.ends_at).toISOString();
      await axios.post(
        `${API}/admin/promotions`,
        { name: form.name, discount_pct: Number(form.discount_pct), ends_at: endsAtIso },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t('admin.promotions.created'));
      setForm({ name: '', discount_pct: 20, ends_at: '' });
      fetchPromotions();
    } catch (err) {
      toast.error(err.response?.data?.detail || t('admin.promotions.createError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await axios.delete(`${API}/admin/promotions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('admin.promotions.deactivated'));
      fetchPromotions();
    } catch {
      toast.error(t('admin.promotions.deactivateError'));
    }
  };

  const activePromo = promotions.find(p => p.is_active && new Date(p.ends_at) > new Date());

  return (
    <div className="space-y-6">
      {/* Active promotion banner */}
      {activePromo && (
        <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
          <Tag className="w-5 h-5 text-orange-400 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-orange-300">{activePromo.name}</p>
            <p className="text-sm text-muted-foreground">
              -{activePromo.discount_pct}% &mdash; {t('admin.promotions.endsAt')}{' '}
              {new Date(activePromo.ends_at).toLocaleString()}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/40 text-red-400 hover:bg-red-500/10"
            onClick={() => handleDeactivate(activePromo.id)}
          >
            <XCircle className="w-4 h-4 mr-1" />
            {t('admin.promotions.end')}
          </Button>
        </div>
      )}

      {/* Create form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-primary" />
            {t('admin.promotions.create')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                {t('admin.promotions.name')}
              </label>
              <Input
                placeholder={t('admin.promotions.namePlaceholder')}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                {t('admin.promotions.discount')}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={form.discount_pct}
                  onChange={e => setForm(f => ({ ...f, discount_pct: e.target.value }))}
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                {t('admin.promotions.endDate')}
              </label>
              <Input
                type="datetime-local"
                value={form.ends_at}
                onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))}
                required
              />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Tag className="w-4 h-4 mr-2" />}
                {t('admin.promotions.launch')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {t('admin.promotions.history')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : promotions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('admin.promotions.none')}</p>
          ) : (
            <div className="space-y-2">
              {promotions.map(promo => {
                const expired = new Date(promo.ends_at) <= new Date();
                const statusLabel = !promo.is_active
                  ? t('admin.promotions.statusEnded')
                  : expired
                    ? t('admin.promotions.statusExpired')
                    : t('admin.promotions.statusActive');
                const statusColor = !promo.is_active || expired
                  ? 'text-muted-foreground'
                  : 'text-green-400';
                return (
                  <div key={promo.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{promo.name}</p>
                      <p className="text-sm text-muted-foreground">
                        -{promo.discount_pct}% &mdash; {t('admin.promotions.endsAt')}{' '}
                        {new Date(promo.ends_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${statusColor}`}>{statusLabel}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Coupon Codes ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            {t('admin.coupons.create')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                {t('admin.coupons.code')}
              </label>
              <Input
                placeholder={t('admin.coupons.codePlaceholder')}
                value={couponForm.code}
                onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="uppercase font-mono"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                {t('admin.coupons.discount')}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={couponForm.discount_pct}
                  onChange={e => setCouponForm(f => ({ ...f, discount_pct: e.target.value }))}
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                {t('admin.coupons.expiry')}
              </label>
              <Input
                type="datetime-local"
                value={couponForm.expires_at}
                onChange={e => setCouponForm(f => ({ ...f, expires_at: e.target.value }))}
                required
              />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" disabled={couponSaving} className="w-full sm:w-auto">
                {couponSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {t('admin.coupons.add')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {t('admin.coupons.list')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {couponsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : coupons.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('admin.coupons.none')}</p>
          ) : (
            <div className="space-y-2">
              {coupons.map(coupon => {
                const expired = new Date(coupon.expires_at) <= new Date();
                return (
                  <div key={coupon.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <span className="font-mono font-bold mr-3">{coupon.code}</span>
                      <span className="text-sm text-muted-foreground">
                        -{coupon.discount_pct}% &mdash; {t('admin.coupons.expires')}{' '}
                        {new Date(coupon.expires_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${expired ? 'text-muted-foreground' : 'text-green-400'}`}>
                        {expired ? t('admin.coupons.statusExpired') : t('admin.coupons.statusActive')}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
