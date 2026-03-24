import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API, useAuth } from '../App';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { LessonCheckpoint } from '../components/LessonCheckpoint';
import { GlobalProgressBar } from '../components/GlobalProgressBar';
import { TrialBadge } from '../components/TrialBadge';
import { CoachTip } from '../components/CoachTip';
import { CertificateProgress } from '../components/CertificateProgress';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  ChevronRight,
  ChevronLeft,
  Target,
  Lightbulb,
  BookMarked,
  GraduationCap,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Headphones,
  Eye,
  List,
  X,
  Loader2,
  Gift,
  Lock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Slider } from '../components/ui/slider';

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user, token, refreshUser } = useAuth();
  const { i18n } = useTranslation();
  const appLanguage = i18n.language;
  const [lesson, setLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  
  // Audio state
  const [audioMode, setAudioMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState('full'); // 'intro', 'full', 'summary'
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const audioRef = useRef(null);
  
  // Reading progress
  const [readProgress, setReadProgress] = useState(0);
  const contentRef = useRef(null);
  
  // Table of contents
  const [showToc, setShowToc] = useState(false);
  const [sections, setSections] = useState([]);
  
  // Checkpoints state
  const [checkpointResults, setCheckpointResults] = useState({});
  
  // Media state
  const [lessonMedia, setLessonMedia] = useState(null);
  
  // Trial state
  const [trialStatus, setTrialStatus] = useState(null);

  const handleCheckpointComplete = (checkpointId, isCorrect) => {
    setCheckpointResults(prev => ({
      ...prev,
      [checkpointId]: isCorrect
    }));
  };

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        // Use app language context instead of browser language
        const lang = appLanguage || 'en';
        
        const response = await axios.get(`${API}/lessons/${lessonId}?lang=${lang}`);
        setLesson(response.data);
        
        // Parse sections from content
        const content = response.data.content || '';
        const headings = content.match(/^#{1,3} .+/gm) || [];
        setSections(headings.map(h => ({
          level: (h.match(/^#+/) || [''])[0].length,
          title: h.replace(/^#+\s*/, '')
        })));
        
        // Fetch all lessons for navigation
        const lessonsRes = await axios.get(`${API}/courses/${response.data.course_id}/lessons?lang=${lang}`);
        setAllLessons(lessonsRes.data);
        
        // Fetch media status
        try {
          const mediaRes = await axios.get(`${API}/media/lesson/${lessonId}?lang=${lang}`);
          setLessonMedia(mediaRes.data);
        } catch (e) {
          console.log('No media available for this lesson');
        }
        
        // Fetch trial status
        try {
          const trialParams = new URLSearchParams({
            subscription_tier: user?.subscription_tier || 'free'
          });
          if (user?.created_at) {
            trialParams.append('user_created_at', user.created_at);
          }
          // Check if user is admin
          if (user?.role === 'admin') {
            trialParams.append('is_admin', 'true');
          }
          const trialRes = await axios.get(`${API}/premium/trial/status/${lessonId}?${trialParams}`);
          setTrialStatus(trialRes.data);
        } catch (e) {
          console.log('Trial status not available');
        }
      } catch (e) {
        console.error('Failed to fetch lesson', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId, appLanguage, user]);
  
  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const rect = contentRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const contentHeight = contentRef.current.scrollHeight;
      const scrolled = Math.max(0, -rect.top + windowHeight);
      const progress = Math.min(100, (scrolled / contentHeight) * 100);
      setReadProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Audio controls
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);
  
  // Base URL without /api suffix for media URLs that already include /api
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  
  const getAudioUrl = (type) => {
    // First check new media service
    if (lessonMedia?.audio?.url) {
      // Media URLs already include /api prefix
      return `${BACKEND_URL}${lessonMedia.audio.url}`;
    }
    // Fallback to lesson fields
    if (!lesson) return null;
    switch (type) {
      case 'intro': return lesson.audio_intro ? `${API}${lesson.audio_intro}` : null;
      case 'full': return lesson.audio_full ? `${API}${lesson.audio_full}` : null;
      case 'summary': return lesson.audio_summary ? `${API}${lesson.audio_summary}` : null;
      default: return null;
    }
  };
  
  // Check if audio actually exists
  const hasAudio = !!(lessonMedia?.audio?.url) || !!(lesson?.audio_full) || !!(lesson?.audio_intro) || !!(lesson?.audio_summary);
  
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setAudioProgress(audioRef.current.currentTime);
    setAudioDuration(audioRef.current.duration || 0);
  };
  
  const handleSeek = (value) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setAudioProgress(value[0]);
  };
  
  const skipTime = (seconds) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(audioDuration, audioRef.current.currentTime + seconds));
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const completeLesson = async () => {
    if (!token) return;
    
    setCompleting(true);
    try {
      await axios.post(`${API}/lessons/${lessonId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Leçon terminée! +50 XP');
      await refreshUser();
    } catch (e) {
      toast.error('Erreur de validation');
    } finally {
      setCompleting(false);
    }
  };

  const isCompleted = user?.completed_lessons?.includes(lessonId);
  
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!lesson) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Leçon introuvable</h1>
            <Link to="/academy">
              <Button>Retour à l'Académie</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-background">
        <motion.div 
          className="h-full bg-primary"
          style={{ width: `${readProgress}%` }}
        />
      </div>
      
      {/* Audio Player (Fixed bottom when in audio mode) */}
      <AnimatePresence>
        {audioMode && hasAudio && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border p-4"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                {/* Audio type selector */}
                <div className="flex gap-2">
                  {lesson.audio_intro && (
                    <Button
                      size="sm"
                      variant={currentAudio === 'intro' ? 'default' : 'outline'}
                      onClick={() => setCurrentAudio('intro')}
                    >
                      Intro
                    </Button>
                  )}
                  {lesson.audio_full && (
                    <Button
                      size="sm"
                      variant={currentAudio === 'full' ? 'default' : 'outline'}
                      onClick={() => setCurrentAudio('full')}
                    >
                      Complet
                    </Button>
                  )}
                  {lesson.audio_summary && (
                    <Button
                      size="sm"
                      variant={currentAudio === 'summary' ? 'default' : 'outline'}
                      onClick={() => setCurrentAudio('summary')}
                    >
                      Résumé
                    </Button>
                  )}
                </div>
                
                {/* Playback controls */}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => skipTime(-10)}>
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={togglePlay} className="w-10 h-10 rounded-full">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => skipTime(10)}>
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Progress */}
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-12">{formatTime(audioProgress)}</span>
                  <Slider
                    value={[audioProgress]}
                    max={audioDuration || 100}
                    step={1}
                    onValueChange={handleSeek}
                    className="flex-1"
                  />
                  <span className="text-xs text-slate-400 w-12">{formatTime(audioDuration)}</span>
                </div>
                
                {/* Speed control */}
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="bg-muted border border-border rounded px-2 py-1 text-sm"
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
                
                {/* Close */}
                <Button size="sm" variant="ghost" onClick={() => setAudioMode(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Hidden audio element */}
              <audio
                ref={audioRef}
                src={getAudioUrl(currentAudio)}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={handleTimeUpdate}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Global Progress Bar */}
      <GlobalProgressBar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <Link to={`/course/${lesson.course_id}`} className="text-slate-400 hover:text-primary text-sm inline-flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Retour au cours
          </Link>
          
          {/* Mode toggles */}
          <div className="flex items-center gap-2">
            {hasAudio && (
              <Button
                size="sm"
                variant={audioMode ? 'default' : 'outline'}
                onClick={() => setAudioMode(!audioMode)}
                className="flex items-center gap-2"
              >
                <Headphones className="w-4 h-4" />
                Mode Audio
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowToc(!showToc)}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            ref={contentRef}
          >
            {/* Trial Badge */}
            {trialStatus && (trialStatus.has_trial || trialStatus.is_preview_only) && (
              <div className="mb-4">
                <TrialBadge 
                  trialStatus={trialStatus} 
                  onUpgradeClick={() => navigate('/pricing')}
                />
              </div>
            )}
            
            {/* Hero Image */}
            {lesson.hero_image && (
              <motion.div 
                className="mb-8 rounded-xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <img 
                  src={lesson.hero_image.startsWith('http') ? lesson.hero_image : `${API}${lesson.hero_image}`} 
                  alt={lesson.title}
                  className="w-full h-64 object-cover"
                />
              </motion.div>
            )}
            
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  Leçon {lesson.order + 1}
                </span>
                <span className="text-slate-500 text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {lesson.duration_minutes} min
                </span>
                {hasAudio && (
                  <span className="text-slate-500 text-sm flex items-center gap-1">
                    <Volume2 className="w-4 h-4" />
                    Audio
                  </span>
                )}
                {isCompleted && (
                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Terminée
                  </span>
                )}
              </div>
              
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                {lesson.title}
              </h1>
              
              {/* Quick audio intro button */}
              {lesson.audio_intro && !audioMode && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentAudio('intro');
                    setAudioMode(true);
                    setTimeout(() => {
                      if (audioRef.current) {
                        audioRef.current.play();
                        setIsPlaying(true);
                      }
                    }, 100);
                  }}
                  className="mt-4"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Écouter l'introduction (30 sec)
                </Button>
              )}
            </div>

            {/* Learning Objectives */}
            <Card className="bg-card border-border mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-primary" />
                  Objectifs d'apprentissage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {lesson.learning_objectives?.map((obj, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Main Content with enhanced rendering */}
            <div className="prose prose-invert max-w-none mb-8">
              <div 
                className="text-slate-300 leading-relaxed lesson-content"
                dangerouslySetInnerHTML={{ 
                  __html: lesson.content
                    .replace(/^# (.*)/gm, '<h1 class="font-heading text-2xl font-bold text-white mt-8 mb-4">$1</h1>')
                    .replace(/^## (.*)/gm, '<h2 class="font-heading text-xl font-bold text-white mt-6 mb-3">$1</h2>')
                    .replace(/^### (.*)/gm, '<h3 class="font-heading text-lg font-semibold text-white mt-4 mb-2">$1</h3>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                    .replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-0.5 rounded text-primary text-sm">$1</code>')
                    .replace(/!\[(.*?)\]\((.*?)\)/g, '<figure class="my-6"><img src="$2" alt="$1" class="rounded-xl w-full max-w-2xl mx-auto shadow-lg border border-border" /><figcaption class="text-center text-sm text-slate-400 mt-2">$1</figcaption></figure>')
                    .replace(/^- (.*)/gm, '<li class="ml-4 mb-1 flex items-start gap-2"><span class="text-primary">•</span><span>$1</span></li>')
                    .replace(/^\d+\. (.*)/gm, '<li class="ml-4 mb-1">$1</li>')
                    .replace(/\|(.*)\|/g, (match) => {
                      const cells = match.split('|').filter(c => c.trim());
                      if (cells.length > 0) {
                        return '<tr class="border-b border-border">' + cells.map(c => `<td class="px-4 py-2 text-sm">${c.trim()}</td>`).join('') + '</tr>';
                      }
                      return match;
                    })
                    .replace(/\n\n/g, '</p><p class="mb-4">')
                    .replace(/\n/g, '<br />')
                }}
              />
            </div>
            
            {/* Interactive Checkpoints */}
            {lesson.checkpoints?.length > 0 && (
              <div className="mb-8" data-testid="lesson-checkpoints">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="font-heading text-lg font-bold">Vérifiez votre compréhension</h3>
                  <span className="text-sm text-slate-400 ml-auto">
                    {Object.keys(checkpointResults).length}/{lesson.checkpoints.length} complétés
                  </span>
                </div>
                
                {lesson.checkpoints
                  .sort((a, b) => (a.position || 0) - (b.position || 0))
                  .map((checkpoint) => (
                    <LessonCheckpoint
                      key={checkpoint.id}
                      checkpoint={checkpoint}
                      onComplete={handleCheckpointComplete}
                    />
                  ))
                }
              </div>
            )}
            
            {/* Infographics */}
            {lesson.infographics?.length > 0 && (
              <div className="mb-8">
                <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Infographies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lesson.infographics.map((img, index) => (
                    <img 
                      key={index}
                      src={img.startsWith('http') ? img : `${API.replace('/api', '')}${img}`}
                      alt={`Infographie ${index + 1}`}
                      className="rounded-lg border border-border"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Examples */}
            {lesson.examples?.length > 0 && (
              <Card className="bg-card border-border mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Exemples concrets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {lesson.examples.map((example, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-300">
                        <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm flex-shrink-0">
                          {index + 1}
                        </span>
                        {example}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Summary with audio option */}
            {lesson.summary && (
              <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 border-primary/20 mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      <BookMarked className="w-5 h-5 text-primary" />
                      Résumé
                    </span>
                    {lesson.audio_summary && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCurrentAudio('summary');
                          setAudioMode(true);
                          setTimeout(() => {
                            if (audioRef.current) {
                              audioRef.current.play();
                              setIsPlaying(true);
                            }
                          }, 100);
                        }}
                      >
                        <Volume2 className="w-4 h-4 mr-1" />
                        Écouter
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 leading-relaxed">{lesson.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Recommended Readings */}
            {lesson.recommended_readings?.length > 0 && (
              <Card className="bg-card border-border mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    Lectures recommandées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {lesson.recommended_readings.map((reading, index) => (
                      <li key={index} className="flex items-center gap-2 text-slate-300">
                        <ChevronRight className="w-4 h-4 text-blue-500" />
                        {reading}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Coach's Tip */}
            <CoachTip lessonId={lessonId} language={appLanguage?.split('-')[0] || 'en'} />

            {/* Certificate Progress */}
            <div className="mb-8">
              <CertificateProgress 
                completedLessons={user?.completed_lessons?.length || 0}
                totalLessons={23}
                language={appLanguage?.split('-')[0] || 'en'}
              />
            </div>

            {/* Complete Button */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              {prevLesson && (
                <Link to={`/lesson/${prevLesson.id}`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </Button>
                </Link>
              )}
              
              <div className="flex items-center gap-4">
                {!isCompleted && user && (
                  <Button
                    onClick={completeLesson}
                    disabled={completing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {completing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Validation...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marquer comme terminée
                      </>
                    )}
                  </Button>
                )}
                
                <Link to={`/quiz/${lessonId}`}>
                  <Button className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Passer le Quiz
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              
              {nextLesson && (
                <Link to={`/lesson/${nextLesson.id}`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Table of Contents */}
            <AnimatePresence>
              {showToc && sections.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-sm">Table des matières</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {sections.map((section, index) => (
                          <li 
                            key={index}
                            className={`text-slate-400 hover:text-primary cursor-pointer ${
                              section.level === 1 ? 'font-medium text-slate-300' : 
                              section.level === 2 ? 'ml-3' : 'ml-6 text-xs'
                            }`}
                          >
                            {section.title}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Progress Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm">Progression du cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Progress value={(currentIndex / allLessons.length) * 100} className="h-2" />
                  <p className="text-xs text-slate-400">
                    Leçon {currentIndex + 1} sur {allLessons.length}
                  </p>
                </div>
                
                {/* Lesson list */}
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                  {allLessons.map((l, i) => (
                    <Link
                      key={l.id}
                      to={`/lesson/${l.id}`}
                      className={`block p-2 rounded text-sm transition-colors ${
                        l.id === lessonId
                          ? 'bg-primary/20 text-primary'
                          : user?.completed_lessons?.includes(l.id)
                          ? 'text-green-500 hover:bg-muted'
                          : 'text-slate-400 hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {user?.completed_lessons?.includes(l.id) ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-xs">
                            {i + 1}
                          </span>
                        )}
                        <span className="truncate">{l.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* XP Card */}
            {user && (
              <Card className="bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{user.xp_points || 0}</p>
                  <p className="text-xs text-slate-400">Points XP</p>
                  <p className="text-xs text-slate-500 mt-2">
                    +50 XP en complétant cette leçon
                  </p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Bottom padding for audio player */}
      {audioMode && <div className="h-24" />}
    </Layout>
  );
}
