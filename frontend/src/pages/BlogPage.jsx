import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API } from '../App';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  User,
  ChevronRight,
  Search,
  Tag
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function BlogPage() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${API}/blog`);
        setPosts(response.data);
      } catch (e) {
        console.error('Failed to fetch blog posts', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const categories = ['All', ...new Set(posts.map(p => p.category))];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mb-12"
        >
          <span className="text-primary text-sm font-medium uppercase tracking-wider">{t('blog.tag')}</span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mt-4 mb-6">
            {t('blog.title')} <span className="text-gradient">{t('blog.titleHighlight')}</span>
          </h1>
          <p className="text-slate-400 text-lg">
            {t('blog.subtitle')}
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder={t('blog.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card border-border"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-card border border-border text-slate-400 hover:border-slate-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="bg-card border-border animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="font-heading text-xl font-bold mb-2">{t('blog.noResultsTitle')}</h3>
              <p className="text-slate-400">{t('blog.noResultsDesc')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/blog/${post.slug}`}>
                  <Card className="bg-card border-border hover:border-primary/50 transition-all h-full group overflow-hidden">
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={post.thumbnail} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {post.category}
                        </Badge>
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {t('blog.minRead', { n: post.read_time })}
                        </span>
                      </div>
                      
                      <h2 className="font-heading font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm text-slate-400">{post.author}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tags */}
        {posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16"
          >
            <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              {t('blog.popularTags')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {[...new Set(posts.flatMap(p => p.tags))].map(tag => (
                <span 
                  key={tag}
                  className="px-3 py-1 bg-muted rounded-full text-sm text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
