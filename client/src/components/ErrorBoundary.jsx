import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (typeof window !== "undefined" && window.console) {
      console.error("ErrorBoundary caught:", error, info);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.assign("/");
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-6 py-20">
          <div className="text-center max-w-md">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 mb-6">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0a0a0a] dark:text-white">
              Something went wrong
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              The page hit an unexpected error. Don&apos;t worry — your saved
              resumes are safe.
            </p>
            {this.state.error?.message && (
              <p className="mt-4 px-3 py-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-left">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.reset}
              className="mt-6 px-5 py-2.5 text-sm font-semibold text-black bg-[#00d96f] hover:bg-[#00c463] rounded-lg shadow-sm transition-colors"
            >
              Back to home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
