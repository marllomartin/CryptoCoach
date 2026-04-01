import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API } from '../App';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Mail,
  Users,
  Send,
  FileText,
  Plus,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle,
  Eye,
  Trash2,
  Sparkles,
  Globe,
  TrendingUp
} from 'lucide-react';

export default function NewsletterAdminTab({ token }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState({ total: 0, active: 0, list: [] });
  const [newsletters, setNewsletters] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sending, setSending] = useState(null);
  const [generating, setGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    language: 'en',
    send_immediately: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subsRes, newsRes] = await Promise.all([
        axios.get(`${API}/newsletter/subscribers`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/newsletter/list`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setSubscribers({
        total: subsRes.data.total,
        active: subsRes.data.active,
        list: subsRes.data.subscribers
      });
      setNewsletters(newsRes.data.newsletters || []);
    } catch (error) {
      toast.error(t('admin.errors.loadingData'));
    } finally {
      setLoading(false);
    }
  };

  const generateAIContent = async () => {
    setGenerating(true);
    try {
      const res = await axios.post(
        `${API}/newsletter/generate-ai`,
        null,
        {
          params: { topic: 'weekly_recap', language: formData.language },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res.data.success) {
        setFormData(prev => ({
          ...prev,
          subject: res.data.generated.subject,
          content: res.data.generated.content
        }));
        toast.success(t('admin.newsletter.contentGenerated'));
        if (!res.data.ai_used) {
          toast.info(t('admin.newsletter.templateUsed'));
        }
      }
    } catch (error) {
      toast.error(t('admin.errors.generationError'));
    } finally {
      setGenerating(false);
    }
  };

  const createNewsletter = async () => {
    if (!formData.subject || !formData.content) {
      toast.error(t('admin.newsletter.fillAllFields'));
      return;
    }

    try {
      const res = await axios.post(`${API}/newsletter/create`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(formData.send_immediately ? t('admin.newsletter.createdAndSent') : t('admin.newsletter.created'));
        setShowCreateForm(false);
        setFormData({ subject: '', content: '', language: 'en', send_immediately: false });
        fetchData();
      }
    } catch (error) {
      toast.error(t('admin.errors.creationError'));
    }
  };

  const sendNewsletter = async (id) => {
    setSending(id);
    try {
      await axios.post(`${API}/newsletter/send/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('admin.newsletter.sent'));
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('admin.errors.sendError'));
    } finally {
      setSending(null);
    }
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{subscribers.total}</p>
                <p className="text-sm text-slate-400">{t('admin.newsletter.stats.totalSubscribers')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{subscribers.active}</p>
                <p className="text-sm text-slate-400">{t('admin.newsletter.stats.activeSubscribers')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Mail className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{newsletters.length}</p>
                <p className="text-sm text-slate-400">{t('admin.newsletter.stats.newsletters')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/20">
                <Send className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {newsletters.filter(n => n.sent).length}
                </p>
                <p className="text-sm text-slate-400">{t('admin.newsletter.stats.sent')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Newsletter Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t('admin.newsletter.management')}</h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('admin.newsletter.newNewsletter')}
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {t('admin.newsletter.createTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language Selection */}
              <div className="flex items-center gap-4">
                <label className="text-sm text-slate-400">{t('admin.newsletter.language')}</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  className="bg-muted border border-border rounded-lg px-3 py-2"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="ar">العربية</option>
                  <option value="all">{t('admin.newsletter.allLanguages')}</option>
                </select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAIContent}
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {t('admin.newsletter.generateWithAI')}
                </Button>
              </div>

              <Input
                placeholder={t('admin.newsletter.subjectPlaceholder')}
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                data-testid="newsletter-subject-input"
              />

              <Textarea
                placeholder={t('admin.newsletter.contentPlaceholder')}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={12}
                className="font-mono text-sm"
                data-testid="newsletter-content-input"
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="send_immediately"
                  checked={formData.send_immediately}
                  onChange={(e) => setFormData(prev => ({ ...prev, send_immediately: e.target.checked }))}
                  className="rounded border-border"
                />
                <label htmlFor="send_immediately" className="text-sm text-slate-400">
                  {t('admin.newsletter.sendImmediately')}
                </label>
              </div>

              <div className="flex gap-3">
                <Button onClick={createNewsletter} data-testid="create-newsletter-btn">
                  {formData.send_immediately ? (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {t('admin.newsletter.createAndSend')}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {t('admin.newsletter.createDraft')}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  {t('admin.newsletter.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Newsletters List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('admin.newsletter.history')}</CardTitle>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {newsletters.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('admin.newsletter.noNewsletters')}</p>
              <p className="text-sm">{t('admin.newsletter.emptyMessage')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {newsletters.map((newsletter) => (
                <div
                  key={newsletter.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        newsletter.sent 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {newsletter.sent ? t('admin.newsletter.statusSent') : t('admin.newsletter.statusDraft')}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">
                        {newsletter.language === 'all' ? 'Multi' : newsletter.language.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-white mt-1 truncate">{newsletter.subject}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(newsletter.created_at).toLocaleDateString()}
                      </span>
                      {newsletter.sent && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {t('admin.newsletter.recipients', { count: newsletter.recipients_count })}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!newsletter.sent && (
                      <Button
                        size="sm"
                        onClick={() => sendNewsletter(newsletter.id)}
                        disabled={sending === newsletter.id}
                        data-testid={`send-newsletter-${newsletter.id}`}
                      >
                        {sending === newsletter.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-1" />
                            {t('admin.newsletter.send')}
                          </>
                        )}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscribers List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            {t('admin.newsletter.subscribersTitle', { active: subscribers.active })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscribers.list.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>{t('admin.newsletter.noSubscribers')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">{t('admin.newsletter.tableHeaders.email')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">{t('admin.newsletter.tableHeaders.language')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">{t('admin.newsletter.tableHeaders.registrationDate')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">{t('admin.newsletter.tableHeaders.interests')}</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.list.slice(0, 20).map((sub, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 text-sm">{sub.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary">
                          {sub.language?.toUpperCase() || 'EN'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-400">
                        {new Date(sub.subscribed_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {(sub.interests || []).map((interest, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-xs bg-muted text-slate-300">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {subscribers.list.length > 20 && (
                <p className="text-center text-sm text-slate-500 mt-4">
                  {t('admin.newsletter.moreSubscribers', { count: subscribers.list.length - 20 })}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
