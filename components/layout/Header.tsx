"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getRoleDisplayName } from "@/lib/constants/permissions";
import { cn } from "@/lib/utils/cn";
import { NotificationDropdown } from "@/components/notifications";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Separator } from "@/components/ui/Separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Left side - Menu button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Page title area - can be customized per page */}
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-foreground">
              Panel de Control
            </h1>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Theme toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {theme === "light" ? "Modo oscuro" : "Modo claro"}
            </TooltipContent>
          </Tooltip>

          {/* Notifications */}
          <NotificationDropdown />

          <Separator orientation="vertical" className="mx-2 h-6" />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors",
                "hover:bg-accent",
                showUserMenu && "bg-accent"
              )}
            >
              {/* Avatar */}
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(user?.full_name)}
                </AvatarFallback>
              </Avatar>

              {/* User info - hidden on mobile */}
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-foreground">
                  {user?.full_name || "Usuario"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.role ? getRoleDisplayName(user.role) : "Rol"}
                </p>
              </div>

              <ChevronDown
                className={cn(
                  "hidden h-4 w-4 text-muted-foreground transition-transform md:block",
                  showUserMenu && "rotate-180"
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
                <div className="absolute right-0 z-20 mt-2 w-56 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
                  <div className="rounded-lg border bg-popover p-1 shadow-lg">
                    {/* User info - visible in dropdown */}
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-foreground">
                        {user?.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                      <p className="mt-1 text-xs font-medium text-primary">
                        {user?.role ? getRoleDisplayName(user.role) : ""}
                      </p>
                    </div>

                    <Separator className="my-1" />

                    {/* Menu items */}
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          router.push("/settings/profile");
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <User className="h-4 w-4" />
                        Mi perfil
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          router.push("/settings");
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <Settings className="h-4 w-4" />
                        Configuracion
                      </button>
                    </div>

                    <Separator className="my-1" />

                    {/* Logout */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesion
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
