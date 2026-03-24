import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API } from '../App';
import { 
  Clock,
  User,
  ChevronLeft,
  Calendar,
  Tag,
  Share2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${API}/blog/${slug}`);
        setPost(response.data);
      } catch (e) {
        console.error('Failed to fetch post', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-primary text-xl">Loading article...</div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article not found</h1>
            <Link to="/blog">
              <Button>Back to Blog</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const formattedDate = new Date(post.published_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Layout>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/blog" className="text-slate-400 hover:text-primary text-sm inline-flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Insights
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="border-primary/30 text-primary">
              {post.category}
            </Badge>
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.read_time} min read
            </span>
          </div>

          <h1 className="font-heading text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-slate-400 mb-6">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-medium">{post.author}</div>
                <div className="text-sm text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formattedDate}
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-slate-700" onClick={sharePost}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </motion.header>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <img 
            src={post.thumbnail} 
            alt={post.title}
            className="w-full h-auto rounded-2xl"
          />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert max-w-none mb-12"
        >
          <div 
            className="text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: post.content
                .replace(/^# /gm, '<h1 class="font-heading text-3xl font-bold text-white mt-10 mb-6">')
                .replace(/^## /gm, '<h2 class="font-heading text-2xl font-bold text-white mt-8 mb-4">')
                .replace(/^### /gm, '<h3 class="font-heading text-xl font-semibold text-white mt-6 mb-3">')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                .replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-0.5 rounded text-primary text-sm">$1</code>')
                .replace(/^- /gm, '<li class="ml-4 mb-2">')
                .replace(/^\d+\. /gm, '<li class="ml-4 mb-2">')
                .split('\n').join('<br />')
            }}
          />
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 flex-wrap pb-8 border-b border-border"
        >
          <Tag className="w-4 h-4 text-slate-500" />
          {post.tags.map(tag => (
            <span 
              key={tag}
              className="px-3 py-1 bg-muted rounded-full text-sm text-slate-400"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <h3 className="font-heading text-2xl font-bold mb-4">
            Want to learn more?
          </h3>
          <p className="text-slate-400 mb-6">
            Start your crypto education journey with our structured courses
          </p>
          <Link to="/academy">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Explore Academy
            </Button>
          </Link>
        </motion.div>
      </article>
    </Layout>
  );
}
