import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, API } from '../App';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import axios from 'axios';
import { 
  Map, Lock, CheckCircle, ChevronRight, Star, Zap, 
  BookOpen, Target, Trophy, Play, Gift, Sparkles,
  Clock, Award, TrendingUp, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';

const CryptoQuestPage = () => {
  const { user, token } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [questProgress, setQuestProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState(null);

  const fetchProgress = useCallback(async () => {
    if (!user || !token) return;
    
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API}/v2/quest/progress/${user.id}`, { headers });
      setQuestProgress(response.data);
      
      // Auto-expand first incomplete chapter
      const firstIncomplete = response.data.chapters.find(ch => ch.unlocked && !ch.completed);
      if (firstIncomplete) {
        setExpandedChapter(firstIncomplete.id);
      }
    } catch (error) {
      console.error('Error fetching quest progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleMissionClick = async (mission, chapter) => {
    if (mission.locked || !chapter.unlocked) {
      toast.error(t('quest.locked'));
      return;
    }

    if (mission.completed) {
      toast.info(t('quest.completed'));
      return;
    }

    // Navigate based on mission type
    if (mission.type === 'lesson' && mission.linked_lesson_id) {
      navigate(`/lesson/${mission.linked_lesson_id}`);
    } else if (mission.type === 'quiz' && mission.linked_quiz_id) {
      // Navigate to quiz
      const lessonId = mission.linked_quiz_id.replace('quiz-', 'lesson-');
      navigate(`/lesson/${lessonId}-1?quiz=true`);
    } else if (mission.type === 'exam' && mission.linked_exam_id) {
      navigate('/academy');
    } else if (mission.type === 'trading_challenge') {
      navigate('/trading-arena');
    }
  };

  const checkChallenge = async (mission) => {
    if (mission.type !== 'trading_challenge') return;
    
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        `${API}/v2/quest/challenge/${user.id}/${mission.id}`, 
        { headers }
      );
      
      if (response.data.completed) {
        toast.success(`${t('quest.mission')} ${t('quest.completed')}! +${mission.xp_reward} XP`);
        fetchProgress();
      } else {
        toast.info(`${t('quest.progress')}: ${response.data.current_value}/${response.data.target_value}`);
      }
    } catch (error) {
      console.error('Error checking challenge:', error);
    }
  };

  const getLocalizedText = (item, field) => {
    const lang = i18n.language;
    if (lang === 'fr' && item[`${field}_fr`]) return item[`${field}_fr`];
    if (lang === 'ar' && item[`${field}_ar`]) return item[`${field}_ar`];
    return item[field];
  };

  const getChapterName = (nameKey) => {
    return t(`quest.chapters.${nameKey}`);
  };

  const getChapterDesc = (nameKey) => {
    return t(`quest.chapters.${nameKey}Desc`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
            <p className="text-gray-400">{t('common.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-8" data-testid="crypto-quest-page">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Header */}
          <div className="text-center mb-10" data-testid="quest-header">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-primary font-medium">{t('quest.title')}</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3" data-testid="quest-title">{t('quest.title')}</h1>
            <p className="text-gray-400 text-lg" data-testid="quest-subtitle">{t('quest.subtitle')}</p>
          </div>

          {/* Overall Progress */}
          {questProgress && (
            <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-xl p-6 mb-8" data-testid="quest-progress-section">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Map className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">{t('quest.progress')}</h2>
                    <p className="text-sm text-gray-400" data-testid="quest-progress-text">
                      {questProgress.overall_progress.completed} / {questProgress.overall_progress.total} {t('quest.mission')}s
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary" data-testid="quest-progress-percent">{questProgress.overall_progress.percent}%</p>
                </div>
              </div>
              <Progress value={questProgress.overall_progress.percent} className="h-3" data-testid="quest-progress-bar" />
            </div>
          )}

          {/* Chapters */}
          <div className="space-y-4" data-testid="chapters-list">
            {questProgress?.chapters.map((chapter, index) => (
              <ChapterCard
                key={chapter.id}
                chapter={chapter}
                index={index}
                expanded={expandedChapter === chapter.id}
                onToggle={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                onMissionClick={handleMissionClick}
                onCheckChallenge={checkChallenge}
                getLocalizedText={getLocalizedText}
                getChapterName={getChapterName}
                getChapterDesc={getChapterDesc}
                t={t}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Chapter Card Component
const ChapterCard = ({ 
  chapter, index, expanded, onToggle, onMissionClick, 
  onCheckChallenge, getLocalizedText, getChapterName, getChapterDesc, t 
}) => {
  const isLocked = !chapter.unlocked;
  const isCompleted = chapter.completed;
  
  const chapterColors = [
    'from-blue-500 to-cyan-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-yellow-500',
    'from-red-500 to-rose-500'
  ];
  
  const bgColor = chapterColors[index % chapterColors.length];
  
  return (
    <div className={`rounded-xl overflow-hidden transition-all ${
      isLocked ? 'opacity-60' : ''
    }`} data-testid={`chapter-${chapter.number}`}>
      {/* Chapter Header */}
      <button
        onClick={() => !isLocked && onToggle()}
        disabled={isLocked}
        data-testid={`chapter-header-${chapter.number}`}
        className={`w-full p-6 flex items-center gap-4 transition-all ${
          isCompleted ? 'bg-green-500/10 border border-green-500/30' :
          isLocked ? 'bg-gray-900/40 border border-gray-800 cursor-not-allowed' :
          'bg-gray-900/60 border border-gray-800 hover:bg-gray-900/80'
        }`}
      >
        {/* Chapter Number Badge */}
        <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
          isCompleted ? 'bg-green-500' :
          isLocked ? 'bg-gray-700' :
          `bg-gradient-to-br ${bgColor}`
        }`}>
          {isCompleted ? (
            <CheckCircle className="w-8 h-8 text-white" />
          ) : isLocked ? (
            <Lock className="w-6 h-6 text-gray-400" />
          ) : (
            <span className="text-2xl font-bold text-white">{chapter.number}</span>
          )}
        </div>
        
        {/* Chapter Info */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 uppercase tracking-wider">
              {t('quest.chapter')} {chapter.number}
            </span>
            {isLocked && (
              <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">
                {t('hub.level')} {chapter.unlock_level}+
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-1">
            {getChapterName(chapter.name_key)}
          </h3>
          <p className="text-sm text-gray-400">
            {getChapterDesc(chapter.name_key)}
          </p>
        </div>
        
        {/* Progress & Rewards */}
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-2">
            <span className="text-sm text-yellow-500">{chapter.xp_reward} XP</span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-yellow-500">{chapter.coins_reward} 🪙</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Progress value={chapter.progress.percent} className="w-24 h-2" />
            <span className="text-sm text-gray-400">
              {chapter.progress.completed}/{chapter.progress.total}
            </span>
          </div>
        </div>
        
        {!isLocked && (
          <ChevronRight className={`w-6 h-6 text-gray-500 transition-transform ${
            expanded ? 'rotate-90' : ''
          }`} />
        )}
      </button>
      
      {/* Missions List */}
      {expanded && !isLocked && (
        <div className="bg-gray-900/40 border-x border-b border-gray-800 p-4">
          <div className="space-y-3">
            {chapter.missions.map((mission, mIndex) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                index={mIndex}
                chapter={chapter}
                onMissionClick={onMissionClick}
                onCheckChallenge={onCheckChallenge}
                getLocalizedText={getLocalizedText}
                t={t}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Mission Card Component
const MissionCard = ({ mission, index, chapter, onMissionClick, onCheckChallenge, getLocalizedText, t }) => {
  const isCompleted = mission.completed;
  
  const getMissionIcon = () => {
    switch (mission.type) {
      case 'lesson': return BookOpen;
      case 'quiz': return Target;
      case 'exam': return Award;
      case 'trading_challenge': return TrendingUp;
      default: return Star;
    }
  };
  
  const Icon = getMissionIcon();
  
  return (
    <div 
      onClick={() => onMissionClick(mission, chapter)}
      data-testid={`mission-${mission.id}`}
      className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
        isCompleted 
          ? 'bg-green-500/10 border border-green-500/30' 
          : 'bg-gray-800/50 border border-gray-700 hover:border-primary/50 hover:bg-gray-800'
      }`}
    >
      {/* Mission Number/Status */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        isCompleted ? 'bg-green-500' : 'bg-gray-700'
      }`}>
        {isCompleted ? (
          <CheckCircle className="w-5 h-5 text-white" />
        ) : (
          <span className="font-bold text-white">{mission.number}</span>
        )}
      </div>
      
      {/* Mission Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`w-4 h-4 ${isCompleted ? 'text-green-500' : 'text-primary'}`} />
          <h4 className="font-medium text-white">
            {getLocalizedText(mission, 'title')}
          </h4>
        </div>
        <p className="text-sm text-gray-400">
          {getLocalizedText(mission, 'description')}
        </p>
      </div>
      
      {/* Reward */}
      <div className="text-right">
        <div className="flex items-center gap-1 text-yellow-500">
          <Zap className="w-4 h-4" />
          <span className="font-medium">+{mission.xp_reward}</span>
        </div>
        {mission.type === 'trading_challenge' && (
          <button 
            onClick={(e) => { e.stopPropagation(); onCheckChallenge(mission); }}
            className="text-xs text-primary hover:underline mt-1"
          >
            {t('quest.progress')}
          </button>
        )}
      </div>
      
      {/* Action */}
      <ChevronRight className={`w-5 h-5 ${isCompleted ? 'text-green-500' : 'text-gray-500'}`} />
    </div>
  );
};

export default CryptoQuestPage;
