import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API, useAuth } from '../App';
import { toast } from 'sonner';
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
  Mail
} from 'lucide-react';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import NewsletterAdminTab from '../components/NewsletterAdminTab';

// Admin emails (should match backend)
const ADMIN_EMAILS = ['admin@thecryptocoach.io', 'mehdi@thecryptocoach.io'];

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Check admin access
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!ADMIN_EMAILS.includes(user.email)) {
      toast.error('Accès administrateur requis');
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
      toast.error('Erreur de chargement des statistiques');
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
                Panel Administrateur
              </h1>
              <p className="text-slate-400 mt-1">Gérez votre plateforme CryptoCoach</p>
            </div>
            <Button onClick={fetchStats} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
          
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-7 w-full mb-8">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Cours
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="newsletter" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Newsletter
              </TabsTrigger>
              <TabsTrigger value="blog" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Blog
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Média
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <DashboardTab stats={stats} />
            </TabsContent>
            
            <TabsContent value="analytics">
              <AnalyticsDashboard token={token} />
            </TabsContent>
            
            <TabsContent value="courses">
              <CoursesTab token={token} />
            </TabsContent>
            
            <TabsContent value="users">
              <UsersTab token={token} />
            </TabsContent>
            
            <TabsContent value="newsletter">
              <NewsletterAdminTab token={token} />
            </TabsContent>
            
            <TabsContent value="blog">
              <BlogTab token={token} />
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
  if (!stats) return null;
  
  const statCards = [
    { label: 'Utilisateurs', value: stats.total_users, icon: Users, color: 'text-blue-500' },
    { label: 'Nouveaux (30j)', value: stats.recent_signups, icon: Plus, color: 'text-green-500' },
    { label: 'Cours', value: stats.courses_count, icon: BookOpen, color: 'text-purple-500' },
    { label: 'Leçons', value: stats.lessons_count, icon: FileText, color: 'text-orange-500' },
    { label: 'Articles', value: stats.blog_posts_count, icon: FileText, color: 'text-pink-500' },
    { label: 'Transactions', value: stats.paid_transactions, icon: Crown, color: 'text-yellow-500' },
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
          <CardTitle className="text-lg">Répartition des abonnements</CardTitle>
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

// Courses Tab Component
function CoursesTab({ token }) {
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState(null);
  
  useEffect(() => {
    fetchCourses();
  }, []);
  
  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API}/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data.courses);
    } catch (error) {
      toast.error('Erreur de chargement des cours');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchLessons = async (courseId) => {
    try {
      const response = await axios.get(`${API}/admin/lessons?course_id=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLessons(response.data.lessons);
      setSelectedCourse(courseId);
    } catch (error) {
      toast.error('Erreur de chargement des leçons');
    }
  };
  
  const generateAudio = async (lessonId) => {
    try {
      toast.info('Génération audio en cours...');
      const response = await axios.post(
        `${API}/admin/generate-audio/${lessonId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 'success') {
        toast.success('Audio généré avec succès!');
        fetchLessons(selectedCourse);
      } else {
        toast.error('Erreur: ' + response.data.error);
      }
    } catch (error) {
      toast.error('Erreur de génération audio');
    }
  };
  
  const generateImage = async (lessonId) => {
    try {
      toast.info('Génération image en cours...');
      const response = await axios.post(
        `${API}/admin/generate-image/${lessonId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 'success') {
        toast.success('Image générée avec succès!');
        fetchLessons(selectedCourse);
      } else {
        toast.error('Erreur: ' + response.data.error);
      }
    } catch (error) {
      toast.error('Erreur de génération image');
    }
  };
  
  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Courses List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Cours
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {courses.map((course) => (
            <div
              key={course.id}
              onClick={() => fetchLessons(course.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedCourse === course.id
                  ? 'bg-primary/20 border border-primary'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <p className="font-medium">{course.title}</p>
              <p className="text-xs text-slate-400">
                Niveau {course.level} • {course.lessons_count} leçons
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Lessons List */}
      <Card className="bg-card border-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Leçons {selectedCourse && `(${lessons.length})`}
            {selectedCourse && (
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" /> Nouvelle leçon
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedCourse ? (
            <p className="text-slate-400 text-center py-8">
              Sélectionnez un cours pour voir ses leçons
            </p>
          ) : lessons.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Aucune leçon</p>
          ) : (
            <div className="space-y-3">
              {lessons.sort((a, b) => a.order - b.order).map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{lesson.order + 1}. {lesson.title}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {lesson.duration_minutes} min • 
                        {lesson.audio_full ? ' 🔊 Audio' : ' ⚪ Pas d\'audio'} •
                        {lesson.hero_image ? ' 🖼️ Image' : ' ⚪ Pas d\'image'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => generateAudio(lesson.id)}
                        title="Générer audio"
                      >
                        <Volume2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => generateImage(lesson.id)}
                        title="Générer image"
                      >
                        <Image className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingLesson(lesson)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Show generated media */}
                  {(lesson.audio_full || lesson.hero_image) && (
                    <div className="mt-3 flex gap-4">
                      {lesson.hero_image && (
                        <img 
                          src={lesson.hero_image} 
                          alt={lesson.title}
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
  );
}

// Users Tab Component
function UsersTab({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  
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
      toast.error('Erreur de chargement des utilisateurs');
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
      toast.success('Abonnement mis à jour');
      fetchUsers();
    } catch (error) {
      toast.error('Erreur de mise à jour');
    }
  };
  
  const tierColors = {
    free: 'bg-slate-500',
    starter: 'bg-blue-500',
    pro: 'bg-purple-500',
    elite: 'bg-yellow-500'
  };
  
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Utilisateurs ({total})</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Rechercher..."
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
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Nom</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Abonnement</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">XP</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Inscription</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm">{user.email}</td>
                    <td className="py-3 px-4 text-sm">{user.full_name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs text-white ${tierColors[user.subscription_tier] || tierColors.free}`}>
                        {user.subscription_tier || 'free'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{user.xp_points || 0}</td>
                    <td className="py-3 px-4 text-sm text-slate-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        className="bg-muted border border-border rounded px-2 py-1 text-xs"
                        value={user.subscription_tier || 'free'}
                        onChange={(e) => updateUserTier(user.id, e.target.value)}
                      >
                        <option value="free">Free</option>
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="elite">Elite</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Blog Tab Component
function BlogTab({ token }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Education',
    tags: []
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
      toast.error('Erreur de chargement des articles');
    } finally {
      setLoading(false);
    }
  };
  
  const createPost = async () => {
    try {
      await axios.post(
        `${API}/admin/blog`,
        null,
        {
          params: formData,
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Article créé');
      setShowForm(false);
      setFormData({ title: '', slug: '', excerpt: '', content: '', category: 'Education', tags: [] });
      fetchPosts();
    } catch (error) {
      toast.error('Erreur de création');
    }
  };
  
  const deletePost = async (postId) => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      await axios.delete(`${API}/admin/blog/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Article supprimé');
      fetchPosts();
    } catch (error) {
      toast.error('Erreur de suppression');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Articles de blog ({posts.length})</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel article
        </Button>
      </div>
      
      {showForm && (
        <Card className="bg-card border-border">
          <CardContent className="p-6 space-y-4">
            <Input
              placeholder="Titre"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
            />
            <Input
              placeholder="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
            />
            <Input
              placeholder="Extrait"
              value={formData.excerpt}
              onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
            />
            <Textarea
              placeholder="Contenu (Markdown)"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              rows={10}
            />
            <Input
              placeholder="Catégorie"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            />
            <div className="flex gap-2">
              <Button onClick={createPost}>Publier</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="bg-card border-border">
            <CardContent className="p-4">
              <h3 className="font-medium mb-2 line-clamp-2">{post.title}</h3>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary">{post.category}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => deletePost(post.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
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
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [mediaStatus, setMediaStatus] = useState(null);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(true);
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
      toast.error('Erreur de chargement des données');
    } finally {
      setLoading(false);
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
        toast.success('Génération audio terminée!');
      }
    } catch (error) {
      console.error('Error fetching generation status:', error);
    }
  };
  
  const generateSingleAudio = async (lessonId) => {
    try {
      toast.info(`Génération audio pour ${lessonId}...`);
      await axios.post(`${API}/media/generate-audio`, {
        lesson_id: lessonId,
        language: selectedLanguage,
        voice: selectedVoice,
        model: 'tts-1-hd'
      });
      toast.success('Audio généré avec succès!');
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
      toast.info('Génération batch audio démarrée...');
      
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
      toast.success('Vidéo uploadée avec succès!');
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
                <p className="text-sm text-slate-400">Leçons totales</p>
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
                <p className="text-sm text-slate-400">Audios générés</p>
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
                <p className="text-sm text-slate-400">Vidéos uploadées</p>
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
                <p className="text-sm text-slate-400">Couverture média (EN)</p>
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
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Voix TTS</label>
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
              <label className="block text-sm font-medium mb-2">Langue de travail</label>
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
            Génération Audio (TTS)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">Générer tous les audios</h3>
                <p className="text-sm text-slate-400">
                  Narration TTS pour les 23 leçons en {languageNames[selectedLanguage]}
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
                    En cours...
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 mr-2" />
                    Générer Audio
                  </>
                )}
              </Button>
            </div>
            
            {/* Audio Progress */}
            {generatingAudio && generationStatus?.audio && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
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
                    En cours: {generationStatus.audio.current_lesson}
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
              Gestion des Vidéos
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowVideoSection(!showVideoSection)}
              data-testid="toggle-video-section"
            >
              {showVideoSection ? 'Masquer' : 'Afficher'}
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
                  <h3 className="font-bold text-lg mb-1">Upload de vidéos personnalisées</h3>
                  <p className="text-sm text-slate-400 mb-3">
                    Uploadez vos propres vidéos pour chaque leçon. Les vidéos seront associées à la langue sélectionnée ({languageNames[selectedLanguage]}).
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">MP4 recommandé</span>
                    <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">Max 500MB</span>
                    <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">1080p idéal</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400">
                <strong>Conseil:</strong> Utilisez la liste des leçons ci-dessous pour uploader une vidéo par leçon. 
                Le bouton d'upload apparaît à côté de chaque leçon.
              </p>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* Lessons List - Redesigned */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leçons & Médias</CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Audio
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Vidéo
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
                      title="Générer audio"
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
                        title={`Uploader vidéo (${selectedLanguage.toUpperCase()})`}
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
