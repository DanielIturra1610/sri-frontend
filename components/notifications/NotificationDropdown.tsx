'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, CheckCheck, X, AlertCircle, Info, CheckCircle, XCircle, Package, ArrowRightLeft } from 'lucide-react';
import { NotificationService } from '@/services/notificationService';
import { cn } from '@/lib/utils/cn';
import { Button, Badge } from '@/components/ui';
import type { Notification, NotificationType } from '@/types';
import toast from 'react-hot-toast';

export function NotificationDropdown() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load notifications
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const [recentNotifications, count] = await Promise.all([
        NotificationService.getRecentUnread(5),
        NotificationService.getUnreadCount(),
      ]);
      setNotifications(recentNotifications);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount and when dropdown opens
  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (showDropdown) {
      loadNotifications();
    }
  }, [showDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await NotificationService.markAsRead(notificationId);
      loadNotifications();
      toast.success('Notificación marcada como leída');
    } catch (error: any) {
      toast.error(error.message || 'Error al marcar como leída');
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      loadNotifications();
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error: any) {
      toast.error(error.message || 'Error al marcar todas como leídas');
    }
  };

  // Handle delete notification
  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await NotificationService.deleteNotification(notificationId);
      loadNotifications();
      toast.success('Notificación eliminada');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar notificación');
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await NotificationService.markAsRead(notification.id);
      loadNotifications();
    }
    if (notification.link) {
      router.push(notification.link);
      setShowDropdown(false);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: NotificationType) => {
    const iconClass = 'h-5 w-5';
    switch (type) {
      case 'success':
        return <CheckCircle className={cn(iconClass, 'text-green-600')} />;
      case 'error':
        return <XCircle className={cn(iconClass, 'text-red-600')} />;
      case 'warning':
        return <AlertCircle className={cn(iconClass, 'text-orange-600')} />;
      case 'stock_alert':
        return <Package className={cn(iconClass, 'text-yellow-600')} />;
      case 'transfer':
        return <ArrowRightLeft className={cn(iconClass, 'text-blue-600')} />;
      default:
        return <Info className={cn(iconClass, 'text-blue-600')} />;
    }
  };

  // Get relative time
  const getRelativeTime = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;

    return notificationDate.toLocaleDateString('es-CL');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
              {unreadCount > 0 && (
                <Badge variant="primary" size="sm">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Cargando notificaciones...
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer relative group',
                      !notification.is_read && 'bg-blue-50 dark:bg-blue-900/10'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {getRelativeTime(notification.created_at)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.is_read && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title="Marcar como leída"
                          >
                            <Check className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(notification.id, e)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title="Eliminar"
                        >
                          <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay notificaciones nuevas</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
              <button
                onClick={() => {
                  router.push('/notifications');
                  setShowDropdown(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
