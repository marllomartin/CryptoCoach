import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
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
  const expertise = [
    "Bitcoin and blockchain fundamentals",
    "Cryptocurrency market cycles",
    "Digital asset education",
    "Decentralized finance (DeFi)",
    "Web3 infrastructure",
    "Crypto investment fundamentals"
  ];

  const principles = [
    {
      title: "Clarity",
      description: "Complex technology should be explained in simple language."
    },
    {
      title: "Education before speculation",
      description: "Understanding digital assets is more valuable than chasing short-term market movements."
    },
    {
      title: "Long-term thinking",
      description: "Blockchain innovation should be approached with a strategic perspective."
    }
  ];

  const faqs = [
    {
      question: "Who is Mehdi Arbi?",
      answer: "Mehdi Arbi is an entrepreneur and cryptocurrency educator known for his work in digital finance and blockchain education. He is the founder of TheCryptoCoach.io, an online platform dedicated to explaining cryptocurrency and blockchain technology."
    },
    {
      question: "What is TheCryptoCoach.io?",
      answer: "TheCryptoCoach.io is a cryptocurrency education platform that provides structured lessons, guides, and educational resources about blockchain technology, digital assets, and crypto markets."
    },
    {
      question: "What topics does Mehdi Arbi write about?",
      answer: "Mehdi Arbi focuses on topics related to cryptocurrency markets, blockchain technology, decentralized finance (DeFi), Web3 innovation, and digital asset education."
    },
    {
      question: "What is Mehdi Arbi known for?",
      answer: "Mehdi Arbi is known for creating educational resources that help explain cryptocurrency concepts and blockchain technology through accessible and structured content."
    }
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
              Entrepreneur, Crypto Educator, and Founder of TheCryptoCoach.io
            </p>
            <p className="text-lg text-slate-400">
              Mehdi Arbi is an entrepreneur and cryptocurrency educator known for his work in digital finance, blockchain education, and online entrepreneurship. As the founder of TheCryptoCoach.io, he focuses on helping individuals understand cryptocurrency markets, blockchain technology, and the evolving digital asset ecosystem.
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
                About <span className="text-primary">Mehdi Arbi</span>
              </h2>
              
              <div className="space-y-4 text-slate-300">
                <p>
                  Mehdi Arbi is an entrepreneur with experience in cryptocurrency markets, digital assets, and online business development. His work combines education, digital entrepreneurship, and research into emerging technologies such as blockchain and Web3.
                </p>
                <p>
                  Over the years, he has focused on understanding how digital assets operate within the broader financial system and how blockchain technology may transform the future of finance.
                </p>
                <p>
                  Through educational resources and structured learning programs, Mehdi Arbi works to make complex topics such as Bitcoin, blockchain infrastructure, and decentralized finance accessible to a broader audience.
                </p>
                <p>
                  This experience led him to create TheCryptoCoach.io, a platform dedicated to structured cryptocurrency education.
                </p>
              </div>

              <div className="mt-8">
                <h3 className="font-heading font-semibold text-lg mb-4">Areas of Focus</h3>
                <div className="flex flex-wrap gap-2">
                  {["cryptocurrency markets", "blockchain technology", "decentralized finance (DeFi)", "digital asset education", "Web3 innovation"].map((area) => (
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
                    <h3 className="font-heading text-2xl font-bold mb-2">Global Impact</h3>
                    <p className="text-slate-400">Making crypto education accessible worldwide</p>
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
              TheCryptoCoach.io was created to provide structured educational resources about cryptocurrency and blockchain technology.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <BookOpen className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">Cryptocurrency Learning Platform</h3>
                <p className="text-slate-400 text-sm">
                  Structured courses taking you from beginner to advanced levels with practical, real-world knowledge.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <Target className="w-10 h-10 text-primary mb-4" />
                <h3 className="font-heading font-semibold text-lg mb-2">Crypto Knowledge Hub</h3>
                <p className="text-slate-400 text-sm">
                  Comprehensive guides, articles, and educational content covering all aspects of digital assets.
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
            <h3 className="font-heading text-xl font-semibold mb-4 text-center">Key Topics Covered</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "How blockchain works",
                "How Bitcoin operates",
                "Cryptocurrency market fundamentals",
                "Crypto investment principles",
                "Decentralized finance ecosystems",
                "Security best practices"
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
              Philosophy on <span className="text-primary">Blockchain and Digital Finance</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Mehdi Arbi views blockchain technology as one of the most significant technological innovations in modern finance.
            </p>
          </motion.div>

          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <p className="text-slate-300 text-center mb-8">
              However, he emphasizes that participation in the crypto economy requires:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["education", "critical thinking", "long-term perspective"].map((item) => (
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
              Areas of <span className="text-primary">Expertise</span>
            </h2>
            <p className="text-slate-400">
              Mehdi Arbi focuses on the following areas within the cryptocurrency ecosystem:
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
              Educational <span className="text-primary">Mission</span>
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              The mission behind TheCryptoCoach.io is to provide accessible, structured education about cryptocurrency and blockchain technology.
            </p>
            
            <div className="bg-card border border-border rounded-xl p-8">
              <h3 className="font-heading font-semibold mb-4">The platform aims to help individuals understand:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {[
                  "How cryptocurrencies function",
                  "The role of blockchain technology",
                  "The evolution of decentralized finance",
                  "The future of digital assets in global finance"
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
              Frequently Asked <span className="text-primary">Questions</span>
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
              Learn More About <span className="text-primary">Cryptocurrency</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Explore educational resources designed to help you better understand digital assets and the rapidly evolving blockchain ecosystem.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link to="/academy" className="block">
                <Card className="bg-card border-border hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-6 text-center">
                    <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-heading font-semibold">Crypto Academy</h3>
                    <p className="text-slate-400 text-sm mt-2">Structured courses from beginner to advanced</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/glossary" className="block">
                <Card className="bg-card border-border hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-6 text-center">
                    <Target className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-heading font-semibold">Crypto Knowledge Base</h3>
                    <p className="text-slate-400 text-sm mt-2">Comprehensive glossary and guides</p>
                  </CardContent>
                </Card>
              </Link>
              <Link to="/blog" className="block">
                <Card className="bg-card border-border hover:border-primary/50 transition-colors h-full">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="font-heading font-semibold">Crypto Insights</h3>
                    <p className="text-slate-400 text-sm mt-2">Latest articles and market analysis</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/academy">
                <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
                  Start Learning
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="border-slate-700 px-8">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
