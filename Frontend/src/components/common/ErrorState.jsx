import { AlertTriangle } from 'lucide-react';

/**
 * ErrorState — Displays an error message with optional retry.
 * Never exposes raw stack traces.
 */
export default function ErrorState({ message = 'Something went wrong.', onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-sm text-slate-700 font-medium mb-1">Error</p>
      <p className="text-sm text-slate-500 text-center max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors focus-ring"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
