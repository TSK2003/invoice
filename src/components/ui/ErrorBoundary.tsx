import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full p-6 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-brand text-white hover:bg-brand-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
