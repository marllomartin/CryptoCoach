import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API, useAuth } from '../App';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap,
  Award,
  BookOpen,
  TrendingUp,
  Bot,
  ChevronRight,
  Flame,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API}/courses`);
        setCourses(response.data);
      } catch (e) {
        console.error('Failed to fetch data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCourseProgress = (course) => {
    if (!user) return 0;
    const completedInCourse = user.completed_lessons?.filter(l => l.startsWith(course.id)).length || 0;
    return Math.round((completedInCourse / course.lessons_count) * 100);
  };

  const totalLessonsCompleted = user?.completed_lessons?.length || 0;
  const totalQuizzesCompleted = user?.completed_quizzes?.length || 0;
  const totalCertificates = user?.certificates?.length || 0;

  const stats = [
    { icon: BookOpen, label: t('dashboard.lessonsCompleted'), value: totalLessonsCompleted, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Target, label: t('dashboard.quizzesPassed'), value: totalQuizzesCompleted, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { icon: Award, label: t('dashboard.certificatesEarned'), value: totalCertificates, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: Zap, label: t('dashboard.totalXp'), value: user?.xp_points || 0, color: 'text-green-500', bg: 'bg-green-500/10' }
  ];

  const quickActions = [
    { icon: GraduationCap, label: t('dashboard.continueLearning'), href: '/academy', color: 'bg-blue-500' },
    { icon: Bot, label: t('dashboard.aiMentor'), href: '/mentor', color: 'bg-purple-500' },
    { icon: TrendingUp, label: t('dashboard.tradingSimulator'), href: '/simulator', color: 'bg-green-500' },
    { icon: BookOpen, label: t('dashboard.glossary'), href: '/glossary', color: 'bg-amber-500' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
                {t('dashboard.welcomeBack', { name: user?.full_name?.split(' ')[0] })}
              </h1>
              <p className="text-slate-400">
                {t('dashboard.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Flame className="w-5 h-5 text-amber-500" />
                <span className="text-amber-500 font-medium">{t('dashboard.dayStreak', { count: user?.streak_days || 0 })}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat, index) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center mb-4`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-heading font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="font-heading text-xl font-bold mb-4">{t('dashboard.quickActions')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href}>
                <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-xl ${action.color} flex items-center justify-center mb-4`}>
                      <action.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="font-medium">{action.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Course Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-bold">{t('dashboard.yourCourses')}</h2>
            <Link to="/academy">
              <Button variant="ghost" size="sm" className="text-primary">
                {t('dashboard.viewAll')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="bg-card border-border animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                    <div className="h-2 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.filter((course) => getCourseProgress(course) > 0).map((course) => {
                const progress = getCourseProgress(course);
                const colors = {
                  1: { border: 'border-blue-500/30', text: 'text-blue-500', bg: 'bg-blue-500' },
                  2: { border: 'border-purple-500/30', text: 'text-purple-500', bg: 'bg-purple-500' },
                  3: { border: 'border-amber-500/30', text: 'text-amber-500', bg: 'bg-amber-500' }
                };
                const color = colors[course.level];

                return (
                  <Link key={course.id} to={`/course/${course.id}`}>
                    <Card className={`bg-card border ${color.border} hover:border-opacity-100 transition-colors h-full`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className={`text-sm font-medium ${color.text}`}>{t('academy.level')} {course.level}</span>
                          <span className="text-sm text-slate-400">{progress}%</span>
                        </div>
                        <h3 className="font-heading font-bold text-lg mb-2">{course.title}</h3>
                        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{course.description}</p>
                        <Progress value={progress} className="h-2" />
                        <div className="mt-4 flex items-center justify-between text-sm">
                          <span className="text-slate-500">{course.lessons_count} {t('academy.lessons')}</span>
                          {progress === 100 ? (
                            <span className="text-green-500 flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              {t('dashboard.completed')}
                            </span>
                          ) : (
                            <span className={color.text}>Continue →</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Certificates CTA */}
        {totalCertificates > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl">{t('dashboard.certificatesCta', { count: totalCertificates })}</h3>
                    <p className="text-slate-400">{t('dashboard.downloadAchievements')}</p>
                  </div>
                </div>
                <Link to="/certificates">
                  <Button className="bg-primary hover:bg-primary/90">
                    {t('dashboard.viewCertificates')}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
