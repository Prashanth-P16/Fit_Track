import React from 'react';

interface LockedFieldProps {
  state: 'active' | 'locked' | 'upcoming' | 'missed' | 'not_yet' | 'not_available';
  message: string;
  value?: string;
  icon?: string;
  children?: React.ReactNode;
}

export function LockedField({ state, message, value, icon, children }: LockedFieldProps) {
  // ACTIVE state - show children normally
  if (state === 'active') {
    return (
      <div className="border border-[#1e1e2e] rounded-lg bg-[#0a0a0f] text-white">
        {children}
      </div>
    );
  }

  // LOCKED state (completed) - show value and message
  if (state === 'locked') {
    return (
      <div className="bg-[#00e5a0]/10 border border-[#00e5a0]/30 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            {value && <span className="text-[#00e5a0] font-medium">{value}</span>}
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-1">{message}</p>
        <style>{`
          .locked-field-locked { cursor: not-allowed; }
        `}</style>
      </div>
    );
  }

  // UPCOMING / NOT_YET state
  if (state === 'upcoming' || state === 'not_yet') {
    return (
      <div className="bg-[#1a1a2e] border border-[#1e1e2e] rounded-lg p-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏰</span>
          <p className="text-slate-400 text-sm">{message}</p>
        </div>
      </div>
    );
  }

  // MISSED state
  if (state === 'missed') {
    return (
      <div className="bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-[#ff6b35] font-medium text-sm">Not logged</p>
            <p className="text-slate-400 text-xs mt-0.5">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  // NOT_AVAILABLE state
  if (state === 'not_available') {
    return (
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-lg p-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔒</span>
          <p className="text-slate-400 text-sm">{message}</p>
        </div>
      </div>
    );
  }

  return null;
}
