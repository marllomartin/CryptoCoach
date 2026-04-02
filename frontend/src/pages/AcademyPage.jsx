import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API, useAuth } from '../App';
import { useSubscriptionAccess } from '../components/SubscriptionGate';
import { useTranslation } from 'react-i18next';
import { 
  GraduationCap,
  Clock,
  BookOpen,
  Award,
  ChevronRight,
  CheckCircle,
  Crown
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

export default function AcademyPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  useSubscriptionAccess();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lang = i18n.language?.split('-')[0] || 'en';
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API}/courses?lang=${lang}`);
        setCourses(response.data);
      } catch (e) {
        console.error('Failed to fetch courses', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [i18n.language]);

  const getLevelStyles = (level) => {
    const styles = {
      1: {
        // Bronze
        gradient: "from-amber-800/25 to-orange-900/25",
        border: "border-amber-700/40 hover:border-amber-600/60",
        icon: "bg-amber-700/15 text-amber-600",
        badge: "bg-amber-800/20 text-amber-500 border-amber-700/30"
      },
      2: {
        // Silver
        gradient: "from-slate-400/20 to-zinc-500/20",
        border: "border-slate-400/40 hover:border-slate-300/60",
        icon: "bg-slate-400/15 text-slate-300",
        badge: "bg-slate-400/15 text-slate-300 border-slate-400/30"
      },
      3: {
        // Gold
        gradient: "from-yellow-400/20 to-amber-300/20",
        border: "border-yellow-400/40 hover:border-yellow-300/60",
        icon: "bg-yellow-400/15 text-yellow-300",
        badge: "bg-yellow-400/15 text-yellow-300 border-yellow-400/30"
      }
    };
    return styles[level] || styles[1];
  };

  const getCourseProgress = (course) => {
    if (!user) return 0;
    const completedInCourse = user.completed_lessons?.filter(l => l.startsWith(course.id)).length || 0;
    return Math.round((completedInCourse / course.lessons_count) * 100);
  };

  const certifications = [
    { level: 1, name: "Certified Crypto Foundations", color: "blue" },
    { level: 2, name: "Certified Crypto Investor", color: "purple" },
    { level: 3, name: "Advanced Crypto Strategist", color: "amber" }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 hero-glow opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-primary text-sm font-medium uppercase tracking-wider">{t('academy.heroTag')}</span>
            <h1 className="font-heading text-5xl md:text-6xl font-bold mt-4 mb-6">
              {t('academy.heroTitle1')} <span className="text-gradient">{t('academy.heroTitleHighlight')}</span>
            </h1>
            <p className="text-lg text-slate-300">
              {t('academy.heroSubtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trial Courses Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="w-6 h-6 text-primary" />
            <h2 className="font-heading text-2xl font-bold">{t('academy.freeCourses')}</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
              {t('academy.freeForEveryone')}
            </span>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <Card key={i} className="bg-card border-border animate-pulse">
                  <CardContent className="p-8">
                    <div className="h-8 bg-muted rounded w-1/3 mb-4" />
                    <div className="h-6 bg-muted rounded w-2/3 mb-2" />
                    <div className="h-4 bg-muted rounded w-full mb-4" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses.filter(c => c.is_trial).map((course, index) => {
                const styles = getLevelStyles(course.level);
                const progress = getCourseProgress(course);

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`bg-gradient-to-br ${styles.gradient} border ${styles.border} h-full transition-all group relative overflow-hidden`}>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles.badge}`}>
                            {t('academy.level')} {course.level}
                          </span>
                          <div className={`w-10 h-10 rounded-lg ${styles.icon} flex items-center justify-center`}>
                            <GraduationCap className="w-5 h-5" />
                          </div>
                        </div>
                        <CardTitle className="font-heading text-2xl">{course.title}</CardTitle>
                        <CardDescription className="text-slate-400">
                          {course.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-6 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              <span>{course.lessons_count} {t('academy.lessons')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{course.duration_hours}h</span>
                            </div>
                          </div>
                          {user && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">{t('academy.progress')}</span>
                                <span className="text-primary font-medium">{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {course.topics?.slice(0, 4).map(topic => (
                              <span key={topic} className="px-2 py-1 text-xs bg-muted rounded-md text-slate-400">
                                {topic}
                              </span>
                            ))}
                          </div>
                          <Link to={`/course/${course.id}`} className="block pt-4">
                            <Button className="w-full bg-slate-800 hover:bg-slate-700 group-hover:bg-primary group-hover:text-white transition-colors">
                              {progress > 0 ? t('academy.continueLearning') : t('academy.startCourse')}
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Premium Courses Section */}
      {!loading && courses.some(c => !c.is_trial) && (
        <section className="py-16 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <Crown className="w-6 h-6 text-amber-400" />
              <h2 className="font-heading text-2xl font-bold">{t('academy.premiumCourses')}</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {t('academy.expertCurated')}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses.filter(c => !c.is_trial).map((course, index) => {
                const progress = getCourseProgress(course);
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className="border h-full transition-all group relative overflow-hidden"
                      style={{
                        background: `linear-gradient(to bottom right, ${course.color_from || '#1e3a5f'}33, ${course.color_to || '#0f2027'}33)`,
                        borderColor: `${course.color_from || '#f59e0b'}55`,
                      }}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20 flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Premium
                          </span>
                          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                        </div>
                        <CardTitle className="font-heading text-2xl">{course.title}</CardTitle>
                        <CardDescription className="text-slate-400">
                          {course.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center gap-6 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              <span>{course.lessons_count} {t('academy.lessons')}</span>
                            </div>
                            {course.duration_hours > 0 && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{course.duration_hours}h</span>
                              </div>
                            )}
                          </div>
                          {user && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-400">{t('academy.progress')}</span>
                                <span className="text-amber-400 font-medium">{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {course.topics?.slice(0, 4).map(topic => (
                              <span key={topic} className="px-2 py-1 text-xs bg-muted rounded-md text-slate-400">
                                {topic}
                              </span>
                            ))}
                          </div>
                          <Link to={`/course/${course.id}`} className="block pt-4">
                            <Button className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 group-hover:bg-amber-500 group-hover:text-white transition-colors border border-amber-500/30">
                              {progress > 0 ? t('academy.continueLearning') : t('academy.startCourse')}
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Certification Section */}
      <section className="py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              {t('academy.certTitle')}
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t('academy.certSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {certifications.map((cert, index) => (
              <motion.div
                key={cert.level}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border-border text-center h-full">
                  <CardContent className="p-8">
                    <div className={`w-20 h-20 rounded-full bg-${cert.color}-500/10 flex items-center justify-center mx-auto mb-6`}>
                      <Award className={`w-10 h-10 text-${cert.color}-500`} />
                    </div>
                    <h3 className="font-heading font-bold text-xl mb-2">{cert.name}</h3>
                    <p className="text-slate-400 text-sm mb-6">
                      {t('academy.certExamRequired', { level: cert.level })}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{t('academy.pdfDownload')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{t('academy.qrVerification')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{t('academy.shareable')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              {t('academy.howItWorksTitle')}
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-6"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">{step}</span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg">{t(`academy.step${step}Title`)}</h3>
                  <p className="text-slate-400">{t(`academy.step${step}Desc`)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-8"
            >
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
                {t('academy.ctaTitle')}
              </h2>
              <p className="text-slate-400 mb-6">
                {t('academy.ctaSubtitle')}
              </p>
              <Link to="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
                  {t('academy.getStartedFree')}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
}
