import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Bell, Check, CheckCheck,Clock, Info, Monitor, PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef,useState } from 'react';

import { useSocket } from '@/hooks/useSocket';
import { Notification,notificationApi } from '@/services/notificationApi';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();

  const { user } = useAppSelector((state: RootState) => state.auth);
  const hospitalId = user?.hospitalId || '';
  const userId = user?._id || '';

  const { socket, joinHospital } = useSocket();

  // Fetch notifications initially
  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications(20);
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  // Join hospital socket room for real-time notifications
  useEffect(() => {
    if (hospitalId && socket) {
      joinHospital(hospitalId);
    }
  }, [hospitalId, socket]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data: any) => {
      const newNotif = data.notification;
      // Only append if it belongs to current user
      if (newNotif && newNotif.recipient === userId) {
        setNotifications((prev) => [newNotif, ...prev]);
        // Trigger subtle alert sound or micro-animation if desired
      }
    };

    socket.on('new-notification', handleNewNotification);

    return () => {
      socket.off('new-notification', handleNewNotification);
    };
  }, [socket, userId]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await notificationApi.markAsRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    // 1. Mark as read if not already read
    if (!notif.isRead) {
      await handleMarkAsRead(notif._id);
    }
    
    // 2. Determine base role path
    let rolePath = 'doctor';
    if (user?.role === 'ADMIN') rolePath = 'admin';
    else if (user?.role === 'SUPERADMIN') rolePath = 'superadmin';
    
    // 3. Redirect
    if (notif.relatedType === 'Ad') {
      router.push(`/${rolePath}/ads`);
    } else if (notif.relatedType === 'Kiosk') {
      router.push(`/${rolePath}/kiosks`);
    }
    
    // 4. Close dropdown
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await notificationApi.markAllAsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getNotificationIcon = (notif: Notification) => {
    if (notif.relatedType === 'Ad') {
      return (
        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <PlayCircle className="w-5 h-5" />
        </div>
      );
    }
    if (notif.relatedType === 'Kiosk') {
      return (
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <Monitor className="w-5 h-5" />
        </div>
      );
    }
    if (notif.type === 'error') {
      return (
        <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
          <AlertCircle className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="p-2.5 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
        <Info className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-xl text-slate-400 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-all relative cursor-pointer border ${
          isOpen ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-primary' : 'border-transparent'
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 flex items-center justify-center text-[9px] font-black bg-red-500 text-white rounded-full ring-2 ring-white dark:ring-slate-950 animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Container */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl z-[150] overflow-hidden animate-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  {unreadCount} unread messages
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Read All
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-400">Loading alerts...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
                  <Bell className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">All caught up!</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">
                  You have no notifications at the moment.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 flex gap-4 transition-colors relative group cursor-pointer ${
                    notif.isRead
                      ? 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                      : 'bg-primary/5 hover:bg-primary/10 dark:bg-primary/5 dark:hover:bg-primary/10'
                  }`}
                >
                  {/* Left Icon */}
                  <div className="flex-shrink-0">{getNotificationIcon(notif)}</div>

                  {/* Center Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-black truncate text-slate-900 dark:text-white`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1 break-words">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-2">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Right Status Dot */}
                  {!notif.isRead && (
                    <div className="flex-shrink-0 self-center">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block shadow-lg shadow-blue-500/30" />
                    </div>
                  )}

                  {/* Quick Mark Read Icon on hover (only if unread) */}
                  {!notif.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif._id);
                      }}
                      className="absolute right-4 bottom-4 p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-emerald-500"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
