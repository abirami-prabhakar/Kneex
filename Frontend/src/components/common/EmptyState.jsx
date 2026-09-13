import { Inbox } from 'lucide-react';

/**
 * EmptyState — Displays when no data is available.
 */
export default function EmptyState({ title = 'No data', message = '', icon: Icon = Inbox, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm text-slate-700 font-medium mb-1">{title}</p>
      {message && (
        <p className="text-sm text-slate-500 text-center max-w-md">{message}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
