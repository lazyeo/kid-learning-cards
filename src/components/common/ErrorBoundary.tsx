import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-red-50 rounded-3xl border-2 border-red-100 m-4">
          <div className="bg-white p-4 rounded-full shadow-sm mb-6">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">哎呀，出错了！</h2>
          <p className="text-gray-600 mb-8 max-w-md">
            别担心，这只是个小故障。我们可以试着重新加载页面。
          </p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              刷新页面
            </Button>
            <Button
              variant="primary"
              onClick={() => this.setState({ hasError: false })}
            >
              重试
            </Button>
          </div>
          {import.meta.env.DEV && (
            <pre className="mt-8 p-4 bg-gray-800 text-red-200 rounded-lg text-left text-xs overflow-auto max-w-full w-full">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
