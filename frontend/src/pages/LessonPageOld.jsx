import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API, useAuth } from '../App';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  ChevronRight,
  ChevronLeft,
  Target,
  Lightbulb,
  BookMarked,
  GraduationCap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user, token, refreshUser } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await axios.get(`${API}/lessons/${lessonId}`);
        setLesson(response.data);
        
        // Fetch all lessons for navigation
        const lessonsRes = await axios.get(`${API}/courses/${response.data.course_id}/lessons`);
        setAllLessons(lessonsRes.data);
      } catch (e) {
        console.error('Failed to fetch lesson', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  const completeLesson = async () => {
    if (!token) return;
    
    setCompleting(true);
    try {
      await axios.post(`${API}/lessons/${lessonId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Lesson completed! +50 XP');
      await refreshUser();
    } catch (e) {
      toast.error('Failed to complete lesson');
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
          <div className="animate-pulse text-primary text-xl">Loading lesson...</div>
        </div>
      </Layout>
    );
  }

  if (!lesson) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
            <Link to="/academy">
              <Button>Back to Academy</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to={`/course/${lesson.course_id}`} className="text-slate-400 hover:text-primary text-sm inline-flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Course
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  Lesson {lesson.order}
                </span>
                <span className="text-slate-500 text-sm flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {lesson.duration_minutes} min
                </span>
                {isCompleted && (
                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </span>
                )}
              </div>
              
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                {lesson.title}
              </h1>
            </div>

            {/* Learning Objectives */}
            <Card className="bg-card border-border mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-primary" />
                  Learning Objectives
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

            {/* Main Content */}
            <div className="prose prose-invert max-w-none mb-8">
              <div 
                className="text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: lesson.content
                    .replace(/^# /gm, '<h1 class="font-heading text-2xl font-bold text-white mt-8 mb-4">')
                    .replace(/^## /gm, '<h2 class="font-heading text-xl font-bold text-white mt-6 mb-3">')
                    .replace(/^### /gm, '<h3 class="font-heading text-lg font-semibold text-white mt-4 mb-2">')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                    .replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-0.5 rounded text-primary text-sm">$1</code>')
                    .replace(/^- /gm, '<li class="ml-4 mb-1">')
                    .replace(/^\d+\. /gm, '<li class="ml-4 mb-1">')
                    .split('\n').join('<br />')
                }}
              />
            </div>

            {/* Examples */}
            {lesson.examples?.length > 0 && (
              <Card className="bg-card border-border mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Real-World Examples
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

            {/* Summary */}
            <Card className="bg-primary/5 border-primary/20 mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Key Takeaway
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{lesson.summary}</p>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-border pt-8">
              {prevLesson ? (
                <Link to={`/lesson/${prevLesson.id}`}>
                  <Button variant="outline" className="border-slate-700">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous Lesson
                  </Button>
                </Link>
              ) : (
                <div />
              )}

              <div className="flex gap-4">
                {!isCompleted && (
                  <Button 
                    onClick={completeLesson}
                    disabled={completing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {completing ? 'Completing...' : 'Mark Complete'}
                  </Button>
                )}
                
                <Link to={`/quiz/${lessonId}`}>
                  <Button className="bg-primary hover:bg-primary/90">
                    Take Quiz
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>

              {nextLesson ? (
                <Link to={`/lesson/${nextLesson.id}`}>
                  <Button variant="outline" className="border-slate-700">
                    Next Lesson
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Recommended Readings */}
            {lesson.recommended_readings?.length > 0 && (
              <Card className="bg-card border-border mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookMarked className="w-5 h-5 text-primary" />
                    Recommended Readings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {lesson.recommended_readings.map((reading, index) => (
                      <li key={index} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {reading}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Course Progress */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Course Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {allLessons.map((l) => {
                    const isActive = l.id === lessonId;
                    const isDone = user?.completed_lessons?.includes(l.id);
                    
                    return (
                      <Link 
                        key={l.id}
                        to={`/lesson/${l.id}`}
                        className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                          isActive 
                            ? 'bg-primary/10 text-primary' 
                            : isDone 
                              ? 'text-green-400 hover:bg-muted'
                              : 'text-slate-400 hover:bg-muted'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border ${isActive ? 'border-primary bg-primary' : 'border-slate-600'}`} />
                        )}
                        <span className="truncate">{l.order}. {l.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
