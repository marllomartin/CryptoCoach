import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API } from '../App';
import {
  GraduationCap,
  TrendingUp,
  Shield,
  Award,
  Bot,
  BookOpen,
  ChevronRight,
  Play
} from 'lucide-react';
import founderImg from '../assets/founder.jpeg';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { NewsletterSignup } from '../components/NewsletterSignup';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const [totalLessons, setTotalLessons] = useState(null);
  const [totalCourses, setTotalCourses] = useState(null);

  useEffect(() => {
    axios.get(`${API}/courses`).then(res => {
      const courses = res.data;
      setTotalCourses(courses.length);
      setTotalLessons(courses.reduce((sum, c) => sum + (c.lessons_count || 0), 0));
    }).catch(() => {});
  }, []);
  
  const features = [
    {
      icon: GraduationCap,
      title: t('homepage.features.academy'),
      description: t('homepage.features.academyDesc')
    },
    {
      icon: Award,
      title: t('homepage.features.certifications'),
      description: t('homepage.features.certificationsDesc')
    },
    {
      icon: Bot,
      title: t('homepage.features.aiMentor'),
      description: t('homepage.features.aiMentorDesc')
    },
    {
      icon: TrendingUp,
      title: t('homepage.features.simulator'),
      description: t('homepage.features.simulatorDesc')
    },
    {
      icon: Shield,
      title: t('homepage.features.security'),
      description: t('homepage.features.securityDesc')
    },
    {
      icon: BookOpen,
      title: t('homepage.features.knowledge'),
      description: t('homepage.features.knowledgeDesc')
    }
  ];

  const courses = [
    {
      level: 1,
      title: t('homepage.courses.level1'),
      description: t('homepage.courses.level1Desc'),
      lessons: 8,
      tier: t('homepage.courses.free'),
      color: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/30"
    },
    {
      level: 2,
      title: t('homepage.courses.level2'),
      description: t('homepage.courses.level2Desc'),
      lessons: 8,
      tier: t('homepage.courses.starter'),
      color: "from-purple-500/20 to-pink-500/20",
      border: "border-purple-500/30"
    },
    {
      level: 3,
      title: t('homepage.courses.level3'),
      description: t('homepage.courses.level3Desc'),
      lessons: 7,
      tier: t('homepage.courses.pro'),
      color: "from-amber-500/20 to-orange-500/20",
      border: "border-amber-500/30"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: t('homepage.testimonials.role1'),
      content: t('homepage.testimonials.content1'),
      avatar: "SC"
    },
    {
      name: "Marcus Johnson",
      role: t('homepage.testimonials.role2'),
      content: t('homepage.testimonials.content2'),
      avatar: "MJ"
    },
    {
      name: "Elena Rodriguez",
      role: t('homepage.testimonials.role3'),
      content: t('homepage.testimonials.content3'),
      avatar: "ER"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 hero-glow" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div 
            className="max-w-4xl"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.h1 
              variants={fadeInUp}
              className="font-heading text-5xl md:text-7xl font-bold tracking-tight mb-6"
            >
              {t('homepage.heroTitle1')} <span className="text-gradient">{t('homepage.heroTitleHighlight')}</span>{t('homepage.heroTitle2')}
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl"
            >
              {t('homepage.heroSubtitle')}
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)]"
                  data-testid="hero-get-started-btn"
                >
                  {t('homepage.startLearning')}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/academy">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-slate-700 hover:border-slate-600 px-8 py-6 text-lg"
                  data-testid="hero-explore-btn"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {t('homepage.exploreCourses')}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="mt-12 flex flex-wrap items-center gap-4 md:gap-8 text-sm text-slate-400"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span>{totalLessons !== null ? `${totalLessons} ` : ''}{t('homepage.stats.lessonsLabel')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <span>{totalCourses !== null ? `${totalCourses} ` : ''}{t('homepage.stats.certificationsLabel')}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              {t('homepage.featuresTitle')} <span className="text-primary">{t('homepage.featuresTitleHighlight')}</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t('homepage.featuresSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border-border hover:border-primary/50 transition-colors h-full group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              {t('homepage.coursesTitle')} <span className="text-primary">{t('homepage.coursesTitleHighlight')}</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t('homepage.coursesSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course.level}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className={`bg-gradient-to-br ${course.color} border ${course.border} h-full hover:scale-[1.02] transition-transform`}>
                  <CardContent className="p-8">
                    <div className="text-5xl font-heading font-bold text-white/20 mb-4">
                      0{course.level}
                    </div>
                    <h3 className="font-heading font-bold text-2xl mb-3">{course.title}</h3>
                    <p className="text-slate-300 mb-6">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">{course.lessons} {t('homepage.lessons')}</span>
                      <Link to={`/course/course-${course.level === 1 ? 'foundations' : course.level === 2 ? 'investor' : 'strategist'}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                          {t('homepage.viewCourse')}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative pb-8">
                <div className="w-full aspect-square max-w-[260px] mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 p-1">
                  <img 
                    src={founderImg} 
                    alt="Mehdi Arbi - Founder"
                    className="w-full h-full object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <div className="absolute -bottom-6 right-0 sm:-right-6 bg-card border border-border rounded-xl p-4 shadow-xl">
                  <div className="text-3xl font-heading font-bold text-primary">10+</div>
                  <div className="text-sm text-slate-400">{t('homepage.founder.yearsInCrypto')}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">{t('homepage.founder.meetInstructor')}</span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold mt-2 mb-6">
                Mehdi Arbi
              </h2>
              <p className="text-slate-300 text-lg mb-6">
                {t('homepage.founder.description1')}
              </p>
              <p className="text-slate-400 mb-8">
                {t('homepage.founder.description2')}
              </p>
              <Link to="/about">
                <Button variant="outline" className="border-slate-700">
                  {t('homepage.founder.learnMore')}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              {t('homepage.testimonialsTitle')} <span className="text-primary">{t('homepage.testimonialsTitleHighlight')}</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {t('homepage.testimonialsSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border-border h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-slate-400">{testimonial.role}</div>
                      </div>
                    </div>
                    <p className="text-slate-300 italic">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
              {t('homepage.ctaTitle')} <span className="text-primary">{t('homepage.ctaTitleHighlight')}</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              {t('homepage.ctaSubtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 px-8 py-6 text-lg shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                  data-testid="cta-get-started-btn"
                >
                  {t('homepage.createAccount')}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="border-slate-700 px-8 py-6 text-lg">
                  {t('homepage.contactUs')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <NewsletterSignup language={i18n.language} />
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
