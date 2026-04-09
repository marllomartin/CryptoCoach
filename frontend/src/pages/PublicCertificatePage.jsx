import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { API } from '../App';
import { useTranslation } from 'react-i18next';
import {
  Award, CheckCircle, Calendar, Download,
  Link2, Linkedin, AlertCircle, ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import Layout from '../components/Layout';

export default function PublicCertificatePage() {
  const { certId } = useParams();
  const { t, i18n } = useTranslation();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/certificates/verify/${certId}`);
        if (res.data.valid) {
          setCert(res.data.certificate);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [certId]);

  const pageUrl = `https://thecryptocoach.io/certificate/${certId}`;
  const ogTitle = cert
    ? `${cert.user_name} — ${cert.cert_name} | TheCryptoCoach`
    : 'Certificate | TheCryptoCoach';
  const ogDescription = cert
    ? `${cert.user_name} has earned the ${cert.cert_name} certificate with a score of ${cert.score}% on TheCryptoCoach.`
    : 'Verified certificate from TheCryptoCoach.';

  const formattedDate = cert
    ? new Date(cert.issued_at).toLocaleDateString(i18n.language, {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    toast.success(t('certificates.public.linkCopied'));
  };

  const handleLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async () => {
    setDownloading(true);
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
    } catch {
      toast.error(t('certificates.toastError'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:site_name" content="TheCryptoCoach" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <link rel="canonical" href={pageUrl} />
      </Helmet>

      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
          <div className="max-w-3xl mx-auto">

            {loading && (
              <div className="flex items-center justify-center py-32">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {notFound && !loading && (
              <div className="text-center py-32">
                <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">{t('certificates.public.notFound')}</h1>
                <p className="text-gray-400 mb-8">{t('certificates.public.notFoundDesc')}</p>
                <Link to="/">
                  <Button variant="outline">{t('certificates.public.goHome')}</Button>
                </Link>
              </div>
            )}

            {cert && !loading && (
              <>
                {/* Certificate Visual */}
                <div className="relative rounded-2xl overflow-hidden border border-primary/30 bg-gradient-to-br from-gray-900 to-gray-950 shadow-[0_0_60px_rgba(37,99,235,0.15)] mb-8">
                  {/* Top accent bar */}
                  <div className="h-2 bg-gradient-to-r from-primary via-blue-400 to-primary" />

                  <div className="p-10 md:p-14 text-center">
                    {/* Platform brand */}
                    <p className="text-primary font-semibold tracking-widest text-sm uppercase mb-8">
                      TheCryptoCoach.io
                    </p>

                    {/* Award icon */}
                    <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-8">
                      <Award className="w-10 h-10 text-primary" />
                    </div>

                    {/* Title */}
                    <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">
                      {t('certificates.public.certOfCompletion')}
                    </p>

                    {/* Course name */}
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                      {cert.cert_name}
                    </h1>

                    {/* Awarded to */}
                    <p className="text-gray-400 text-sm mb-2">{t('certificates.public.awardedTo')}</p>
                    <p className="text-2xl md:text-3xl font-bold text-primary mb-10">
                      {cert.user_name}
                    </p>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-10">
                      <div className="flex-1 h-px bg-gray-800" />
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div className="flex-1 h-px bg-gray-800" />
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400 mb-2">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {t('certificates.issued')} {formattedDate}
                      </span>
                      <span>{t('certificates.score')} <span className="text-white font-semibold">{cert.score}%</span></span>
                      <span className="font-mono text-xs text-gray-500">
                        ID: {cert.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Bottom accent bar */}
                  <div className="h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                </div>

                {/* Verified badge */}
                <div className="flex items-center justify-center gap-2 text-green-400 text-sm mb-8">
                  <CheckCircle className="w-4 h-4" />
                  <span>{t('certificates.public.verified')}</span>
                  <span className="text-gray-600">•</span>
                  <Link
                    to={`/verify/${certId}`}
                    className="text-primary hover:underline text-sm flex items-center gap-1"
                  >
                    {t('certificates.public.verifyLink')}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                  <Button
                    onClick={handleLinkedIn}
                    className="bg-[#0A66C2] hover:bg-[#004182] text-white gap-2"
                  >
                    <Linkedin className="w-4 h-4" />
                    {t('certificates.public.shareLinkedIn')}
                  </Button>

                  <Button variant="outline" onClick={handleCopyLink} className="gap-2 border-gray-700">
                    <Link2 className="w-4 h-4" />
                    {t('certificates.public.copyLink')}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={downloading}
                    className="gap-2 border-gray-700"
                  >
                    <Download className="w-4 h-4" />
                    {downloading ? t('certificates.downloading') : t('certificates.downloadPdf')}
                  </Button>
                </div>

                {/* Platform CTA */}
                <div className="text-center p-6 bg-gray-900/60 border border-gray-800 rounded-xl">
                  <p className="text-gray-400 text-sm mb-3">{t('certificates.public.ctaText')}</p>
                  <Link to="/academy">
                    <Button size="sm" className="gap-2">
                      {t('certificates.public.ctaButton')}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
