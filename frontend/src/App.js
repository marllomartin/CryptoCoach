import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
import axios from 'axios';
import { Toaster } from 'sonner';
import { DiscountPopup } from './components/DiscountPopup';
import { ExitIntentPopup } from './components/ExitIntentPopup';
import { useTranslation } from 'react-i18next';
import './i18n';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AcademyPage from './pages/AcademyPage';
import CoursePage from './pages/CoursePage';
import LessonPage from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import ExamPage from './pages/ExamPage';
import DashboardPage from './pages/DashboardPage';
import MentorPage from './pages/MentorPage';
import GlossaryPage from './pages/GlossaryPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CertificatesPage from './pages/CertificatesPage';
import PublicCertificatePage from './pages/PublicCertificatePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import DisclaimerPage from './pages/DisclaimerPage';
import PricingPage from './pages/PricingPage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';
import AdminPage from './pages/AdminPage';
import TradingArenaPage from './pages/TradingArenaPage';
import ProfilePage from './pages/ProfilePage';
import AccountPage from './pages/AccountPage';
import MarketIntelligencePage from './pages/MarketIntelligencePage';
// Social features removed - Learning platform focus
// import GuildPage from './pages/GuildPage';
// import ReferralPage from './pages/ReferralPage';
import NotFoundPage from './pages/NotFoundPage';

// Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (e) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (email, password, full_name, certificate_name) => {
    const response = await axios.post(`${API}/auth/register`, { email, password, full_name, certificate_name });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (e) {
        console.error('Failed to refresh user');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Wrapper components for popups with i18n language
const DiscountPopupWithLanguage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  return <DiscountPopup language={lang} />;
};

const ExitIntentPopupWithLanguage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  return <ExitIntentPopup language={lang} />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster
          position="top-right" 
          toastOptions={{
            style: {
              background: '#0B101B',
              border: '1px solid #1E293B',
              color: '#F8FAFC',
            },
          }}
        />
        {/* Discount Popup - Shows once after 30s or 50% scroll */}
        <DiscountPopupWithLanguage />
        {/* Exit Intent Popup - Shows when user tries to leave */}
        <ExitIntentPopupWithLanguage />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/academy" element={<AcademyPage />} />
          <Route path="/course/:courseId" element={<CoursePage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/disclaimer" element={<DisclaimerPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/subscription/success" element={<ProtectedRoute><SubscriptionSuccessPage /></ProtectedRoute>} />
          
          {/* Protected Routes */}
          <Route path="/trading-arena" element={<ProtectedRoute><TradingArenaPage /></ProtectedRoute>} />
          <Route path="/lesson/:lessonId" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
          <Route path="/quiz/:lessonId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/exam/:courseId" element={<ProtectedRoute><ExamPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/simulator" element={<Navigate to="/trading-arena" replace />} />
          <Route path="/mentor" element={<ProtectedRoute><MentorPage /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />
          <Route path="/certificate/:certId" element={<PublicCertificatePage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          
          {/* Profile & Social Routes */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
          <Route path="/market-intelligence" element={<MarketIntelligencePage />} />
          {/* Guild and Referral removed - Learning platform focus */}
          
          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
