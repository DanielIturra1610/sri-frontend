'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Filter, Check, CheckCheck, Trash2, AlertCircle, Info, CheckCircle, XCircle, Package, ArrowRightLeft, Clock } from 'lucide-react';
import { NotificationService } from '@/services/notificationService';
import { Button, Card, CardHeader, CardTitle, CardContent, Select, Badge } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import type { Notification, NotificationType } from '@/types';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Load notifications
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const [response, count] = await Promise.all([
        NotificationService.getNotifications({
          type: typeFilter !== 'all' ? (typeFilter as NotificationType) : undefined,
          is_read: statusFilter === 'all' ? undefined : statusFilter === 'read',
          page,
          page_size: 20,
          sort_by: 'created_at',
          sort_order: 'desc',
        }),
        NotificationService.getUnreadCount(),
      ]);

      setNotifications(response.items);
      setTotalItems(response.total);
      setUnreadCount(count);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar notificaciones');
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [typeFilter, statusFilter, page]);

  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string) => {
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
      const result = await NotificationService.markAllAsRead();
      loadNotifications();
      toast.success(`${result.count} notificaciones marcadas como leídas`);
    } catch (error: any) {
      toast.error(error.message || 'Error al marcar todas como leídas');
    }
  };

  // Handle delete
  const handleDelete = async (notificationId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta notificación?')) {
      return;
    }

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
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: NotificationType) => {
    const iconClass = 'h-6 w-6';
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

  // Get notification type label
  const getTypeLabel = (type: NotificationType) => {
    const labels: Record<NotificationType, { text: string; variant: any }> = {
      info: { text: 'Información', variant: 'info' },
      success: { text: 'Éxito', variant: 'success' },
      warning: { text: 'Advertencia', variant: 'warning' },
      error: { text: 'Error', variant: 'danger' },
      stock_alert: { text: 'Alerta de Stock', variant: 'warning' },
      transfer: { text: 'Transferencia', variant: 'info' },
      system: { text: 'Sistema', variant: 'secondary' },
    };
    return labels[type];
  };

  // Get relative time
  const getRelativeTime = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;

    return notificationDate.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="h-7 w-7" />
            Notificaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona todas tus notificaciones del sistema
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="h-4 w-4" />}
              onClick={handleMarkAllAsRead}
            >
              Marcar todas leídas
            </Button>
          )}
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            size="sm"
            leftIcon={<Filter className="h-4 w-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{unreadCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">No Leídas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {totalItems - unreadCount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Leídas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo
                </label>
                <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="all">Todos los tipos</option>
                  <option value="info">Información</option>
                  <option value="success">Éxito</option>
                  <option value="warning">Advertencia</option>
                  <option value="error">Error</option>
                  <option value="stock_alert">Alerta de Stock</option>
                  <option value="transfer">Transferencia</option>
                  <option value="system">Sistema</option>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">Todas</option>
                  <option value="unread">No leídas</option>
                  <option value="read">Leídas</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Notificaciones ({totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Cargando notificaciones...
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors relative group',
                    notification.link && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
                    !notification.is_read && 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            <Badge
                              variant={getTypeLabel(notification.type).variant}
                              size="sm"
                            >
                              {getTypeLabel(notification.type).text}
                            </Badge>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            {getRelativeTime(notification.created_at)}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              title="Marcar como leída"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification.id);
                            }}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-600 rounded-r" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Bell className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No hay notificaciones</p>
              <p className="text-sm">
                {statusFilter === 'unread'
                  ? 'No tienes notificaciones sin leer'
                  : 'Las notificaciones aparecerán aquí'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
