import React, { Component, type ReactNode, type ErrorInfo } from 'react';

import { View, Text, TouchableOpacity } from 'react-native';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export interface ErrorFallbackProps {
  error: Error;
  retry: () => void;
}

/**
 * Error boundary component that catches JavaScript errors anywhere in the child component tree
 * Note: Error boundaries must be class components as React doesn't provide hooks for this functionality yet
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo.componentStack);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback: FallbackComponent } = this.props;

    if (hasError && error) {
      if (FallbackComponent) {
        return <FallbackComponent error={error} retry={this.resetError} />;
      }

      return <DefaultErrorFallback error={error} retry={this.resetError} />;
    }

    return children;
  }
}

/**
 * Default error fallback UI using NativeWind styling
 */
function DefaultErrorFallback({ error, retry }: ErrorFallbackProps) {
  return (
    <View className="flex-1 items-center justify-center bg-background p-5">
      <View className="w-full max-w-sm rounded-2xl bg-card p-6">
        <Text className="mb-2 text-center text-2xl font-bold text-foreground">
          Oops! Something went wrong
        </Text>
        <Text className="mb-6 text-center text-base text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </Text>
        <TouchableOpacity
          onPress={retry}
          className="rounded-xl bg-primary px-6 py-3"
          activeOpacity={0.8}>
          <Text className="text-center text-base font-semibold text-primary-foreground">
            Try Again
          </Text>
        </TouchableOpacity>
        {__DEV__ && (
          <Text className="mt-4 font-mono text-xs text-muted-foreground">{error.stack}</Text>
        )}
      </View>
    </View>
  );
}

/**
 * Functional wrapper for ErrorBoundary to make it easier to use with modern React patterns
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Hook to throw errors that will be caught by the nearest error boundary
 * Useful for handling async errors in functional components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}
