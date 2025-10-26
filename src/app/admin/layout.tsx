'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { AuthGuard } from '@/components/auth-guard';
import {
  LayoutDashboard,
  LogOut,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't show sidebar for login and signup pages
  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/signup';

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Logged out successfully');
        window.location.href = '/admin/login';
      } else {
        toast.error('Failed to logout');
      }
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  // For auth pages, just return children without AuthGuard and sidebar
  if (isAuthPage) {
    return <>{children}</>;
  }

  // For admin pages, wrap with AuthGuard and show responsive sidebar
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="flex relative">
          {/* Sidebar */}
          <div className={cn(
            "fixed md:static w-64 bg-card border-r shadow-sm min-h-screen transition-all duration-300 z-50",
            isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"
          )}>
            <div className="p-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">SmartDine</h1>
                <p className="text-sm text-muted-foreground mt-1">Admin Panel</p>
              </div>
              <ThemeToggle />
            </div>
            
            <nav className="px-4 pb-6">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                        onClick={() => isMobile && setSidebarOpen(false)}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Logout Button */}
            <div className="px-4 pb-6 mt-auto">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 md:ml-0">
            {/* Header with hamburger menu for mobile */}
            <header className="bg-card border-b shadow-sm p-4 md:hidden">
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
                <h2 className="text-lg font-semibold">Admin Panel</h2>
                <div className="w-9" /> {/* Spacer for balance */}
              </div>
            </header>
            
            <main className="flex-1">
              {children}
            </main>
          </div>

          {/* Mobile sidebar overlay */}
          {isMobile && sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}