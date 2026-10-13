import React, { useState } from 'react';
import { LayoutGrid, X } from 'lucide-react';
import { RAW_1974_SPEC, getCategoryStatus } from '../data/survey1974';
import { MatrixFilter, SurveyRowData } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CategoryMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  answers: Record<number, SurveyRowData>;
  onSelectCategory: (cat: string) => void;
}

export const CategoryMatrixModal: React.FC<CategoryMatrixModalProps> = ({
  isOpen,
  onClose,
  answers,
  onSelectCategory,
}) => {
  const { language, t, tCategory } = useLanguage();
  const [filter, setFilter] = useState<MatrixFilter>('all');

  if (!isOpen) return null;

  let completeCount = 0;
  const categoryStats = RAW_1974_SPEC.map((spec) => {
    const stat = getCategoryStatus(spec, answers);
    if (stat.isComplete) completeCount++;
    return { spec, stat };
  });

  const percent = Math.round((completeCount / RAW_1974_SPEC.length) * 100);

  const filteredStats = categoryStats.filter(({ stat }) => {
    if (filter === 'incomplete') return !stat.isComplete;
    if (filter === 'complete') return stat.isComplete;
    return true;
  });

  return (
    <div
      id="categoryMatrixModal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="matrixModalTitle"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-panelbg border border-slate-700 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 id="matrixModalTitle" className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-sky-400" />
              <span>{t('matrixModalTitle')}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{t('matrixModalSubtitle')}</p>
          </div>
          <button
            id="closeMatrixModalBtn"
            onClick={onClose}
            aria-label={t('closeModal')}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-900/60">
          <div className="flex items-center gap-2" role="group" aria-label="Matrix filter options">
            <button
              id="filterAllMatrixBtn"
              type="button"
              onClick={() => setFilter('all')}
              aria-label={t('filterAll')}
              aria-pressed={filter === 'all'}
              className={`px-2.5 py-1 min-h-[32px] rounded font-medium transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {t('filterAll')}
            </button>
            <button
              id="filterIncompleteMatrixBtn"
              type="button"
              onClick={() => setFilter('incomplete')}
              aria-label={t('filterIncomplete')}
              aria-pressed={filter === 'incomplete'}
              className={`px-2.5 py-1 min-h-[32px] rounded font-medium transition cursor-pointer ${
                filter === 'incomplete'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {t('filterIncomplete')}
            </button>
            <button
              id="filterCompleteMatrixBtn"
              type="button"
              onClick={() => setFilter('complete')}
              aria-label={t('filterComplete')}
              aria-pressed={filter === 'complete'}
              className={`px-2.5 py-1 min-h-[32px] rounded font-medium transition cursor-pointer ${
                filter === 'complete'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {t('filterComplete')}
            </button>
          </div>
          <span id="matrixPercentBadge" className="font-mono text-emerald-300 font-bold" aria-live="polite">
            {t('matrixPercent', {
              percent,
              completed: completeCount,
              total: RAW_1974_SPEC.length,
            })}
          </span>
        </div>

        <div id="categoryMatrixGrid" role="list" aria-label={t('matrixModalTitle')} className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {filteredStats.map(({ spec, stat }) => {
            const pct = stat.total > 0 ? Math.round((stat.filled / stat.total) * 100) : 0;
            const localizedCatName =
              language === 'en'
                ? spec.name_en || tCategory(spec.cat)
                : spec.name_ja || spec.cat;

            return (
              <button
                key={spec.cat}
                type="button"
                role="listitem"
                onClick={() => onSelectCategory(spec.cat)}
                aria-label={`${localizedCatName}: ${stat.filled}/${stat.total} (${pct}%)`}
                className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between text-left w-full focus:outline-none focus:ring-1 focus:ring-sky-400 min-h-[64px] ${
                  stat.isComplete
                    ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400'
                    : stat.isStarted
                    ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col space-y-1">
                  <span className="font-semibold text-slate-200">
                    {stat.isComplete ? '✅' : stat.isStarted ? '⏳' : '⚪'} {localizedCatName}
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono">
                    {t('matrixCardSubtext', {
                      start: spec.ids[0],
                      end: spec.ids[spec.ids.length - 1],
                      count: spec.ids.length,
                    })}
                  </span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span
                    className={`font-mono text-xs font-bold ${
                      stat.isComplete ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {stat.filled} / {stat.total}
                  </span>
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full ${stat.isComplete ? 'bg-emerald-500' : 'bg-sky-500'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
