'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check if already on login page
    if (pathname === '/admin/login' || pathname === '/admin/signup') {
      setIsLoading(false);
      setIsAuthenticated(true); // Allow access to login/signup pages
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const result = await response.json();
          if (result.user) {
            setIsAuthenticated(true);
          } else {
            // Redirect to login if not authenticated
            router.replace('/admin/login');
            return;
          }
        } else {
          // If verification fails, redirect to login
          router.replace('/admin/login');
          return;
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // If error occurs, redirect to login
        router.replace('/admin/login');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Allow access to login/signup pages without authentication
  if (pathname === '/admin/login' || pathname === '/admin/signup') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}