import React from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console for debugging
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-white/40 gap-4 p-4">
            <div className="size-20 rounded-full border-2 border-dashed border-red-500/30 flex items-center justify-center">
              <AlertCircle size={32} className="text-red-500/60" />
            </div>
            <div className="text-center max-w-sm">
              <p className="font-black uppercase tracking-widest text-sm mb-2">
                Display Error
              </p>
              <p className="text-xs text-white/30 font-mono break-all">
                {this.state.error?.message || "An unknown error occurred"}
              </p>
              <p className="text-xs text-white/20 mt-3">
                Attempting to recover...
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
