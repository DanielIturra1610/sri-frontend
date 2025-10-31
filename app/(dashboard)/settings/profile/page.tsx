'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Save, Lock, Mail, Phone, CreditCard, Calendar, Shield, Activity, Clock } from 'lucide-react';
import { UserService } from '@/services/userService';
import { TransactionService } from '@/services/transactionService';
import { useAuth } from '@/lib/contexts/AuthContext';
import { profileSchema, changePasswordSchema, type ProfileFormData, type ChangePasswordFormData } from '@/lib/validations/user';
import { getRoleDisplayName } from '@/lib/constants/permissions';
import { transactionTypeLabels, transactionTypeColors } from '@/lib/validations/stock';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge, Skeleton, Alert } from '@/components/ui';
import type { Transaction } from '@/types';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [recentActivity, setRecentActivity] = useState<Transaction[]>([]);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    setValue: setProfileValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Change password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Load user profile and recent activity
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const [profile, transactions] = await Promise.all([
          UserService.getCurrentProfile(),
          TransactionService.getTransactions({ page_size: 5, sort_by: 'created_at', sort_order: 'desc' }),
        ]);

        // Set form values
        setProfileValue('full_name', profile.full_name);
        setProfileValue('email', profile.email);
        setProfileValue('rut', profile.rut || '');
        setProfileValue('phone', profile.phone || '');

        // Set recent activity (filter by current user if email matches)
        setRecentActivity(transactions.slice(0, 5));
      } catch (error: any) {
        toast.error(error.message || 'Error al cargar perfil');
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [setProfileValue]);

  // Handle profile update
  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      setIsUpdatingProfile(true);

      const profileData = {
        full_name: data.full_name,
        email: data.email,
        rut: data.rut || undefined,
        phone: data.phone || undefined,
      };

      const updatedUser = await UserService.updateProfile(profileData);

      // Update auth context
      if (authUser) {
        updateUser({
          ...authUser,
          ...updatedUser,
        });
      }

      toast.success('Perfil actualizado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar perfil');
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle password change
  const onSubmitPassword = async (data: ChangePasswordFormData) => {
    try {
      setIsChangingPassword(true);

      await UserService.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });

      toast.success('Contraseña cambiada exitosamente');
      resetPasswordForm();
      setShowPasswordForm(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar contraseña');
      console.error('Error changing password:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="h-7 w-7" />
          Mi Perfil
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {authUser?.full_name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{authUser?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="primary" size="sm">
                  {authUser?.role ? getRoleDisplayName(authUser.role) : ''}
                </Badge>
                <Badge variant={authUser?.is_active ? 'success' : 'danger'} size="sm">
                  {authUser?.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Detalles de la Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Miembro desde</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {authUser?.created_at ? new Date(authUser.created_at).toLocaleDateString('es-CL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email verificado</p>
                <p className="font-medium text-green-600 dark:text-green-400">Sí</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Form */}
      <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nombre Completo"
              placeholder="Ej: Juan Pérez González"
              error={profileErrors.full_name?.message}
              {...registerProfile('full_name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="usuario@ejemplo.com"
              error={profileErrors.email?.message}
              leftIcon={<Mail className="h-4 w-4" />}
              {...registerProfile('email')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="RUT (Opcional)"
                placeholder="12345678-9"
                error={profileErrors.rut?.message}
                leftIcon={<CreditCard className="h-4 w-4" />}
                {...registerProfile('rut')}
              />

              <Input
                label="Teléfono (Opcional)"
                placeholder="+56 9 1234 5678"
                error={profileErrors.phone?.message}
                leftIcon={<Phone className="h-4 w-4" />}
                {...registerProfile('phone')}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                variant="primary"
                leftIcon={<Save className="h-4 w-4" />}
                isLoading={isUpdatingProfile}
              >
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Change Password Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Seguridad
            </CardTitle>
            {!showPasswordForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm(true)}
              >
                Cambiar Contraseña
              </Button>
            )}
          </div>
        </CardHeader>
        {showPasswordForm && (
          <CardContent>
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              <Alert variant="info" title="Cambio de Contraseña">
                Tu nueva contraseña debe tener al menos 8 caracteres e incluir mayúsculas,
                minúsculas y números.
              </Alert>

              <Input
                label="Contraseña Actual"
                type="password"
                placeholder="••••••••"
                error={passwordErrors.current_password?.message}
                {...registerPassword('current_password')}
              />

              <Input
                label="Nueva Contraseña"
                type="password"
                placeholder="••••••••"
                error={passwordErrors.new_password?.message}
                {...registerPassword('new_password')}
              />

              <Input
                label="Confirmar Nueva Contraseña"
                type="password"
                placeholder="••••••••"
                error={passwordErrors.confirm_password?.message}
                {...registerPassword('confirm_password')}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowPasswordForm(false);
                    resetPasswordForm();
                  }}
                  disabled={isChangingPassword}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={<Lock className="h-4 w-4" />}
                  isLoading={isChangingPassword}
                >
                  Cambiar Contraseña
                </Button>
              </div>
            </form>
          </CardContent>
        )}
        {!showPasswordForm && (
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Mantén tu cuenta segura cambiando tu contraseña regularmente.
            </p>
          </CardContent>
        )}
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <Badge variant={transactionTypeColors[transaction.transaction_type]} size="sm">
                      {transactionTypeLabels[transaction.transaction_type]}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.product_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transaction.location_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.quantity > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">
                        {new Date(transaction.created_at).toLocaleDateString('es-CL', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-2 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/inventory/transactions')}
                >
                  Ver todo el historial
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay actividad reciente</p>
              <p className="text-sm mt-2">
                Tus transacciones y movimientos aparecerán aquí
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
