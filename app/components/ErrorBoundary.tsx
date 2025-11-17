import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <img src="/icons/warning.svg" alt="Error" className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try again.
        </p>
        <details className="mb-6 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 mb-2">
            Technical details
          </summary>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
        <button
          onClick={resetError}
          className="primary-button w-full"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

// Specific error display components
export const ErrorAlert: React.FC<{ 
  title?: string; 
  message: string; 
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}> = ({ 
  title = 'Error', 
  message, 
  onDismiss,
  type = 'error' 
}) => {
  const bgColor = {
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200', 
    info: 'bg-blue-50 border-blue-200'
  }[type];

  const textColor = {
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  }[type];

  const iconSrc = {
    error: '/icons/warning.svg',
    warning: '/icons/warning.svg',
    info: '/icons/check.svg'
  }[type];

  return (
    <div className={`rounded-lg border p-4 ${bgColor}`}>
      <div className="flex items-start">
        <img src={iconSrc} alt={type} className="w-5 h-5 mt-0.5 mr-3" />
        <div className="flex-1">
          <h3 className={`font-semibold ${textColor}`}>{title}</h3>
          <p className={`text-sm mt-1 ${textColor}`}>{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export const NetworkErrorFallback: React.FC<{ 
  onRetry: () => void;
  message?: string;
}> = ({ onRetry, message = "Unable to connect. Please check your internet connection." }) => {
  return (
    <div className="text-center p-8">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <img src="/icons/warning.svg" alt="Network Error" className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <button onClick={onRetry} className="primary-button">
        Try Again
      </button>
    </div>
  );
};

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: string;
}> = ({ title, description, actionLabel, onAction, illustration = "/images/empty-state.svg" }) => {
  return (
    <div className="text-center p-12">
      <img 
        src={illustration} 
        alt={title} 
        className="w-32 h-32 mx-auto mb-6 opacity-50"
        onError={(e) => {
          // Fallback to a simple div if image doesn't exist
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="primary-button">
          {actionLabel}
        </button>
      )}
    </div>
  );
};