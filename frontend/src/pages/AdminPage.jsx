import React, { useState, useEffect, useRef } from 'react';
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
import {
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Volume2,
  Image,
  Loader2,
  Search,
  Crown,
  Shield,
  Settings,
  RefreshCw,
  TrendingUp,
  Mail,
  Globe,
  HelpCircle
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
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                {t('admin.tabs.media')}
              </TabsTrigger>
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
            
            <TabsContent value="media">
              <MediaTab token={token} />
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
const LANG_OPTIONS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
];

const EMPTY_COURSE_TRANSLATIONS = () =>
  Object.fromEntries(LANG_OPTIONS.map(({ code }) => [code, { title: '', description: '', topics: '' }]));

const EMPTY_LESSON_TRANSLATIONS = () =>
  Object.fromEntries(LANG_OPTIONS.map(({ code }) => [code, { title: '', subtitle: '', content: '', learning_objectives: '', examples: '', summary: '', recommended_readings: '' }]));

/** Badge showing language availability for a course or lesson.
 *  Trial courses/lessons show a locked "Trial" pill followed by all 4 green flags.
 *  Other items show a green flag per language with content, grey for missing. */
function LangBadges({ translations, isTrial }) {
  if (isTrial) {
    return (
      <div className="flex gap-1 flex-wrap mt-1 items-center">
        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium">
          🔒 Trial
        </span>
        {LANG_OPTIONS.map(({ code, flag }) => (
          <span key={code} className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400" title={`${code.toUpperCase()} available`}>
            {flag} {code.toUpperCase()}
          </span>
        ))}
      </div>
    );
  }
  const trans = translations ?? {};
  return (
    <div className="flex gap-1 flex-wrap mt-1">
      {LANG_OPTIONS.map(({ code, flag }) => {
        const entry = trans[code];
        const hasContent = entry && entry.title && entry.title.trim();
        return (
          <span
            key={code}
            className={`text-xs px-1.5 py-0.5 rounded ${hasContent ? 'bg-green-500/20 text-green-400' : 'bg-muted text-slate-500'}`}
            title={hasContent ? `${code.toUpperCase()} available` : `${code.toUpperCase()} missing`}
          >
            {flag} {code.toUpperCase()}
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
            {LANG_OPTIONS.map(({ code, flag, label }) => {
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
                  <span>{flag}</span>
                  <span>{label}</span>
                  {hasContent && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                </button>
              );
            })}
          </div>
          <div className="p-4 space-y-3">
            <Input
              placeholder={`Title (${activeLang})`}
              value={translations[activeLang]?.title ?? ''}
              onChange={e => updateTrans(activeLang, 'title', e.target.value)}
            />
            <Textarea
              placeholder={`Description (${activeLang})`}
              rows={3}
              value={translations[activeLang]?.description ?? ''}
              onChange={e => updateTrans(activeLang, 'description', e.target.value)}
            />
            <Input
              placeholder={`Topics — comma separated (${activeLang})`}
              value={translations[activeLang]?.topics ?? ''}
              onChange={e => updateTrans(activeLang, 'topics', e.target.value)}
            />
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
  const [order, setOrder] = useState(initial?.order ?? 0);
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
      };
    }
    return base;
  });
  const [activeLang, setActiveLang] = useState('en');

  const updateTrans = (lang, field, value) =>
    setTranslations(prev => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));

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
        };
      }
    }
    if (!Object.keys(payload).length) {
      toast.error('At least one language must have a title.');
      return;
    }
    onSave({ course_id: courseId, order: Number(order), translations: payload });
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Order (position in course)</label>
            <Input type="number" min={0} value={order} onChange={e => setOrder(e.target.value)} />
          </div>
        </div>

        {/* Language tabs */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="flex border-b border-border bg-muted/50">
            {LANG_OPTIONS.map(({ code, flag, label }) => {
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
                  <span>{flag}</span>
                  <span>{label}</span>
                  {hasContent && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                </button>
              );
            })}
          </div>
          <div className="p-4 space-y-3">
            <Input
              placeholder={`Title (${activeLang})`}
              value={translations[activeLang]?.title ?? ''}
              onChange={e => updateTrans(activeLang, 'title', e.target.value)}
            />
            <Input
              placeholder={`Subtitle (${activeLang})`}
              value={translations[activeLang]?.subtitle ?? ''}
              onChange={e => updateTrans(activeLang, 'subtitle', e.target.value)}
            />
            <Textarea
              placeholder={`Content — Markdown (${activeLang})`}
              rows={8}
              value={translations[activeLang]?.content ?? ''}
              onChange={e => updateTrans(activeLang, 'content', e.target.value)}
            />
            <Textarea
              placeholder={`Learning objectives — one per line (${activeLang})`}
              rows={3}
              value={translations[activeLang]?.learning_objectives ?? ''}
              onChange={e => updateTrans(activeLang, 'learning_objectives', e.target.value)}
            />
            <Textarea
              placeholder={`Examples — one per line (${activeLang})`}
              rows={3}
              value={translations[activeLang]?.examples ?? ''}
              onChange={e => updateTrans(activeLang, 'examples', e.target.value)}
            />
            <Textarea
              placeholder={`Summary (${activeLang})`}
              rows={2}
              value={translations[activeLang]?.summary ?? ''}
              onChange={e => updateTrans(activeLang, 'summary', e.target.value)}
            />
            <Textarea
              placeholder={`Recommended readings — one per line (${activeLang})`}
              rows={2}
              value={translations[activeLang]?.recommended_readings ?? ''}
              onChange={e => updateTrans(activeLang, 'recommended_readings', e.target.value)}
            />
          </div>
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
          {LANG_OPTIONS.map(({ code, flag, label }) => (
            <button
              key={code}
              onClick={() => setActiveLang(code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeLang === code
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'bg-muted text-slate-400 hover:text-foreground'
              }`}
            >
              {flag} {label}
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
              <Input
                placeholder={`Question text (${activeLang})`}
                value={q.translations[activeLang]?.question ?? ''}
                onChange={e => updateTrans(q._key, activeLang, 'question', e.target.value)}
              />
              <Textarea
                placeholder={q.question_type === 'true_false'
                  ? `Options (${activeLang}) — e.g. True\nFalse`
                  : `Options (${activeLang}) — one per line`}
                rows={4}
                value={q.translations[activeLang]?.options ?? ''}
                onChange={e => updateTrans(q._key, activeLang, 'options', e.target.value)}
              />
              <Input
                placeholder={`Explanation (${activeLang})`}
                value={q.translations[activeLang]?.explanation ?? ''}
                onChange={e => updateTrans(q._key, activeLang, 'explanation', e.target.value)}
              />
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

  const generateAudio = async (lessonId) => {
    try {
      toast.info(t('admin.media.audioStarted'));
      const response = await axios.post(`${API}/admin/generate-audio/${lessonId}`, {}, { headers: authHeaders });
      if (response.data.status === 'success') {
        toast.success(t('admin.media.audioSuccess'));
        fetchLessons(selectedCourse);
      } else {
        toast.error('Error: ' + response.data.error);
      }
    } catch (error) {
      toast.error(t('admin.errors.audioGeneration'));
    }
  };

  const generateImage = async (lessonId) => {
    try {
      toast.info(t('admin.media.imageStarted'));
      const response = await axios.post(`${API}/admin/generate-image/${lessonId}`, {}, { headers: authHeaders });
      if (response.data.status === 'success') {
        toast.success(t('admin.media.imageSuccess'));
        fetchLessons(selectedCourse);
      } else {
        toast.error('Error: ' + response.data.error);
      }
    } catch (error) {
      toast.error(t('admin.errors.imageGeneration'));
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
                onClick={() => { fetchLessons(course.id); setShowCourseForm(false); setShowLessonForm(false); setShowQuizForm(false); setSelectedLessonForQuiz(null); }}
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
                    <LangBadges translations={course.translations} isTrial={course.is_trial} />
                  </div>
                  {!course.is_trial && (
                    <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditingCourse(course); setShowCourseForm(true); setShowLessonForm(false); }}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      {canDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteCourse(course.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </Button>
                      )}
                    </div>
                  )}
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
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {lesson.order + 1}. {getDisplayTitle(lesson)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {lesson.duration_minutes} min
                          {lesson.audio_full ? ` · 🔊 ${t('admin.media.audio')}` : ` · ⚪ ${t('admin.courses.noAudio')}`}
                          {lesson.hero_image ? ` · 🖼️ Image` : ` · ⚪ ${t('admin.courses.noImage')}`}
                        </p>
                        <LangBadges translations={lesson.translations} isTrial={courses.find(c => c.id === selectedCourse)?.is_trial} />
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="sm" variant="ghost" onClick={() => generateAudio(lesson.id)} title="Generate audio">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => generateImage(lesson.id)} title="Generate image">
                          <Image className="w-4 h-4" />
                        </Button>
                        {!courses.find(c => c.id === selectedCourse)?.is_trial && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Manage quiz"
                              onClick={() => {
                                setSelectedLessonForQuiz(lesson);
                                setShowQuizForm(true);
                                setShowLessonForm(false);
                                setShowCourseForm(false);
                              }}
                            >
                              <HelpCircle className="w-4 h-4 text-primary" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setEditingLesson(lesson); setShowLessonForm(true); setShowCourseForm(false); setShowQuizForm(false); }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {canDelete && (
                              <Button size="sm" variant="ghost" onClick={() => deleteLesson(lesson.id)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            )}
                          </>
                        )}
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post(`${API}/admin/upload-image`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      const absoluteUrl = API.replace('/api', '') + res.data.url;
      setFormData(prev => ({ ...prev, thumbnail: absoluteUrl }));
      toast.success(t('admin.blog.imageUploaded'));
    } catch (err) {
      toast.error(t('admin.blog.imageUploadError'));
    } finally {
      setUploadingImage(false);
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

// Media Management Tab - Audio Generation + Video Upload
function MediaTab({ token }) {
  const { t } = useTranslation();
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [mediaStatus, setMediaStatus] = useState(null);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [pollingInterval, setPollingInterval] = useState(null);
  const [showVideoSection, setShowVideoSection] = useState(true);
  const [uploadingVideo, setUploadingVideo] = useState(null); // lesson_id being uploaded
  
  // Fetch initial data
  useEffect(() => {
    fetchData();
    fetchVoices();
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, []);
  
  const fetchData = async () => {
    try {
      const [lessonsRes, statusRes] = await Promise.all([
        axios.get(`${API}/media/lessons-list`),
        axios.get(`${API}/media/status`)
      ]);
      setLessons(lessonsRes.data.lessons);
      setMediaStatus(statusRes.data);
    } catch (error) {
      toast.error(t('admin.errors.loadingData'));
    }
  };

  const fetchVoices = async () => {
    try {
      const res = await axios.get(`${API}/media/voices`);
      setVoices(res.data.voices);
    } catch (error) {
      console.error('Error fetching voices:', error);
    }
  };
  
  const fetchGenerationStatus = async () => {
    try {
      const res = await axios.get(`${API}/media/generation-status`);
      setGenerationStatus(res.data);
      
      // Check if audio generation completed
      if (res.data.audio && !res.data.audio.in_progress && generatingAudio) {
        setGeneratingAudio(false);
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        fetchData();
        toast.success(t('admin.media.batchAudioComplete'));
      }
    } catch (error) {
      console.error('Error fetching generation status:', error);
    }
  };
  
  const generateSingleAudio = async (lessonId) => {
    try {
      toast.info(t('admin.media.audioStartedFor', { lessonId }));
      await axios.post(`${API}/media/generate-audio`, {
        lesson_id: lessonId,
        language: selectedLanguage,
        voice: selectedVoice,
        model: 'tts-1-hd'
      });
      toast.success(t('admin.media.audioSuccess'));
      fetchData();
    } catch (error) {
      toast.error(`Erreur: ${error.response?.data?.detail || error.message}`);
    }
  };

  const startBatchAudioGeneration = async () => {
    try {
      setGeneratingAudio(true);
      await axios.post(`${API}/media/generate-batch`, {
        language: selectedLanguage,
        voice: selectedVoice
      });
      toast.info(t('admin.media.batchStarted'));
      
      // Start polling for status
      const interval = setInterval(fetchGenerationStatus, 3000);
      setPollingInterval(interval);
    } catch (error) {
      setGeneratingAudio(false);
      toast.error(`Erreur: ${error.response?.data?.detail || error.message}`);
    }
  };
  
  const handleVideoUpload = async (lessonId, file) => {
    if (!file) return;
    
    setUploadingVideo(lessonId);
    const formData = new FormData();
    formData.append('video', file);
    formData.append('lesson_id', lessonId);
    formData.append('language', selectedLanguage);
    
    try {
      await axios.post(`${API}/media/upload-video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      toast.success(t('admin.media.videoUploaded'));
      fetchData();
    } catch (error) {
      toast.error(`Erreur upload: ${error.response?.data?.detail || error.message}`);
    } finally {
      setUploadingVideo(null);
    }
  };
  
  const languageNames = { en: 'English', fr: 'Français', ar: 'العربية' };
  
  // Calculate video stats
  const videoStats = {
    en: lessons.filter(l => l.media?.en?.has_video).length,
    fr: lessons.filter(l => l.media?.fr?.has_video).length,
    ar: lessons.filter(l => l.media?.ar?.has_video).length
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header Stats - Redesigned */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Lessons */}
        <Card className="bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{mediaStatus?.total_lessons || 0}</p>
                <p className="text-sm text-slate-400">{t('admin.media.stats.totalLessons')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Audio Stats */}
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <Volume2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {(mediaStatus?.audio_generated?.en?.length || 0) + 
                   (mediaStatus?.audio_generated?.fr?.length || 0) + 
                   (mediaStatus?.audio_generated?.ar?.length || 0)}
                </p>
                <p className="text-sm text-slate-400">{t('admin.media.stats.audiosGenerated')}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                    EN: {mediaStatus?.audio_generated?.en?.length || 0}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                    FR: {mediaStatus?.audio_generated?.fr?.length || 0}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                    AR: {mediaStatus?.audio_generated?.ar?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Video Stats */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Image className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {videoStats.en + videoStats.fr + videoStats.ar}
                </p>
                <p className="text-sm text-slate-400">{t('admin.media.stats.videosUploaded')}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                    EN: {videoStats.en}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                    FR: {videoStats.fr}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                    AR: {videoStats.ar}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Coverage */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/20">
                <Settings className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {Math.round(((mediaStatus?.audio_generated?.en?.length || 0) / (mediaStatus?.total_lessons || 1)) * 100)}%
                </p>
                <p className="text-sm text-slate-400">{t('admin.media.stats.mediaCoverage')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Language & Voice Selection */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('admin.media.configuration')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('admin.media.ttsVoice')}</label>
              <select 
                value={selectedVoice} 
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-4 py-2"
                data-testid="voice-select"
              >
                {voices.map(voice => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} - {voice.description}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">{t('admin.media.workingLanguage')}</label>
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-4 py-2"
                data-testid="language-select"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Audio Generation */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-green-500" />
            {t('admin.media.audioGeneration')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">{t('admin.media.generateAllAudios')}</h3>
                <p className="text-sm text-slate-400">
                  {t('admin.media.ttsDescription', { language: languageNames[selectedLanguage] })}
                </p>
              </div>
              <Button 
                onClick={startBatchAudioGeneration}
                disabled={generatingAudio}
                size="lg"
                className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                data-testid="generate-all-audio-btn"
              >
                {generatingAudio ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('admin.media.inProgress')}
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 mr-2" />
                    {t('admin.media.generateAudioBtn')}
                  </>
                )}
              </Button>
            </div>
            
            {/* Audio Progress */}
            {generatingAudio && generationStatus?.audio && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('admin.media.progress')}</span>
                  <span>{generationStatus.audio.completed?.length || 0} / {generationStatus.audio.total || 23}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ 
                      width: `${((generationStatus.audio.completed?.length || 0) / (generationStatus.audio.total || 23)) * 100}%` 
                    }}
                  />
                </div>
                {generationStatus.audio.current_lesson && (
                  <p className="text-sm text-slate-400">
                    {t('admin.media.currentlyProcessing')} {generationStatus.audio.current_lesson}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Video Upload Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-purple-500" />
              {t('admin.media.videoManagement')}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVideoSection(!showVideoSection)}
              data-testid="toggle-video-section"
            >
              {showVideoSection ? t('admin.media.hide') : t('admin.media.show')}
            </Button>
          </div>
        </CardHeader>
        {showVideoSection && (
          <CardContent className="space-y-4">
            <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <Image className="w-8 h-8 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{t('admin.media.customVideoUpload')}</h3>
                  <p className="text-sm text-slate-400 mb-3">
                    {t('admin.media.customVideoDesc', { language: languageNames[selectedLanguage] })}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">{t('admin.media.mp4Recommended')}</span>
                    <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">{t('admin.media.maxSize')}</span>
                    <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">{t('admin.media.idealResolution')}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400">
                <strong>{t('admin.media.tip')}</strong> {t('admin.media.tipContent')}
              </p>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Lessons List - Redesigned */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('admin.media.lessonsAndMedia')}</CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> {t('admin.media.audio')}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> {t('admin.media.video')}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {lessons.map((lesson, idx) => (
              <div 
                key={lesson.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 hover:bg-muted rounded-xl transition-all duration-200 border border-transparent hover:border-border"
                data-testid={`lesson-row-${lesson.id}`}
              >
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{lesson.title}</p>
                    <p className="text-xs text-slate-400">{lesson.course_id} • {lesson.duration_minutes} min</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                  {/* Status badges per language */}
                  <div className="flex items-center gap-1 bg-background/50 rounded-lg p-1.5">
                    {['en', 'fr', 'ar'].map(lang => (
                      <div key={lang} className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-slate-500 uppercase">{lang}</span>
                        <div className="flex gap-0.5">
                          <span 
                            className={`w-5 h-5 flex items-center justify-center text-[10px] rounded ${
                              lesson.media?.[lang]?.has_audio 
                                ? 'bg-green-500/30 text-green-400' 
                                : 'bg-slate-700/50 text-slate-500'
                            }`}
                            title={`Audio ${lang.toUpperCase()}`}
                          >
                            A
                          </span>
                          <span 
                            className={`w-5 h-5 flex items-center justify-center text-[10px] rounded ${
                              lesson.media?.[lang]?.has_video 
                                ? 'bg-purple-500/30 text-purple-400' 
                                : 'bg-slate-700/50 text-slate-500'
                            }`}
                            title={`Video ${lang.toUpperCase()}`}
                          >
                            V
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateSingleAudio(lesson.id)}
                      disabled={generatingAudio}
                      title={t('admin.media.generateAudio')}
                      className="h-9 px-3"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                    
                    {/* Video Upload Button */}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                        onChange={(e) => handleVideoUpload(lesson.id, e.target.files?.[0])}
                        disabled={uploadingVideo === lesson.id}
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={`h-9 px-3 ${uploadingVideo === lesson.id ? 'animate-pulse' : ''}`}
                        title={t('admin.media.uploadVideoFor', { language: selectedLanguage.toUpperCase() })}
                        asChild
                      >
                        <span>
                          {uploadingVideo === lesson.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Image className="w-4 h-4" />
                          )}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
