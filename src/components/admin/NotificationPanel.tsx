/**
 * NotificationPanel - Admin notifications list
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import type { AdminNotification } from '@/types/admin';

interface NotificationPanelProps {
  notifications: AdminNotification[];
  loading: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const getNotificationIcon = (type: AdminNotification['type']) => {
  switch (type) {
    case 'new_request':
      return <UserPlus className="w-4 h-4 text-blue-500" />;
    case 'approval':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'rejection':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

const getNotificationColor = (type: AdminNotification['type']) => {
  switch (type) {
    case 'new_request':
      return 'border-l-blue-500';
    case 'approval':
      return 'border-l-green-500';
    case 'rejection':
      return 'border-l-red-500';
    default:
      return 'border-l-gray-500';
  }
};

export function NotificationPanel({
  notifications,
  loading,
  onMarkRead,
  onMarkAllRead,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D2821]" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-sm text-gray-500">({unreadCount} unread)</span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Notifications</h3>
          <p className="text-gray-500">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`bg-white rounded-lg border border-gray-200 border-l-4 ${getNotificationColor(
                  notification.type
                )} p-4 ${notification.read ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                      {!notification.read && (
                        <button
                          onClick={() => onMarkRead(notification.id)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.createdAt.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;
