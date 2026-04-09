import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, API } from '../App';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';
import {
  Lock, CreditCard, ArrowLeft, Shield, User,
  Crown, Rocket, Star, AlertTriangle, CheckCircle,
  Calendar, RefreshCw, X, Save, LogOut, Camera
} from 'lucide-react';

const TIER_ICONS = { free: Star, pro: Rocket, elite: Crown };
const TIER_COLORS = {
  free:  { card: 'border-gray-700', icon: 'text-gray-400', badge: 'bg-gray-800 text-gray-300' },
  pro:   { card: 'border-primary/40', icon: 'text-primary', badge: 'bg-primary/20 text-primary' },
  elite: { card: 'border-purple-500/40', icon: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
};

const AccountPage = () => {
  const { user, token, refreshUser, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // ── Avatar upload state ───────────────────────────────────────────────────
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('account.avatar.invalidType', 'Please select an image file'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('account.avatar.tooLarge', 'Image must be smaller than 10 MB'));
      return;
    }
    setUploadingAvatar(true);
    try {
      // 1. Get a direct upload URL from our backend
      const { data: urlData } = await axios.get(`${API}/auth/avatar/upload-url`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // 2. Upload directly to Cloudflare
      const form = new FormData();
      form.append('file', file);
      const cfResp = await fetch(urlData.upload_url, { method: 'POST', body: form });
      if (!cfResp.ok) throw new Error('Upload failed');
      // 3. Confirm image with our backend
      await axios.post(
        `${API}/auth/avatar`,
        { image_id: urlData.image_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t('account.avatar.success', 'Profile picture updated'));
      refreshUser?.();
    } catch {
      toast.error(t('account.avatar.failed', 'Upload failed. Please try again.'));
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  // ── Name edit state ────────────────────────────────────────────────────────
  const [editName, setEditName]           = useState(user?.full_name || '');
  const [editCertName, setEditCertName]   = useState(user?.certificate_name || '');
  const [savingName, setSavingName]       = useState(false);

  // ── Password change state ──────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword, setNewPassword]           = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [savingPassword, setSavingPassword]     = useState(false);

  // ── Subscription state ────────────────────────────────────────────────────
  const [sub, setSub]                 = useState(null);
  const [loadingSub, setLoadingSub]   = useState(true);
  const [cancelOpen, setCancelOpen]   = useState(false);
  const [cancelling, setCancelling]   = useState(false);

  const lang = i18n.language;

  const fmt = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  useEffect(() => {
    axios.get(`${API}/subscription/my-subscription`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setSub(res.data))
      .catch(() => setSub(null))
      .finally(() => setLoadingSub(false));
  }, [token]);

  // ── Name save ────────────────────────────────────────────────────────────
  const handleNameSave = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error(t('profile.nameRequired'));
      return;
    }
    setSavingName(true);
    try {
      await axios.put(
        `${API}/auth/profile`,
        { full_name: editName.trim(), certificate_name: editCertName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t('profile.profileUpdated'));
      refreshUser?.();
    } catch {
      toast.error(t('profile.updateFailed'));
    } finally {
      setSavingName(false);
    }
  };

  // ── Password submit ───────────────────────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error(t('account.password.tooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('account.password.mismatch'));
      return;
    }
    setSavingPassword(true);
    try {
      await axios.put(
        `${API}/auth/password`,
        { current_password: currentPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(t('account.password.success'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const detail = err.response?.data?.detail || '';
      if (detail.toLowerCase().includes('current')) {
        toast.error(t('account.password.wrongCurrent'));
      } else {
        toast.error(t('account.password.failed'));
      }
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Cancel subscription ───────────────────────────────────────────────────
  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await axios.post(
        `${API}/subscription/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const until = fmt(res.data.access_until);
      toast.success(t('account.subscription.cancelSuccess', { date: until }));
      setSub(prev => prev ? { ...prev, cancelled: true } : prev);
      setCancelOpen(false);
    } catch {
      toast.error(t('account.subscription.cancelFailed'));
    } finally {
      setCancelling(false);
    }
  };

  const tier      = sub?.tier || 'free';
  const TierIcon  = TIER_ICONS[tier] || Star;
  const colors    = TIER_COLORS[tier] || TIER_COLORS.free;
  const isPaid    = tier !== 'free';

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-8">
        <div className="container mx-auto px-4 max-w-2xl">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Back to profile"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('account.title')}</h1>
            </div>
          </div>

          {/* ── Avatar Card ──────────────────────────────────────────────── */}
          <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              {t('account.avatar.title', 'Profile Picture')}
            </h2>
            <div className="flex items-center gap-5">
              {/* Current avatar preview */}
              <div className="relative shrink-0">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary">
                    {user?.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {/* Upload button */}
              <div>
                <p className="text-sm text-gray-400 mb-3">
                  {t('account.avatar.hint', 'JPG, PNG or WebP. Max 10 MB.')}
                </p>
                <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                  uploadingAvatar
                    ? 'bg-gray-700 text-gray-500 pointer-events-none'
                    : 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30'
                }`}>
                  <Camera className="w-4 h-4" />
                  {uploadingAvatar
                    ? t('account.avatar.uploading', 'Uploading…')
                    : t('account.avatar.upload', 'Upload Photo')}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* ── Display Name Card ────────────────────────────────────────── */}
          <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {t('account.name.title')}
            </h2>
            <form onSubmit={handleNameSave} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t('account.name.displayName')}</label>
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t('account.name.fullName')}</label>
                <Input
                  value={editCertName}
                  onChange={e => setEditCertName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder={t('account.name.fullNamePlaceholder')}
                />
                <p className="text-xs text-gray-500 mt-1">{t('account.name.fullNameHint')}</p>
              </div>
              <Button type="submit" disabled={savingName}>
                <Save className="w-4 h-4 mr-2" />
                {savingName ? t('account.name.saving') : t('account.name.save')}
              </Button>
            </form>
          </div>

          {/* ── Subscription Card ─────────────────────────────────────────── */}
          <div className={`bg-gray-900/60 backdrop-blur border rounded-xl p-6 mb-6 ${colors.card}`}>
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              {t('account.subscription.title')}
            </h2>

            {loadingSub ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Tier badge + status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.badge}`}>
                      <TierIcon className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">{t('account.subscription.plan')}</p>
                      <p className="font-bold text-white capitalize">{sub?.name || tier}</p>
                    </div>
                  </div>
                  {isPaid && (
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      sub?.cancelled
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {sub?.cancelled
                        ? <AlertTriangle className="w-3 h-3" />
                        : <CheckCircle className="w-3 h-3" />}
                      {sub?.cancelled ? 'Cancelled' : t('account.subscription.active')}
                    </span>
                  )}
                </div>

                {/* Dates */}
                {isPaid && (
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {sub?.started && (
                      <div className="p-3 bg-gray-800/50 rounded-lg">
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                          <Calendar className="w-3 h-3" />
                          {t('account.subscription.memberSince')}
                        </p>
                        <p className="text-sm font-medium text-white">{fmt(sub.started)}</p>
                      </div>
                    )}
                    {sub?.expires && (
                      <div className="p-3 bg-gray-800/50 rounded-lg">
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                          <RefreshCw className="w-3 h-3" />
                          {sub?.cancelled
                            ? t('account.subscription.expiresOn')
                            : t('account.subscription.renewsOn')}
                        </p>
                        <p className="text-sm font-medium text-white">{fmt(sub.expires)}</p>
                      </div>
                    )}
                  </div>
                )}

                {!isPaid && (
                  <p className="text-sm text-gray-400">{t('account.subscription.noPaidSub')}</p>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-700 hover:border-primary hover:text-primary"
                    onClick={() => navigate('/pricing')}
                  >
                    {t('account.subscription.upgrade')}
                  </Button>
                  {isPaid && !sub?.cancelled && (
                    <Button
                      variant="ghost"
                      className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/30"
                      onClick={() => setCancelOpen(true)}
                    >
                      {t('account.subscription.cancel')}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Password Card ──────────────────────────────────────────────── */}
          <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-xl p-6">
            <h2 className="font-bold text-white mb-5 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {t('account.password.title')}
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  {t('account.password.current')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white pl-9"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  {t('account.password.newPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white pl-9"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">
                  {t('account.password.confirm')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={`bg-gray-800 border-gray-700 text-white pl-9 ${
                      confirmPassword && confirmPassword !== newPassword ? 'border-red-500' : ''
                    }`}
                    required
                    autoComplete="new-password"
                  />
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-400 mt-1">{t('account.password.mismatch')}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={savingPassword}
              >
                {savingPassword ? t('account.password.saving') : t('account.password.save')}
              </Button>
            </form>
          </div>

          {/* ── Logout ───────────────────────────────────────────────────── */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <Button
              variant="ghost"
              className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/30"
              onClick={() => { logout(); navigate('/'); }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('nav.signOut', 'Sign Out')}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Cancel Confirmation Modal ────────────────────────────────────── */}
      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{t('account.subscription.cancelTitle')}</h3>
              <button onClick={() => setCancelOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              {t('account.subscription.cancelMsg', { date: fmt(sub?.expires) })}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-gray-700"
                onClick={() => setCancelOpen(false)}
              >
                {t('common.cancel', 'Back')}
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? '…' : t('account.subscription.cancelBtn')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AccountPage;
