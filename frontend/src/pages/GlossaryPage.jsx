import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API } from '../App';
import { useTranslation } from 'react-i18next';
import {
  Search,
  BookOpen,
  Filter
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function GlossaryPage() {
  const { t } = useTranslation();
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchGlossary = async () => {
      try {
        const response = await axios.get(`${API}/glossary`);
        setTerms(response.data);
      } catch (e) {
        console.error('Failed to fetch glossary', e);
      } finally {
        setLoading(false);
      }
    };
    fetchGlossary();
  }, []);

  const categories = ['All', ...new Set(terms.map(t => t.category))];

  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedTerms = filteredTerms.reduce((acc, term) => {
    const firstLetter = term.term[0].toUpperCase();
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(term);
    return acc;
  }, {});

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            {t('glossary.title')}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t('glossary.subtitle')}
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder={t('glossary.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card border-border"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400" />
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-muted text-slate-400 hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Terms */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i} className="bg-card border-border animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTerms.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold mb-2">{t('glossary.noResultsTitle')}</h3>
              <p className="text-slate-400">{t('glossary.noResultsDesc')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedTerms).sort().map(letter => (
              <motion.div
                key={letter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                    <span className="font-heading font-bold text-xl text-white">{letter}</span>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="space-y-3">
                  {groupedTerms[letter].map((term, index) => (
                    <motion.div
                      key={term.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-heading font-bold text-lg mb-2 text-white">
                                {term.term}
                              </h3>
                              <p className="text-slate-400 leading-relaxed">
                                {term.definition}
                              </p>
                            </div>
                            <Badge variant="outline" className="border-slate-700 text-slate-400 flex-shrink-0">
                              {term.category}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-slate-500 text-sm"
        >
          {t('glossary.termCount', { count: terms.length })}
        </motion.div>
      </div>
    </Layout>
  );
}
