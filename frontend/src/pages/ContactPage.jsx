import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API } from '../App';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  MessageSquare,
  Send,
  Clock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

export default function ContactPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API}/contact`, formData);
      toast.success(t('contact.toastSent'));
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (e) {
      toast.error(t('contact.toastError'));
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: t('contact.emailTitle'),
      value: "support@thecryptocoach.io",
      description: t('contact.emailDesc')
    },
    {
      icon: MessageSquare,
      title: t('contact.supportTitle'),
      value: "help@thecryptocoach.io",
      description: t('contact.supportDesc')
    },
    {
      icon: Clock,
      title: t('contact.responseTimeTitle'),
      value: t('contact.responseTimeValue'),
      description: t('contact.responseTimeDesc')
    }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {contactInfo.map((item) => (
              <Card key={item.title} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-primary">{item.value}</p>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* FAQ Link */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">{t('contact.faqTitle')}</h3>
                <p className="text-sm text-slate-400 mb-4">
                  {t('contact.faqDesc')}
                </p>
                <Button variant="outline" className="border-primary text-primary" asChild>
                  <a href="/mentor">{t('contact.askAI')}</a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>{t('contact.sendMessage')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('contact.yourName')}</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-muted border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('contact.emailAddress')}</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-muted border-border"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('contact.subject')}</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder={t('contact.subjectPlaceholder')}
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="bg-muted border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('contact.message')}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder={t('contact.messagePlaceholder')}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="bg-muted border-border resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={submitting}
                  >
                    {submitting ? t('contact.sending') : t('contact.sendBtn')}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
