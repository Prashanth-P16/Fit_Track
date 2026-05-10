import { Check, X, Clock, RotateCcw } from 'lucide-react';

interface SuggestionCardProps {
  suggestion: string;
  category: string;
  date: string;
  responseType: string;
  rejectionReason?: string;
  userFeedback?: string;
  weightBefore?: number;
  weightAfter?: number;
  onResponse: (response: 'implementing' | 'will_do' | 'rejected') => void;
  onRejectionReason: (reason: string) => void;
  onFeedback: (feedback: string) => void;
}

export function SuggestionCard({
  suggestion,
  category,
  date,
  responseType,
  rejectionReason,
  userFeedback,
  weightBefore,
  weightAfter,
  onResponse,
  onRejectionReason,
  onFeedback,
}: SuggestionCardProps) {
  const categoryColor: Record<string, string> = {
    diet: 'text-amber-400 bg-amber-400/10',
    gym: 'text-emerald-400 bg-emerald-400/10',
    sleep: 'text-blue-400 bg-blue-400/10',
    water: 'text-cyan-400 bg-cyan-400/10',
    supplement: 'text-orange-400 bg-orange-400/10',
  };

  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColor[category] || 'text-slate-400 bg-slate-400/10'}`}>
          {category}
        </span>
        <span className="text-xs text-slate-500">{date}</span>
      </div>

      <p className="text-sm text-white leading-relaxed">{suggestion}</p>

      {weightBefore && weightAfter && (
        <div className="flex gap-4 text-xs">
          <span className="text-slate-400">Before: {weightBefore}kg</span>
          <span className="text-slate-400">After: {weightAfter}kg</span>
          <span className={weightAfter < weightBefore ? 'text-emerald-400' : 'text-red-400'}>
            {weightAfter < weightBefore ? '' : '+'}
            {(weightAfter - weightBefore).toFixed(1)}kg
          </span>
        </div>
      )}

      {responseType === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => onResponse('implementing')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400/10 text-emerald-400 text-xs font-medium hover:bg-emerald-400/20 transition-colors"
          >
            <Check className="w-3 h-3" /> Implementing
          </button>
          <button
            onClick={() => onResponse('will_do')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-400 text-xs font-medium hover:bg-amber-400/20 transition-colors"
          >
            <Clock className="w-3 h-3" /> Next week
          </button>
          <button
            onClick={() => onResponse('rejected')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-400/10 text-red-400 text-xs font-medium hover:bg-red-400/20 transition-colors"
          >
            <X className="w-3 h-3" /> Not doing
          </button>
        </div>
      )}

      {responseType === 'rejected' && !rejectionReason && (
        <input
          type="text"
          placeholder="Why not? (optional)"
          onBlur={(e) => e.target.value && onRejectionReason(e.target.value)}
          className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none"
        />
      )}

      {responseType === 'implementing' && !userFeedback && (
        <div>
          <input
            type="text"
            placeholder="What happened after? (optional)"
            onBlur={(e) => e.target.value && onFeedback(e.target.value)}
            className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none"
          />
        </div>
      )}

      {responseType !== 'pending' && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <RotateCcw className="w-3 h-3" />
          <span className="capitalize">{responseType.replace('_', ' ')}</span>
        </div>
      )}
    </div>
  );
}
