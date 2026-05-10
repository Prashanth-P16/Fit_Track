import { DINNER_OPTIONS } from '../../constants/meals';
import type { DinnerOption } from '../../constants/meals';

interface DinnerDropdownProps {
  selected: string | null;
  customDinner: { name: string; cal: number; protein: number } | null;
  onSelect: (option: DinnerOption) => void;
  onCustomChange: (field: 'name' | 'cal' | 'protein', value: string) => void;
}

export function DinnerDropdown({
  selected,
  customDinner,
  onSelect,
  onCustomChange,
}: DinnerDropdownProps) {
  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-3">
      <label className="text-xs text-slate-400 mb-2 block">Dinner Selection</label>
      <select
        value={selected || ''}
        onChange={(e) => {
          const opt = DINNER_OPTIONS.find((o) => o.id === e.target.value);
          if (opt) onSelect(opt);
        }}
        className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white focus:border-emerald-400/50 focus:outline-none appearance-none"
      >
        <option value="">Select dinner</option>
        {DINNER_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label} — {opt.cal} kcal / {opt.protein}g protein
          </option>
        ))}
      </select>

      {selected === 'other' && (
        <div className="mt-3 space-y-2">
          <input
            type="text"
            placeholder="Meal name"
            value={customDinner?.name || ''}
            onChange={(e) => onCustomChange('name', e.target.value)}
            className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Calories"
              value={customDinner?.cal || ''}
              onChange={(e) => onCustomChange('cal', e.target.value)}
              className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Protein (g)"
              value={customDinner?.protein || ''}
              onChange={(e) => onCustomChange('protein', e.target.value)}
              className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-400/50 focus:outline-none"
            />
          </div>
        </div>
      )}

      {selected && selected !== 'other' && (
        <div className="mt-2 flex gap-3">
          <span className="text-xs text-emerald-400">
            {DINNER_OPTIONS.find((o) => o.id === selected)?.cal} kcal
          </span>
          <span className="text-xs text-blue-400">
            {DINNER_OPTIONS.find((o) => o.id === selected)?.protein}g protein
          </span>
        </div>
      )}
    </div>
  );
}
