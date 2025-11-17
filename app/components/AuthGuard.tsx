import { useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { usePuterStore } from '~/lib/puter';
import { LoadingSkeleton } from '~/components/LoadingSkeleton';
import { ErrorAlert } from '~/components/ErrorBoundary';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

export const AuthGuard = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth',
  fallback 
}: AuthGuardProps) => {
  const { auth, isLoading, error, puterReady } = usePuterStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!puterReady || isLoading) return;

    if (requireAuth && !auth.isAuthenticated) {
      const searchParams = new URLSearchParams();
      searchParams.set('next', location.pathname + location.search);
      navigate(`${redirectTo}?${searchParams.toString()}`);
    } else if (!requireAuth && auth.isAuthenticated) {
      // If user is already authenticated and tries to access auth page
      navigate('/');
    }
  }, [auth.isAuthenticated, isLoading, puterReady, requireAuth, navigate, location, redirectTo]);

  // Show loading state while Puter is initializing
  if (!puterReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSkeleton variant="circle" width="w-16" height="h-16" className="mx-auto mb-4" />
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (isLoading) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSkeleton variant="circle" width="w-16" height="h-16" className="mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6">
          <ErrorAlert 
            title="Authentication Error"
            message={error}
            onDismiss={() => window.location.reload()}
          />
          <div className="mt-4 text-center">
            <button 
              onClick={() => window.location.reload()}
              className="primary-button"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check authentication requirements
  if (requireAuth && !auth.isAuthenticated) {
    // This will trigger the redirect in useEffect, but show loading in the meantime
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSkeleton variant="circle" width="w-16" height="h-16" className="mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!requireAuth && auth.isAuthenticated) {
    // This will trigger the redirect in useEffect, but show loading in the meantime
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSkeleton variant="circle" width="w-16" height="h-16" className="mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Hook for easier authentication checks
export const useAuthCheck = () => {
  const { auth, isLoading, error, puterReady } = usePuterStore();
  
  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: isLoading || !puterReady,
    error,
    user: auth.user,
    signIn: auth.signIn,
    signOut: auth.signOut,
    ready: puterReady && !isLoading
  };
};

// Component to show user info in navbar
export const UserProfile = ({ className = '' }: { className?: string }) => {
  const { auth } = usePuterStore();
  
  if (!auth.isAuthenticated || !auth.user) return null;
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
        {auth.user.username.charAt(0).toUpperCase()}
      </div>
      <div className="hidden sm:block">
        <p className="text-sm font-medium text-gray-900">
          {auth.user.username}
        </p>
        <p className="text-xs text-gray-500">
          Signed in
        </p>
      </div>
    </div>
  );
};