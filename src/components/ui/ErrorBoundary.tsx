import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0b0d0c] text-[#f0f4f1] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#131715] border border-red-900/50 rounded-2xl p-6 text-center space-y-4 shadow-xl">
            <div className="inline-flex p-3 bg-red-950/60 text-red-400 rounded-full border border-red-800/60">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-[#f0f4f1]">Something went wrong</h1>
            <p className="text-sm text-[#95a39a]">
              The application encountered an unexpected runtime state. Your local data remains safe.
            </p>
            {this.state.error?.message && (
              <pre className="p-3 bg-[#0d100e] border border-[#232c26] rounded-xl text-left text-xs text-red-300 overflow-x-auto">
                {this.state.error.message}
              </pre>
            )}
            <div className="pt-2">
              <Button variant="primary" onClick={this.handleReset} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" /> Reload Application
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
