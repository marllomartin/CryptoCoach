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
  BookOpen,
  Bot,
  TrendingUp,
  Award,
  BarChart3,
  Store,
  UserCircle,
  Shield
} from 'lucide-react';
import { Button } from '../components/ui/button';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell';

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

  const navLinks = [
    { to: '/academy', label: t('nav.academy') },
    { to: '/market-intelligence', label: t('nav.marketIntel', 'Market Intelligence'), highlight: true },
    { to: '/pricing', label: t('nav.pricing') },
    { to: '/blog', label: t('nav.insights') },
    { to: '/about', label: t('nav.about') },
  ];

  const userLinks = [
    { to: '/market-intelligence', label: t('nav.marketIntel', 'Market Intel'), icon: BarChart3, highlight: true },
    { to: '/trading-arena', label: t('nav.tradingArena'), icon: TrendingUp },
    { to: '/simulator', label: t('nav.simulator'), icon: TrendingUp },
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/mentor', label: t('nav.aiMentor'), icon: Bot },
    { to: '/shop', label: t('nav.shop', 'Shop'), icon: Store },
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
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-bold text-lg hidden sm:block">TheCryptoCoach</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center gap-6">
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
                  <Link to="/simulator">
                    <Button variant="outline" size="sm" className="whitespace-nowrap text-primary border-primary/50 hover:bg-primary/10">
                      <TrendingUp className="w-4 h-4 mr-2 shrink-0" />
                      {t('nav.simulator')}
                    </Button>
                  </Link>
                  {['admin', 'moderator'].includes(user.role) && (
                    <Link to="/admin">
                      <Button variant="outline" size="sm" className="whitespace-nowrap text-fuchsia-400 border-fuchsia-500/50 hover:bg-fuchsia-500/10 bg-gradient-to-r from-fuchsia-500/5 to-purple-500/5">
                        <Shield className="w-4 h-4 mr-2 shrink-0" />
                        {t('admin.title')}
                      </Button>
                    </Link>
                  )}
                  <NotificationBell />
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="whitespace-nowrap text-slate-300">
                      <User className="w-4 h-4 mr-2 shrink-0" />
                      <span className="max-w-[120px] truncate">{user.full_name}</span>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-slate-400 hover:text-white shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
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
            >
              <div className="px-4 py-4 space-y-4">
                {navLinks.map(link => (
                  <Link 
                    key={link.to} 
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-slate-300 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                
                {user && (
                  <>
                    <div className="border-t border-border pt-4 mt-4">
                      {userLinks.map(link => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 py-2 text-slate-300 hover:text-primary"
                        >
                          <link.icon className="w-4 h-4" />
                          {link.label}
                        </Link>
                      ))}
                      {['admin', 'moderator'].includes(user.role) && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 py-2 text-fuchsia-400 hover:text-fuchsia-300"
                        >
                          <Shield className="w-4 h-4" />
                          {t('admin.title')}
                        </Link>
                      )}
                    </div>
                  </>
                )}

                <div className="border-t border-border pt-4">
                  {user ? (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-slate-400"
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full">Sign In</Button>
                      </Link>
                      <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-primary">Get Started</Button>
                      </Link>
                    </div>
                  )}
                </div>
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
                Your trusted source for cryptocurrency education. Master blockchain, DeFi, and digital assets with expert-led courses and certifications.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-heading font-semibold mb-4">Learn</h4>
              <ul className="space-y-2">
                <li><Link to="/academy" className="text-slate-400 hover:text-primary text-sm">Academy</Link></li>
                <li><Link to="/glossary" className="text-slate-400 hover:text-primary text-sm">Glossary</Link></li>
                <li><Link to="/blog" className="text-slate-400 hover:text-primary text-sm">Insights</Link></li>
                <li><Link to="/simulator" className="text-slate-400 hover:text-primary text-sm">Trading Simulator</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-heading font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-slate-400 hover:text-primary text-sm">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-slate-400 hover:text-primary text-sm">Privacy Policy</Link></li>
                <li><Link to="/disclaimer" className="text-slate-400 hover:text-primary text-sm">Risk Disclaimer</Link></li>
                <li><Link to="/contact" className="text-slate-400 hover:text-primary text-sm">Contact Us</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} TheCryptoCoach.io. All rights reserved.
            </p>
            <p className="text-slate-500 text-xs">
              Cryptocurrency investments carry risk. This platform provides education, not financial advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
