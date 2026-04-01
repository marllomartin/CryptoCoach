import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API, useAuth } from '../App';
import { useTranslation } from 'react-i18next';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Circle,
  ChevronRight,
  Award,
  Play,
  Lock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

export default function CoursePage() {
  const { courseId } = useParams();
  const { user, token } = useAuth();
  const { t, i18n } = useTranslation();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lang = i18n.language?.split('-')[0] || 'en';
    const fetchData = async () => {
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          axios.get(`${API}/courses/${courseId}?lang=${lang}`),
          axios.get(`${API}/courses/${courseId}/lessons?lang=${lang}`)
        ]);
        setCourse(courseRes.data);
        setLessons(lessonsRes.data);
      } catch (e) {
        console.error('Failed to fetch course data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, i18n.language]);

  const isLessonCompleted = (lessonId) => {
    return user?.completed_lessons?.includes(lessonId);
  };

  const getProgress = () => {
    if (!user || lessons.length === 0) return 0;
    const completed = lessons.filter(l => isLessonCompleted(l.id)).length;
    return Math.round((completed / lessons.length) * 100);
  };

  const allLessonsCompleted = () => {
    return lessons.length > 0 && lessons.every(l => isLessonCompleted(l.id));
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-primary text-xl">{t('course.loading')}</div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t('course.notFound')}</h1>
            <Link to="/academy">
              <Button>{t('exam.backToAcademy')}</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const progress = getProgress();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 bg-card/50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to="/academy" className="text-slate-400 hover:text-primary text-sm mb-4 inline-block">
              {t('course.backToAcademy')}
            </Link>
            
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  {t('course.level', { n: course.level })}
                </span>
                
                <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
                  {course.title}
                </h1>
                
                <p className="text-lg text-slate-300 mb-6">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-6">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{t('course.lessons', { count: course.lessons_count })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{t('course.hours', { count: course.duration_hours })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>{t('course.certificateIncluded')}</span>
                  </div>
                </div>

                {user && (
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">{t('course.yourProgress')}</span>
                      <span className="text-primary font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                )}

                {!user && (
                  <Link to="/register">
                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                      {t('course.signUpToStart')}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>

              <div className="w-full lg:w-80">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('course.topicsCovered')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {course.topics?.map((topic, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-slate-300">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lessons List */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold mb-8">{t('course.courseLessons')}</h2>

          <div className="space-y-4">
            {lessons.map((lesson, index) => {
              const completed = isLessonCompleted(lesson.id);
              const isLocked = !user && index > 0;

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`bg-card border-border transition-all ${!isLocked && 'hover:border-primary/50 cursor-pointer'} ${completed && 'border-green-500/30'}`}>
                    <CardContent className="p-0">
                      {isLocked ? (
                        <div className="flex items-center gap-4 p-6 opacity-60">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Lock className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm text-slate-500">{t('course.lessonNumber', { n: lesson.order })}</span>
                            </div>
                            <h3 className="font-semibold text-slate-400">{lesson.title}</h3>
                          </div>
                          <span className="text-sm text-slate-500">{t('course.signInToAccess')}</span>
                        </div>
                      ) : (
                        <Link to={`/lesson/${lesson.id}`} className="flex items-center gap-4 p-6">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${completed ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                            {completed ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                              <Play className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm text-slate-500">{t('course.lessonNumber', { n: lesson.order })}</span>
                              <span className="text-sm text-slate-500">•</span>
                              <span className="text-sm text-slate-500">{lesson.duration_minutes} min</span>
                            </div>
                            <h3 className="font-semibold">{lesson.title}</h3>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Exam CTA */}
      {user && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className={`border ${allLessonsCompleted() ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
              <CardContent className="p-8 text-center">
                <Award className={`w-12 h-12 mx-auto mb-4 ${allLessonsCompleted() ? 'text-primary' : 'text-slate-500'}`} />
                <h3 className="font-heading text-2xl font-bold mb-2">
                  {t('course.certificationExam')}
                </h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  {allLessonsCompleted()
                    ? t('course.allCompleted')
                    : t('course.completeToUnlock', { count: lessons.length })
                  }
                </p>
                {allLessonsCompleted() ? (
                  <Link to={`/exam/${course.level}`}>
                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                      {t('course.takeCertExam')}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-slate-500">
                    <Lock className="w-4 h-4" />
                    <span>{t('course.completeAllLessons')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </Layout>
  );
}
