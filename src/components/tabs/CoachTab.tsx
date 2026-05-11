import { useState, useCallback, useEffect } from 'react';
import { Bot, Copy, StickyNote } from 'lucide-react';
import { useDay } from '../../hooks/useDay';
import { useSettings } from '../../hooks/useSettings';
import { supabase } from '../../lib/supabase';
import { SuggestionCard } from '../ui/SuggestionCard';

interface Suggestion {
  id: string;
  suggested_date: string;
  week_number: number;
  suggestion: string;
  category: string;
  response_type: string;
  rejection_reason: string | null;
  user_feedback: string | null;
  weight_before: number | null;
  weight_after: number | null;
  keep_change: boolean | null;
}

export function CoachTab() {
  const { log, loading, updateLog } = useDay();
  const { settings, targets } = useSettings();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(log?.ai_analysis || '');
  const [score, setScore] = useState(log?.ai_score || null);
  const [notes, setNotes] = useState(log?.notes || '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (log?.ai_analysis) setAnalysis(log.ai_analysis);
    if (log?.ai_score) setScore(log.ai_score);
    if (log?.notes) setNotes(log.notes);
  }, [log]);

  const fetchSuggestions = useCallback(async () => {
    const { data } = await supabase
      .from('suggestion_tracker')
      .select('*')
      .order('suggested_date', { ascending: false });
    if (data) setSuggestions(data as Suggestion[]);
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleAnalyze = useCallback(async () => {
    if (!log) return;
    setAnalyzing(true);

    try {
      const { data: weekHistory } = await supabase
        .from('daily_logs')
        .select('*')
        .gte('date', new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0])
        .order('date', { ascending: true });

      const { data: suggestionHistory } = await supabase
        .from('suggestion_tracker')
        .select('*')
        .order('suggested_date', { ascending: false })
        .limit(5);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          dayData: log,
          weekHistory: weekHistory || [],
          settings: settings || targets,
          suggestionHistory: suggestionHistory || [],
        }),
      });

      const result = await response.json();
      if (result.analysis) {
        setAnalysis(result.analysis);
        const scoreMatch = result.analysis.match(/(\d+)\/10/);
        const parsedScore = scoreMatch ? parseInt(scoreMatch[1]) : null;
        setScore(parsedScore);
        await updateLog({
          ai_analysis: result.analysis,
          ai_score: parsedScore,
        });
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      setAnalysis('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }, [log, settings, targets, updateLog]);

  const handleExportAllJSON = useCallback(async () => {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Export failed:', error);
      return;
    }

    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleNotesSave = useCallback(async () => {
    await updateLog({ notes });
  }, [notes, updateLog]);

  const handleSuggestionResponse = useCallback(
    async (suggestionId: string, response: 'implementing' | 'will_do' | 'rejected') => {
      await supabase
        .from('suggestion_tracker')
        .update({ response_type: response })
        .eq('id', suggestionId);
      fetchSuggestions();
    },
    [fetchSuggestions]
  );

  const handleRejectionReason = useCallback(async (suggestionId: string, reason: string) => {
    await supabase
      .from('suggestion_tracker')
      .update({ rejection_reason: reason })
      .eq('id', suggestionId);
  }, []);

  const handleFeedback = useCallback(async (suggestionId: string, feedback: string) => {
    await supabase
      .from('suggestion_tracker')
      .update({ user_feedback: feedback, user_feedback_date: new Date().toISOString().split('T')[0] })
      .eq('id', suggestionId);
  }, []);

  const handleKeepChange = useCallback(async (suggestionId: string, keep: boolean) => {
    await supabase
      .from('suggestion_tracker')
      .update({ keep_change: keep })
      .eq('id', suggestionId);
    fetchSuggestions();
  }, [fetchSuggestions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pb-28 space-y-4">
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
        <h3 className="text-xs text-slate-400 mb-2">Today's Summary</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-[#0a0a0f] rounded-lg">
            <p className="text-lg font-bold text-white">{log?.water || 0}</p>
            <p className="text-[10px] text-slate-500">Water ml</p>
          </div>
          <div className="p-2 bg-[#0a0a0f] rounded-lg">
            <p className="text-lg font-bold text-white">{log?.weight || '—'}</p>
            <p className="text-[10px] text-slate-500">Weight kg</p>
          </div>
          <div className="p-2 bg-[#0a0a0f] rounded-lg">
            <p className="text-lg font-bold text-white">{log?.ai_score || '—'}</p>
            <p className="text-[10px] text-slate-500">Score</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={analyzing}
        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-400 text-[#0a0a0f] text-sm font-medium rounded-xl hover:bg-emerald-300 transition-colors disabled:opacity-50"
      >
        {analyzing ? (
          <div className="w-4 h-4 border-2 border-[#0a0a0f] border-t-transparent rounded-full animate-spin" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
        {analyzing ? 'Analyzing...' : 'Analyze My Day'}
      </button>

      {analysis && (
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs text-slate-400">AI Analysis</h3>
            {score && (
              <span className="text-sm font-bold text-emerald-400">{score}/10</span>
            )}
          </div>
          <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{analysis}</p>
        </div>
      )}

      <button
        onClick={handleExportAllJSON}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1e1e2e] text-slate-400 text-xs font-medium rounded-xl hover:text-white transition-colors"
      >
        <Copy className="w-3.5 h-3.5" />
        {copied ? 'Copied!' : 'Export All Data as JSON'}
      </button>

      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <StickyNote className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs text-slate-400">Daily Notes</h3>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observations, how you feel, energy levels..."
          rows={3}
          className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none resize-none"
        />
        <button
          onClick={handleNotesSave}
          className="mt-2 px-4 py-1.5 bg-amber-400/10 text-amber-400 text-xs rounded-lg hover:bg-amber-400/20 transition-colors"
        >
          Save Notes
        </button>
      </div>

      <div>
        <h3 className="text-xs text-slate-400 mb-2">Coach Memory</h3>
        <div className="space-y-2">
          {suggestions.map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s.suggestion}
              category={s.category}
              date={s.suggested_date}
              responseType={s.response_type}
              rejectionReason={s.rejection_reason || undefined}
              userFeedback={s.user_feedback || undefined}
              weightBefore={s.weight_before || undefined}
              weightAfter={s.weight_after || undefined}
              keepChange={s.keep_change}
              onResponse={(response) => handleSuggestionResponse(s.id, response)}
              onRejectionReason={(reason) => handleRejectionReason(s.id, reason)}
              onFeedback={(feedback) => handleFeedback(s.id, feedback)}
              onKeepChange={(keep) => handleKeepChange(s.id, keep)}
            />
          ))}
          {suggestions.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">No suggestions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
