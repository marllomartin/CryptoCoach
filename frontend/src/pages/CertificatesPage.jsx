import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API, useAuth } from '../App';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  Award,
  Download,
  Calendar,
  CheckCircle,
  Search
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';

export default function CertificatesPage() {
  const { token } = useAuth();
  const { t, i18n } = useTranslation();
  const [certificates, setCertificates] = useState([]);
  const [coursesByLevel, setCoursesByLevel] = useState({});
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lang = i18n.language?.split('-')[0] || 'en';
        const [certsRes, coursesRes] = await Promise.all([
          axios.get(`${API}/certificates`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API}/courses?lang=${lang}`)
        ]);
        setCertificates(certsRes.data);
        // Build level → course map for gradient lookups
        const map = {};
        for (const course of coursesRes.data) {
          if (course.level != null) map[course.level] = course;
        }
        setCoursesByLevel(map);
      } catch (e) {
        console.error('Failed to fetch certificates', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, i18n.language]);

  const downloadCertificate = async (certId) => {
    setDownloading(certId);
    try {
      const response = await axios.get(`${API}/certificates/${certId}/pdf`);
      const byteCharacters = atob(response.data.pdf_data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(t('certificates.toastDownloaded'));
    } catch (e) {
      toast.error(t('certificates.toastError'));
    } finally {
      setDownloading(null);
    }
  };

  // Derive gradient style from the course's admin-set colors, with level fallbacks
  const getGradientStyle = (cert) => {
    const course = coursesByLevel[cert.level];
    const from = course?.color_from;
    const to = course?.color_to;
    if (from && to) {
      return {
        background: `linear-gradient(to right, ${from}33, ${to}22)`,
        borderColor: `${from}55`,
      };
    }
    // Fallback palette
    const fallbacks = {
      1: { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', icon: 'text-blue-500' },
      2: { bg: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30', icon: 'text-purple-500' },
      3: { bg: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', icon: 'text-amber-500' },
    };
    return fallbacks[cert.level] || fallbacks[1];
  };

  const getIconColor = (cert) => {
    const course = coursesByLevel[cert.level];
    return course?.color_from || null;
  };

  const filteredCerts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return certificates;
    return certificates.filter(c => c.cert_name?.toLowerCase().includes(q));
  }, [certificates, search]);

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
            <Award className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            {t('certificates.title')}
          </h1>
          <p className="text-slate-400 text-lg">
            {t('certificates.subtitle')}
          </p>
        </motion.div>

        {/* Search */}
        {!loading && certificates.length > 0 && (
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('certificates.searchPlaceholder')}
              className="pl-9"
            />
          </div>
        )}

        {/* Certificates Grid */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map(i => (
              <Card key={i} className="bg-card border-border animate-pulse">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-muted rounded-xl" />
                    <div className="flex-1">
                      <div className="h-6 bg-muted rounded w-1/2 mb-2" />
                      <div className="h-4 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Award className="w-16 h-16 text-slate-500 mx-auto mb-6" />
              <h3 className="font-heading text-2xl font-bold mb-2">{t('certificates.noCertsTitle')}</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                {t('certificates.noCertsMessage')}
              </p>
              <Link to="/academy">
                <Button className="bg-primary hover:bg-primary/90">
                  {t('certificates.exploreCourses')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : filteredCerts.length === 0 ? (
          <p className="text-center text-slate-400 py-12">{t('certificates.noSearchResults')}</p>
        ) : (
          <div className="space-y-6">
            {filteredCerts.map((cert, index) => {
              const gradientStyle = getGradientStyle(cert);
              const iconColor = getIconColor(cert);
              const isTailwind = typeof gradientStyle === 'object' && 'bg' in gradientStyle;
              const formattedDate = new Date(cert.issued_at).toLocaleDateString(i18n.language, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              return (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {isTailwind ? (
                    <Card className={`bg-gradient-to-r ${gradientStyle.bg} border ${gradientStyle.border}`}>
                      <CardContent className="p-8">
                        <CertCardInner
                          cert={cert}
                          iconColorClass={gradientStyle.icon}
                          borderClass={gradientStyle.border}
                          formattedDate={formattedDate}
                          downloading={downloading}
                          onDownload={downloadCertificate}
                          t={t}
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <div
                      className="rounded-lg border p-8"
                      style={gradientStyle}
                    >
                      <CertCardInner
                        cert={cert}
                        iconColor={iconColor}
                        formattedDate={formattedDate}
                        downloading={downloading}
                        onDownload={downloadCertificate}
                        t={t}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Verification note */}
        {certificates.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 bg-muted/50 rounded-xl text-center"
          >
            <h3 className="font-semibold mb-2">{t('certificates.verificationTitle')}</h3>
            <p className="text-sm text-slate-400">
              {t('certificates.verificationMessage')}
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}

function CertCardInner({ cert, iconColorClass, iconColor, borderClass, formattedDate, downloading, onDownload, t }) {
  const iconStyle = iconColor ? { color: iconColor } : {};
  const iconClass = iconColorClass || 'text-primary';
  const borderStyle = iconColor ? { borderColor: `${iconColor}55` } : {};
  const borderCls = borderClass || 'border-border';

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
      {/* Icon */}
      <div
        className={`w-24 h-24 rounded-xl bg-card/50 border ${borderCls} flex items-center justify-center flex-shrink-0`}
        style={borderStyle}
      >
        <Award className={`w-12 h-12 ${iconClass}`} style={iconStyle} />
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-500 text-sm font-medium">{t('certificates.verified')}</span>
        </div>
        <h3 className="font-heading font-bold text-2xl mb-2">{cert.cert_name}</h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {t('certificates.issued')} {formattedDate}
          </span>
          <span>{t('certificates.score')} {cert.score}%</span>
          <span className="font-mono text-xs">ID: {cert.id.slice(0, 8).toUpperCase()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="border-slate-600"
          onClick={() => onDownload(cert.id)}
          disabled={downloading === cert.id}
        >
          <Download className="w-4 h-4 mr-2" />
          {downloading === cert.id ? t('certificates.downloading') : t('certificates.downloadPdf')}
        </Button>
      </div>
    </div>
  );
}
