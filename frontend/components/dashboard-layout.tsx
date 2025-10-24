"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import {
  Heart,
  User,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  description?: string;
  component?: React.ComponentType;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: "patient" | "doctor" | "ngo" | "government" | "pharma";
  userName: string;
  userTitle?: string;
  navigation: NavigationItem[];
  activeService?: string;
  onServiceChange?: (serviceName: string) => void;
}

const userTypeConfig = {
  patient: {
    title: "Patient Portal",
    color: "bg-primary/20 text-primary",
  },
  doctor: {
    title: "Medical Practice",
    color: "bg-secondary/20 text-secondary",
  },
  ngo: {
    title: "NGO Dashboard",
    color: "bg-accent/20 text-accent-foreground",
  },
  government: {
    title: "Government Portal",
    color: "bg-primary/20 text-primary",
  },
  pharma: {
    title: "Pharma Portal",
    color: "bg-secondary/20 text-secondary",
  },
};

export function DashboardLayout({
  children,
  userType,
  userName,
  userTitle,
  navigation,
  activeService,
  onServiceChange,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const config = userTypeConfig[userType];

  const handleServiceClick = (serviceName: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onServiceChange) {
      onServiceChange(serviceName);
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and redirect regardless of API response
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      apiClient.clearToken();
      window.location.href = "/auth";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-foreground">
                MediSphere™
              </span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* <div className="p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${config.color}`}
              >
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{userName}</p>
                {userTitle && (
                  <p className="text-sm text-muted-foreground">{userTitle}</p>
                )}
                <Badge variant="default" className="text-xs mt-1">
                  {config.title}
                </Badge>
              </div>
            </div>
          </div> */}

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="mb-4">
              <button
                onClick={(e) => handleServiceClick("overview", e)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors w-full text-left ${
                  activeService === "overview" || !activeService
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/50"
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard Overview</span>
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                Services
              </p>
              {navigation.map((item, index) => (
                <button
                  key={index}
                  onClick={(e) =>
                    handleServiceClick(
                      item.name.toLowerCase().replace(/[™\s]/g, ""),
                      e
                    )
                  }
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors group w-full text-left ${
                    activeService ===
                    item.name.toLowerCase().replace(/[™\s]/g, "")
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="default" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-border">
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:pl-72">
        <header className="bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-4 ml-auto">
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}
                  >
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground hidden sm:block">
                    {userName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>

        {/* Footer */}
        {/* <Footer /> */}
      </div>
    </div>
  );
}
