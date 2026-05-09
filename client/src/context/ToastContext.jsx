import React, { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext({ showToast: () => {} });

let counter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", message, duration = 4000 }) => {
      const id = ++counter;
      setToasts((prev) => [...prev, { id, type, message }]);
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
      return id;
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  const { type, message } = toast;
  const palette =
    type === "success"
      ? {
          bar: "bg-[#00d96f]",
          icon: SuccessIcon,
          iconBg: "bg-[#00d96f]/10 text-[#00a350] dark:text-[#00d96f]",
        }
      : type === "error"
        ? {
            bar: "bg-red-500",
            icon: ErrorIcon,
            iconBg: "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400",
          }
        : {
            bar: "bg-zinc-400 dark:bg-zinc-600",
            icon: InfoIcon,
            iconBg: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
          };
  const Icon = palette.icon;
  return (
    <div
      role="status"
      className="pointer-events-auto relative flex items-start gap-3 min-w-[280px] max-w-sm pl-4 pr-3 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] animate-[slideInRight_0.25s_ease-out]"
    >
      <span
        className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${palette.bar}`}
      />
      <span
        className={`shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md ${palette.iconBg}`}
      >
        <Icon />
      </span>
      <p className="flex-1 pt-0.5 text-sm leading-snug text-[#0a0a0a] dark:text-white">
        {message}
      </p>
      <button
        onClick={onDismiss}
        className="shrink-0 -mr-1 -mt-1 p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        aria-label="Dismiss"
      >
        <svg
          viewBox="0 0 14 14"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M1 1l12 12M13 1L1 13" />
        </svg>
      </button>
    </div>
  );
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42L8.5 12.08l6.79-6.79a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-13a1 1 0 011 1v4a1 1 0 11-2 0V6a1 1 0 011-1zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}
