import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Award,
  TrendingUp,
  Users,
  BookOpen,
  Target,
  Lightbulb,
  Globe,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export default function AboutPage() {
  const { t } = useTranslation();

  const expertise = [
    t('about.exp1'), t('about.exp2'), t('about.exp3'),
    t('about.exp4'), t('about.exp5'), t('about.exp6')
  ];

  const principles = [
    { title: t('about.principleTitle1'), description: t('about.principleDesc1') },
    { title: t('about.principleTitle2'), description: t('about.principleDesc2') },
    { title: t('about.principleTitle3'), description: t('about.principleDesc3') }
  ];

  const faqs = [
    { question: t('about.faqQ1'), answer: t('about.faqA1') },
    { question: t('about.faqQ2'), answer: t('about.faqA2') },
    { question: t('about.faqQ3'), answer: t('about.faqA3') },
    { question: t('about.faqQ4'), answer: t('about.faqA4') }
  ];

  // JSON-LD Schema for SEO
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Mehdi Arbi",
    "jobTitle": "Entrepreneur and Cryptocurrency Educator",
    "url": "https://thecryptocoach.io",
    "sameAs": [
      "https://thecryptocoach.io"
    ],
    "description": "Mehdi Arbi is an entrepreneur and cryptocurrency educator and founder of TheCryptoCoach.io."
  };

  return (
    <Layout>
      <Helmet>
        <title>About Mehdi Arbi - Crypto Educator & Founder | TheCryptoCoach.io</title>
        <meta name="description" content="Learn about Mehdi Arbi, entrepreneur, cryptocurrency educator, and founder of TheCryptoCoach.io. Discover his mission to make crypto education accessible." />
        <script type="application/ld+json">
          {JSON.stringify(personSchema)}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 hero-glow opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-5xl md:text-6xl font-bold mt-4 mb-6">
              <span className="text-gradient">Mehdi Arbi</span>
            </h1>
            <p className="text-xl text-slate-300 mb-4">
              {t('about.heroSubtitle')}
            </p>
            <p className="text-lg text-slate-400">
              {t('about.heroBio')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-heading text-4xl font-bold mb-6">
                {t('about.aboutHeading')} <span className="text-primary">Mehdi Arbi</span>
              </h2>

              <div className="space-y-4 text-slate-300">
                <p>{t('about.aboutP1')}</p>
                <p>{t('about.aboutP2')}</p>
                <p>{t('about.aboutP3')}</p>
                <p>{t('about.aboutP4')}</p>
              </div>

              <div className="mt-8">
                <h3 className="font-heading font-semibold text-lg mb-4">{t('about.areasOfFocus')}</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    t('about.focusArea1'), t('about.focusArea2'), t('about.focusArea3'),
                    t('about.focusArea4'), t('about.focusArea5')
                  ].map((area) => (
                    <span key={area} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="w-full aspect-square max-w-md mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Globe className="w-24 h-24 text-primary mx-auto mb-6" />
                    <h3 className="font-heading text-2xl font-bold mb-2">{t('about.globalImpact')}</h3>
                    <p className="text-slate-400">{t('about.globalImpactDesc')}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TheCryptoCoach.io Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-4xl font-bold mb-4">
              <span className="text-primary">TheCryptoCoach.io</span>
            </h2>
            <p className="text-slate-400 text-lg">
              {t('about.platformDesc')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <BookOpen className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">{t('about.card1Title')}</h3>
                <p className="text-slate-400 text-sm">
                  {t('about.card1Desc')}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <Target className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">{t('about.card2Title')}</h3>
                <p className="text-slate-400 text-sm">
                  {t('about.card2Desc')}
                </p>
              </CardContent>
            </Card>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <h3 className="font-heading text-xl font-semibold mb-4 text-center">{t('about.keyTopicsHeading')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                t('about.topic1'), t('about.topic2'), t('about.topic3'),
                t('about.topic4'), t('about.topic5'), t('about.topic6')
              ].map((topic, index) => (
                <div key={index} className="flex items-center gap-2 text-slate-300">
                  <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{topic}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Educational Philosophy */}
      <section className="py-24 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-4xl font-bold mb-4">
              {t('about.philosophyHeading')} <span className="text-primary">{t('about.philosophyHeadingHighlight')}</span>
            </h2>
            <p className="text-slate-400 text-lg">
              {t('about.philosophySubtitle')}
            </p>
          </motion.div>

          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <p className="text-slate-300 text-center mb-8">
              {t('about.philosophyRequires')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[t('about.req1'), t('about.req2'), t('about.req3')].map((item) => (
                <span key={item} className="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {principles.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border-border h-full">
                  <CardContent className="p-6 text-center">
                    <Lightbulb className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h3 className="font-heading font-bold text-lg mb-2">{principle.title}</h3>
                    <p className="text-slate-400 text-sm">{principle.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Areas of Expertise */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-4xl font-bold mb-4">
              {t('about.expertiseHeading')} <span className="text-primary">{t('about.expertiseHeadingHighlight')}</span>
            </h2>
            <p className="text-slate-400">
              {t('about.expertiseSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {expertise.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg"
              >
                <Award className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-slate-300">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Mission */}
      <section className="py-24 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-4xl font-bold mb-6">
              {t('about.missionHeading')} <span className="text-primary">{t('about.missionHeadingHighlight')}</span>
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              {t('about.missionDesc')}
            </p>

            <div className="bg-card border border-border rounded-xl p-8">
              <h3 className="font-heading font-semibold mb-4">{t('about.missionSubheading')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {[
                  t('about.missionItem1'), t('about.missionItem2'),
                  t('about.missionItem3'), t('about.missionItem4')
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-slate-300">
                    <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-4xl font-bold mb-4">
              {t('about.faqHeading')} <span className="text-primary">{t('about.faqHeadingHighlight')}</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <h3 className="font-heading font-semibold text-lg mb-2">{faq.question}</h3>
                    <p className="text-slate-400">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learn More CTA */}
      <section className="py-24 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-4xl font-bold mb-6">
              {t('about.learnMoreHeading')} <span className="text-primary">{t('about.learnMoreHeadingHighlight')}</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              {t('about.learnMoreDesc')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link to="/academy" className="block">
                <Card className="bg-card border-border hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-6 text-center">
                    <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-heading font-semibold">{t('about.link1Title')}</h3>
                    <p className="text-slate-400 text-sm mt-2">{t('about.link1Desc')}</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/glossary" className="block">
                <Card className="bg-card border-border hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-6 text-center">
                    <Target className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-heading font-semibold">{t('about.link2Title')}</h3>
                    <p className="text-slate-400 text-sm mt-2">{t('about.link2Desc')}</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/blog" className="block">
                <Card className="bg-card border-border hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-heading font-semibold">{t('about.link3Title')}</h3>
                    <p className="text-slate-400 text-sm mt-2">{t('about.link3Desc')}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/academy">
                <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
                  {t('about.startLearning')}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="border-slate-700 px-8">
                  {t('about.getInTouch')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
