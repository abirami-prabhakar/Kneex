import { Loader2 } from 'lucide-react';

/**
 * LoadingState — Displays a loading indicator with a message.
 * Used for API operations: analyzing, generating, submitting, etc.
 */
export default function LoadingState({ message = 'Loading...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
      <p className="text-sm text-slate-500 font-medium">{message}</p>
    </div>
  );
}
