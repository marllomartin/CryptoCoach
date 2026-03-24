import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API } from '../App';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  Bell, Check, CheckCheck, Trash2, X, Trophy, Zap, 
  Target, Flame, Gift, Sparkles, BookOpen, TrendingUp,
  Users, Shield, AlertTriangle
} from 'lucide-react';
import { Button } from './ui/button';

const ICON_MAP = {
  trophy: Trophy,
  zap: Zap,
  target: Target,
  flame: Flame,
  gift: Gift,
  sparkles: Sparkles,
  'book-open': BookOpen,
  'trending-up': TrendingUp,
  users: Users,
  shield: Shield,
  'alert-triangle': AlertTriangle,
  bell: Bell
};

const COLOR_MAP = {
  yellow: 'bg-yellow-500/20 text-yellow-500',
  purple: 'bg-purple-500/20 text-purple-500',
  green: 'bg-green-500/20 text-green-500',
  orange: 'bg-orange-500/20 text-orange-500',
  red: 'bg-red-500/20 text-red-500',
  blue: 'bg-blue-500/20 text-blue-500',
  pink: 'bg-pink-500/20 text-pink-500',
  cyan: 'bg-cyan-500/20 text-cyan-500',
  indigo: 'bg-indigo-500/20 text-indigo-500',
  violet: 'bg-violet-500/20 text-violet-500',
  gray: 'bg-gray-500/20 text-gray-500'
};

export const NotificationBell = () => {
  const { user, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user && token) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(
        `${API}/v2/notifications/${user.id}/count`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API}/v2/notifications/${user.id}?limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(
        `${API}/v2/notifications/${user.id}/read/${notificationId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(
        `${API}/v2/notifications/${user.id}/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(
        `${API}/v2/notifications/${user.id}/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const notif = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notif && !notif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const { i18n } = useTranslation();

  const getLocalizedText = (notif, field) => {
    if (i18n.language === 'fr' && notif[`${field}_fr`]) return notif[`${field}_fr`];
    if (i18n.language === 'ar' && notif[`${field}_ar`]) return notif[`${field}_ar`];
    return notif[field];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now - date) / 1000;

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors"
        data-testid="notification-bell"
      >
        <Bell className="w-5 h-5 text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h3 className="font-bold text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const IconComponent = ICON_MAP[notif.data?.icon] || ICON_MAP[notif.type] || Bell;
                const colorClass = COLOR_MAP[notif.data?.color] || COLOR_MAP.gray;

                return (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-gray-800/50 hover:bg-gray-800/50 transition-colors ${
                      !notif.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`font-medium text-sm ${!notif.read ? 'text-white' : 'text-gray-300'}`}>
                            {getLocalizedText(notif, 'title')}
                          </p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notif.read && (
                              <button
                                onClick={() => markAsRead(notif.id)}
                                className="p-1 hover:bg-gray-700 rounded"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3 text-gray-500" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notif.id)}
                              className="p-1 hover:bg-gray-700 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3 text-gray-500" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {getLocalizedText(notif, 'message')}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatTime(notif.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
