import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API, useAuth } from '../App';
import { toast } from 'sonner';
import { 
  Award,
  Download,
  ExternalLink,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export default function CertificatesPage() {
  const { token } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get(`${API}/certificates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCertificates(response.data);
      } catch (e) {
        console.error('Failed to fetch certificates', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [token]);

  const downloadCertificate = async (certId) => {
    setDownloading(certId);
    try {
      const response = await axios.get(`${API}/certificates/${certId}/pdf`);
      
      // Create blob from base64
      const byteCharacters = atob(response.data.pdf_data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Certificate downloaded!');
    } catch (e) {
      toast.error('Failed to download certificate');
    } finally {
      setDownloading(null);
    }
  };

  const getCertColor = (level) => {
    const colors = {
      1: { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', icon: 'text-blue-500' },
      2: { bg: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30', icon: 'text-purple-500' },
      3: { bg: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', icon: 'text-amber-500' }
    };
    return colors[level] || colors[1];
  };

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
            Your <span className="text-primary">Certificates</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Download and share your verified achievements
          </p>
        </motion.div>

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
              <h3 className="font-heading text-2xl font-bold mb-2">No Certificates Yet</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Complete course exams with 80% or higher to earn your certificates. Start learning today!
              </p>
              <Link to="/academy">
                <Button className="bg-primary hover:bg-primary/90">
                  Explore Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {certificates.map((cert, index) => {
              const colors = getCertColor(cert.level);
              const formattedDate = new Date(cert.issued_at).toLocaleDateString('en-US', {
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
                  <Card className={`bg-gradient-to-r ${colors.bg} border ${colors.border}`}>
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Icon */}
                        <div className={`w-24 h-24 rounded-xl bg-card/50 border ${colors.border} flex items-center justify-center flex-shrink-0`}>
                          <Award className={`w-12 h-12 ${colors.icon}`} />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-green-500 text-sm font-medium">Verified</span>
                          </div>
                          <h3 className="font-heading font-bold text-2xl mb-2">
                            {cert.cert_name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Issued: {formattedDate}
                            </span>
                            <span>Score: {cert.score}%</span>
                            <span className="font-mono text-xs">ID: {cert.id.slice(0, 8).toUpperCase()}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="border-slate-600"
                            onClick={() => downloadCertificate(cert.id)}
                            disabled={downloading === cert.id}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {downloading === cert.id ? 'Downloading...' : 'Download PDF'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info */}
        {certificates.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 bg-muted/50 rounded-xl text-center"
          >
            <h3 className="font-semibold mb-2">Certificate Verification</h3>
            <p className="text-sm text-slate-400">
              Each certificate includes a unique QR code that can be scanned to verify its authenticity. 
              Share your certificates with confidence!
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
