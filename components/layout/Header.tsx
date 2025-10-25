'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getRoleDisplayName } from '@/lib/constants/permissions';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side - Menu button */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Abrir menú"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Right side - Notifications & User menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            {/* Notification badge */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {/* Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>

              {/* User info - hidden on mobile */}
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.full_name || 'Usuario'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role ? getRoleDisplayName(user.role) : 'Rol'}
                </div>
              </div>

              <ChevronDown
                className={cn(
                  'w-4 h-4 text-gray-500 transition-transform hidden md:block',
                  showUserMenu && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <>
                {/* Backdrop for mobile */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                  {/* User info - visible in dropdown */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.full_name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {user?.email}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {user?.role ? getRoleDisplayName(user.role) : ''}
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push('/settings/profile');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Mi perfil
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push('/settings');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Configuración
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="py-1 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
