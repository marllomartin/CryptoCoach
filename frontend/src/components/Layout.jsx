import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Bot,
  TrendingUp,
  Award,
  BarChart3,
  UserCircle,
  Shield,
  Settings
} from 'lucide-react';
import { Button } from '../components/ui/button';
import LanguageSwitcher from './LanguageSwitcher';

const NavLink = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`text-sm font-medium transition-colors hover:text-primary ${
        isActive ? 'text-primary' : 'text-slate-300'
      }`}
    >
      {children}
    </Link>
  );
};

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Public nav — shown when logged out
  const publicNavLinks = [
    { to: '/academy', label: t('nav.academy') },
    { to: '/market-intelligence', label: t('nav.marketIntel', 'Market Intelligence') },
    { to: '/pricing', label: t('nav.pricing') },
    { to: '/blog', label: t('nav.insights') },
    { to: '/about', label: t('nav.about') },
  ];

  // Authenticated nav — shown when logged in
  const authNavLinks = [
    { to: '/dashboard', label: t('nav.dashboard') },
    { to: '/academy', label: t('nav.academy') },
    { to: '/market-intelligence', label: t('nav.marketIntel', 'Market Intelligence') },
    { to: '/blog', label: t('nav.insights') },
  ];

  const navLinks = user ? authNavLinks : publicNavLinks;

  const userLinks = [
    { to: '/market-intelligence', label: t('nav.marketIntel', 'Market Intel'), icon: BarChart3, highlight: true },
    { to: '/trading-arena', label: t('nav.tradingArena'), icon: TrendingUp },
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/mentor', label: t('nav.aiMentor'), icon: Bot },
    { to: '/profile', label: t('nav.profile', 'Profile'), icon: UserCircle },
    { to: '/certificates', label: t('nav.certificates'), icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[auto_1fr_auto] items-center h-16 gap-4">
            {/* Logo */}
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-bold text-lg hidden sm:block">TheCryptoCoach</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center gap-4">
              {navLinks.map(link => (
                <NavLink key={link.to} to={link.to}>
                  <span className="whitespace-nowrap">{link.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher variant="minimal" />
              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/trading-arena">
                    <Button variant="outline" size="sm" className="whitespace-nowrap text-primary border-primary/50 hover:bg-primary/10">
                      <TrendingUp className="w-4 h-4 mr-2 shrink-0" />
                      {t('nav.tradingArena')}
                    </Button>
                  </Link>
                  {['admin', 'moderator', 'editor'].includes(user.role) && (() => {
                    const roleStyle = {
                      admin:     'text-red-400 border-red-500/50 hover:bg-red-500/10 bg-gradient-to-r from-red-500/5 to-red-600/5',
                      moderator: 'text-purple-400 border-purple-500/50 hover:bg-purple-500/10 bg-gradient-to-r from-purple-500/5 to-purple-600/5',
                      editor:    'text-blue-400 border-blue-500/50 hover:bg-blue-500/10 bg-gradient-to-r from-blue-500/5 to-blue-600/5',
                    }[user.role] || '';
                    return (
                      <Link to="/admin">
                        <Button variant="outline" size="sm" className={`whitespace-nowrap ${roleStyle}`}>
                          <Shield className="w-4 h-4 mr-2 shrink-0" />
                          {t('admin.title')}
                        </Button>
                      </Link>
                    );
                  })()}
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="whitespace-nowrap text-slate-300">
                      <User className="w-4 h-4 mr-2 shrink-0" />
                      <span className="max-w-[120px] truncate">{user.full_name}</span>
                    </Button>
                  </Link>
                  <Link to="/account">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white shrink-0" aria-label="Account settings">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">{t('nav.signIn')}</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                      {t('nav.getStarted')}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Header Controls */}
            <div className="md:hidden flex items-center gap-2 justify-self-end">
              <LanguageSwitcher variant="minimal" />
              <button
                className="p-2 text-slate-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="mobile-menu-btn"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-card border-b border-border"
              style={{ maxHeight: 'calc(100svh - 4rem)', overflowY: 'auto' }}
            >
              <div className="px-4 py-4 space-y-1 pb-6">

                {user ? (
                  <>
                    {/* User identity */}
                    <div className="flex items-center gap-3 py-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">{user.full_name?.charAt(0) || 'U'}</span>
                      </div>
                      <span className="font-semibold text-white truncate">{user.full_name}</span>
                    </div>

                    {/* Simulator — prominent like desktop */}
                    <Link to="/trading-arena" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start mb-2 text-primary border-primary/50 hover:bg-primary/10">
                        <TrendingUp className="w-4 h-4 mr-2 shrink-0" />
                        {t('nav.tradingArena')}
                      </Button>
                    </Link>

                    {/* Admin Panel — if applicable */}
                    {['admin', 'moderator', 'editor'].includes(user.role) && (() => {
                      const roleStyle = {
                        admin:     'text-red-400 border-red-500/50 hover:bg-red-500/10',
                        moderator: 'text-purple-400 border-purple-500/50 hover:bg-purple-500/10',
                        editor:    'text-blue-400 border-blue-500/50 hover:bg-blue-500/10',
                      }[user.role] || '';
                      return (
                        <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className={`w-full justify-start mb-2 ${roleStyle}`}>
                            <Shield className="w-4 h-4 mr-2 shrink-0" />
                            {t('admin.title')}
                          </Button>
                        </Link>
                      );
                    })()}

                    {/* App links */}
                    <div className="border-t border-border pt-3 mt-1 space-y-0.5">
                      {userLinks.filter(l => l.to !== '/trading-arena').map(link => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-2 py-2.5 rounded-md text-slate-300 hover:text-primary hover:bg-primary/5 transition-colors"
                        >
                          <link.icon className="w-4 h-4 shrink-0" />
                          <span className="text-sm">{link.label}</span>
                        </Link>
                      ))}
                    </div>

                    {/* App nav links */}
                    <div className="border-t border-border pt-3 mt-1 space-y-0.5">
                      {authNavLinks.map(link => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-2 py-2.5 rounded-md text-sm text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>

                    {/* Account & Sign out */}
                    <div className="border-t border-border pt-3 mt-1 space-y-1">
                      <Link
                        to="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-2 py-2.5 rounded-md text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4 shrink-0" />
                        {t('account.title', 'Account Settings')}
                      </Link>
                      <button
                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-2 py-2.5 rounded-md text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        {t('nav.signOut', 'Sign Out')}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Public nav links */}
                    {publicNavLinks.map(link => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-2 py-2.5 rounded-md text-sm text-slate-300 hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="border-t border-border pt-3 mt-1 space-y-2">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full">{t('nav.signIn')}</Button>
                      </Link>
                      <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-primary">{t('nav.getStarted')}</Button>
                      </Link>
                    </div>
                  </>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="font-heading font-bold text-xl">TheCryptoCoach.io</span>
              </Link>
              <p className="text-slate-400 text-sm max-w-md">
                {t('footer.description')}
              </p>
            </div>

            {/* Nav links — always in footer, replaces navbar slots for logged-in users */}
            <div>
              <h4 className="font-heading font-semibold mb-4">{t('footer.explore', 'Explore')}</h4>
              <ul className="space-y-2">
                <li><Link to="/pricing" className="text-slate-400 hover:text-primary text-sm">{t('nav.pricing')}</Link></li>
                <li><Link to="/about" className="text-slate-400 hover:text-primary text-sm">{t('nav.about')}</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-heading font-semibold mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-slate-400 hover:text-primary text-sm">{t('footer.termsOfService')}</Link></li>
                <li><Link to="/privacy" className="text-slate-400 hover:text-primary text-sm">{t('footer.privacyPolicy')}</Link></li>
                <li><Link to="/disclaimer" className="text-slate-400 hover:text-primary text-sm">{t('footer.riskDisclaimer')}</Link></li>
                <li><Link to="/contact" className="text-slate-400 hover:text-primary text-sm">{t('footer.contactUs')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} TheCryptoCoach.io. {t('footer.allRights')}
            </p>
            <p className="text-slate-500 text-xs">
              {t('footer.riskNote')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
