import React, { useRef, useEffect, useState, useMemo } from 'react';
import { LayoutGrid, ChevronsRight, Copy, Download, FileText, RotateCcw, Check } from 'lucide-react';
import { RAW_1974_SPEC, FULL_1974_SCHEMA, getCategoryStatus } from '../data/survey1974';
import { SurveyItem, SurveyRowData, createDefaultSurveyRowData } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface SurveyRowItemProps {
  item: SurveyItem;
  idx: number;
  isActive: boolean;
  rowData: SurveyRowData;
  onSelectRow: (idx: number) => void;
  onToggleNeverEaten: (id: number) => void;
  onSetFrequency: (id: number, freq: number) => void;
  onToggleOccasionOutStore: (id: number) => void;
  onResetRow: (id: number) => void;
  language: 'en' | 'ja';
  t: (key: string, params?: Record<string, string | number>) => string;
}

function areSurveyRowPropsEqual(prev: SurveyRowItemProps, next: SurveyRowItemProps): boolean {
  return (
    prev.item.id === next.item.id &&
    prev.idx === next.idx &&
    prev.isActive === next.isActive &&
    prev.language === next.language &&
    prev.rowData.never_eaten === next.rowData.never_eaten &&
    prev.rowData.frequency === next.rowData.frequency &&
    prev.rowData.occasion_out_store === next.rowData.occasion_out_store &&
    prev.onSelectRow === next.onSelectRow &&
    prev.onToggleNeverEaten === next.onToggleNeverEaten &&
    prev.onSetFrequency === next.onSetFrequency &&
    prev.onToggleOccasionOutStore === next.onToggleOccasionOutStore &&
    prev.onResetRow === next.onResetRow
  );
}

// Frozen constant for unentered rows to avoid object allocations
const DEFAULT_ROW_DATA: SurveyRowData = Object.freeze(createDefaultSurveyRowData());

// Memoized row component for maximum input responsiveness and sub-16ms INP
const SurveyRowItem = React.memo<SurveyRowItemProps>(
  ({
    item,
    idx,
    isActive,
    rowData,
    onSelectRow,
    onToggleNeverEaten,
    onSetFrequency,
    onToggleOccasionOutStore,
    onResetRow,
    language,
    t,
  }) => {
    const itemNumber = `#${String(item.id || (item as any).rowNumber || '').padStart(4, '0')}`;

    return (
      <div
        id={`entry-row-${idx}`}
        data-idx={idx}
        data-id={item.id}
        role="group"
        aria-label={`Survey item ${itemNumber}`}
        onClick={() => onSelectRow(idx)}
        className={`entry-row p-3 rounded-xl border transition-all cursor-pointer flex flex-col space-y-2.5 select-none notranslate min-h-[140px] sm:min-h-[128px] ${
          isActive
            ? 'active-row border-sky-400 bg-sky-950/40 ring-1 ring-sky-400/40 shadow-lg'
            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
        }`}
      >
        {/* Row Header: 4-Digit Item Code & Current State Summary Indicators */}
        <div className="flex items-center justify-between gap-2 min-h-[38px] h-[38px]">
          <div
            className="flex items-center min-w-0"
            aria-label={`Survey item ${itemNumber}`}
          >
            <span
              className={`font-mono text-2xl font-black tracking-wider px-3 py-1 rounded-md border transition-colors shrink-0 min-h-[38px] h-[38px] inline-flex items-center ${
                isActive
                  ? 'text-amber-300 bg-amber-500/20 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/30'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
              }`}
            >
              {itemNumber}
            </span>
          </div>

          {/* Active Status Bar Indicators & Reset Action */}
          <div
            className="flex items-center gap-1.5 shrink-0 min-h-[28px] h-[28px] text-[10px] sm:text-[11px] font-mono font-bold"
            role="status"
            aria-label={`Item ${itemNumber} status`}
          >
            {rowData.never_eaten && (
              <span className="min-h-[26px] h-[26px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/40 inline-flex items-center gap-0.5 shadow-sm">
                <span>{language === 'ja' ? '未食 = 1' : 'Never = 1'}</span>
              </span>
            )}
            {rowData.frequency !== null && (
              <span className="min-h-[26px] h-[26px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40 inline-flex items-center gap-0.5 shadow-sm">
                <span>{language === 'ja' ? `頻度 = ${rowData.frequency}` : `Freq = ${rowData.frequency}`}</span>
              </span>
            )}
            {rowData.occasion_out_store && (
              <span className="min-h-[26px] h-[26px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 inline-flex items-center gap-0.5 shadow-sm">
                <span>{language === 'ja' ? '外食 = 1' : 'Out = 1'}</span>
              </span>
            )}
            {!rowData.never_eaten && rowData.frequency === null && !rowData.occasion_out_store && (
              <span className="text-slate-300 text-[10px] font-medium min-h-[26px] h-[26px] inline-flex items-center">
                {t('notSelected')}
              </span>
            )}

            <button
              type="button"
              title={t('shortcutClear')}
              aria-label={`${t('shortcutClear')} (${itemNumber})`}
              onClick={(e) => {
                e.stopPropagation();
                onResetRow(item.id);
              }}
              className="min-h-[28px] min-w-[28px] h-[28px] w-[28px] p-1.5 text-slate-300 hover:text-rose-300 rounded-md hover:bg-slate-800 transition ml-1 cursor-pointer border border-transparent hover:border-slate-700 flex items-center justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* 3-Group Architecture Grid: Group 1 (未食: 3 cols), Group 2 (頻度: 6 cols), Group 3 (外食: 3 cols) */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-2.5 items-stretch pt-0.5 min-w-0 w-full"
          role="group"
          aria-label={`Response options for ${itemNumber}`}
        >
          {/* Group 1 (Column 1: 食べたことない [Key: 0]) */}
          <div
            className="lg:col-span-3 border border-rose-500/30 bg-rose-950/20 rounded-lg p-1.5 flex flex-col justify-center min-w-0 min-h-[56px] sm:min-h-[60px]"
            role="group"
            aria-label={language === 'ja' ? '① 食べたことない' : '① Never eaten option'}
          >
            <button
              type="button"
              id={`btn-col1-${item.id}`}
              aria-label={language === 'ja' ? `① 食べたことない (${itemNumber})` : `① Never Eaten (${itemNumber})`}
              aria-pressed={rowData.never_eaten}
              onClick={(e) => {
                e.stopPropagation();
                onSelectRow(idx);
                onToggleNeverEaten(item.id);
              }}
              className={`w-full min-h-[44px] sm:min-h-[48px] px-2.5 py-2 text-xs sm:text-sm rounded-md font-semibold leading-normal transition flex items-center justify-between border cursor-pointer min-w-0 ${
                rowData.never_eaten
                  ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-900/40 ring-1 ring-rose-300'
                  : 'bg-slate-950/80 hover:bg-slate-850 text-slate-200 border-slate-800 hover:border-rose-500/40'
              }`}
            >
              <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
                <span className="truncate leading-none">{language === 'ja' ? '① ない' : '① None'}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                {rowData.never_eaten && (
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" aria-hidden="true" />
                )}
                <span className={`text-[10px] font-mono leading-none ${rowData.never_eaten ? 'text-rose-100 font-bold' : 'text-rose-300'}`}>
                  [0]
                </span>
                {rowData.never_eaten && (
                  <span className="w-4 h-4 rounded bg-white text-rose-700 font-extrabold text-[10px] leading-none flex items-center justify-center font-mono shadow-sm">
                    1
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Group 2 (Column 2: 食べるもの / 頻度 [Keys: 1, 2, 3]) */}
          <div
            className="lg:col-span-6 border border-amber-500/30 bg-amber-950/20 rounded-lg p-1.5 flex flex-col justify-between min-w-0 min-h-[56px] sm:min-h-[60px]"
            role="group"
            aria-label={language === 'ja' ? '② 頻度 (食べるもの)' : '② Frequency options'}
          >
            <div className="flex items-center justify-between px-1 mb-1 text-[10px] font-semibold text-amber-200 select-none leading-tight min-h-[14px]">
              <span>{language === 'ja' ? '② 頻度 (食べるもの)' : '② Frequency (Eaten)'}</span>
              <span className="text-[9px] font-mono text-amber-300">[1, 2, 3]</span>
            </div>
            <div
              className="flex flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2 min-w-0 w-full"
              role="radiogroup"
              aria-label={language === 'ja' ? '頻度選択' : 'Frequency selection'}
            >
              {[
                { val: 1, labelJa: 'よく', labelEn: 'Often', ariaJa: 'よく (1: よく食べる)', ariaEn: 'Often', key: '1' },
                { val: 2, labelJa: '割合よく', labelEn: 'Moderate', ariaJa: '割合よく (2: 割合よく)', ariaEn: 'Moderate', key: '2' },
                { val: 3, labelJa: 'あまり', labelEn: 'Rarely', ariaJa: 'あまり (3: あまり)', ariaEn: 'Rarely', key: '3' },
              ].map((opt) => {
                const isSelected = rowData.frequency === opt.val;
                const label = language === 'ja' ? opt.labelJa : opt.labelEn;
                const ariaLabelText = language === 'ja' ? opt.ariaJa : opt.ariaEn;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    id={`btn-col2-${item.id}-${opt.val}`}
                    aria-label={`${opt.key}: ${ariaLabelText} (${itemNumber})`}
                    aria-pressed={isSelected}
                    role="radio"
                    aria-checked={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRow(idx);
                      onSetFrequency(item.id, opt.val);
                    }}
                    className={`flex-1 min-w-0 min-h-[44px] sm:min-h-[48px] py-1.5 px-1 sm:px-2 text-center rounded-md text-xs font-semibold leading-normal transition flex flex-row items-center justify-center gap-1 cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-300 shadow-md shadow-amber-950/40 ring-1 ring-amber-300'
                        : 'bg-slate-950/80 hover:bg-slate-850 text-slate-200 border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <span className="whitespace-nowrap leading-none">{label}</span>
                    <span
                      className={`text-[10px] font-mono leading-none shrink-0 ${
                        isSelected ? 'text-slate-900 font-extrabold' : 'text-amber-300'
                      }`}
                    >
                      [{opt.key}]
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 3 (Column 3: 外食・店で買うもの [Key: 7]) */}
          <div
            className="lg:col-span-3 border border-emerald-500/30 bg-emerald-950/20 rounded-lg p-1.5 flex flex-col justify-center min-w-0 min-h-[56px] sm:min-h-[60px]"
            role="group"
            aria-label={language === 'ja' ? '③ 外食・店買' : '③ Dining out / Store-bought option'}
          >
            <button
              type="button"
              id={`btn-col3-${item.id}`}
              aria-label={language === 'ja' ? `③ 外食・店買 (${itemNumber})` : `③ Dining Out / Store-bought (${itemNumber})`}
              aria-pressed={rowData.occasion_out_store}
              onClick={(e) => {
                e.stopPropagation();
                onSelectRow(idx);
                onToggleOccasionOutStore(item.id);
              }}
              className={`w-full min-h-[44px] sm:min-h-[48px] px-2.5 py-2 text-xs sm:text-sm rounded-md font-semibold leading-normal transition flex items-center justify-between border cursor-pointer min-w-0 ${
                rowData.occasion_out_store
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-900/40 ring-1 ring-emerald-300'
                  : 'bg-slate-950/80 hover:bg-slate-850 text-slate-200 border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center gap-1.5 whitespace-nowrap min-w-0">
                <span className="truncate leading-none">{language === 'ja' ? '③ 外食' : '③ Out'}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                {rowData.occasion_out_store && (
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" aria-hidden="true" />
                )}
                <span className={`text-[10px] font-mono leading-none ${rowData.occasion_out_store ? 'text-emerald-100 font-bold' : 'text-emerald-300'}`}>
                  [7]
                </span>
                {rowData.occasion_out_store && (
                  <span className="w-4 h-4 rounded bg-white text-emerald-700 font-extrabold text-[10px] leading-none flex items-center justify-center font-mono shadow-sm">
                    1
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  },
  areSurveyRowPropsEqual
);

interface SurveyEntryPanelProps {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  activeRowIndex: number;
  setActiveRowIndex: (idx: number) => void;
  answers: Record<number, SurveyRowData>;
  onToggleNeverEaten: (itemId: number) => void;
  onSetFrequency: (itemId: number, freq: number) => void;
  onToggleOccasionOutStore: (itemId: number) => void;
  onResetRow: (itemId: number) => void;
  onOpenMatrix: () => void;
  onJumpNextIncomplete: () => void;
  onCopyHorizontalTsv: () => void;
  onCopyVerticalTsv: () => void;
  onClearActiveCategory: () => void;
  onDownloadCsv: () => void;
}

export const SurveyEntryPanel: React.FC<SurveyEntryPanelProps> = ({
  activeCategory,
  setActiveCategory,
  activeRowIndex,
  setActiveRowIndex,
  answers,
  onToggleNeverEaten,
  onSetFrequency,
  onToggleOccasionOutStore,
  onResetRow,
  onOpenMatrix,
  onJumpNextIncomplete,
  onCopyHorizontalTsv,
  onCopyVerticalTsv,
  onClearActiveCategory,
  onDownloadCsv,
}) => {
  const { language, t, tCategory } = useLanguage();
  const activeRowRef = useRef<HTMLDivElement | null>(null);
  const categorySelectRef = useRef<HTMLSelectElement | null>(null);

  const [showAllCategories, setShowAllCategories] = useState(false);

  // Compute category statuses
  let completeCats = 0;
  let totalFilledItems = 0;

  RAW_1974_SPEC.forEach((spec) => {
    const stat = getCategoryStatus(spec, answers);
    if (stat.isComplete) completeCats++;
    totalFilledItems += stat.filled;
  });

  const currentSpec = RAW_1974_SPEC.find((s) => s.cat === activeCategory);
  const currentStat = currentSpec ? getCategoryStatus(currentSpec, answers) : null;
  const isCurrentCategoryComplete = currentStat?.isComplete ?? false;

  const currentItems = FULL_1974_SCHEMA.filter((i) => i.cat === activeCategory);
  const selectedCategoryIndex = activeCategory;

  // Filter displayed categories: if showAllCategories is false, filter to show only next 5 incomplete categories (<100%); otherwise show all
  const displayedCategories = useMemo(() => {
    if (showAllCategories) {
      return RAW_1974_SPEC;
    }

    const currentIdx = Math.max(0, RAW_1974_SPEC.findIndex((s) => s.cat === activeCategory));
    const incomplete: typeof RAW_1974_SPEC = [];

    for (let i = 0; i < RAW_1974_SPEC.length && incomplete.length < 5; i++) {
      const idx = (currentIdx + i) % RAW_1974_SPEC.length;
      const spec = RAW_1974_SPEC[idx];
      const stat = getCategoryStatus(spec, answers);
      if (!stat.isComplete && !incomplete.some((s) => s.cat === spec.cat)) {
        incomplete.push(spec);
      }
    }

    if (incomplete.length === 0) {
      return RAW_1974_SPEC.slice(0, 5);
    }

    // Ensure active category is included so the select value and focus are never lost
    const curSpec = RAW_1974_SPEC.find((s) => s.cat === activeCategory);
    if (curSpec && !incomplete.some((s) => s.cat === activeCategory)) {
      incomplete.push(curSpec);
    }

    return incomplete.sort((a, b) => {
      const idxA = RAW_1974_SPEC.findIndex((s) => s.cat === a.cat);
      const idxB = RAW_1974_SPEC.findIndex((s) => s.cat === b.cat);
      return idxA - idxB;
    });
  }, [showAllCategories, activeCategory, answers]);

  // Automatically auto-advance to the next incomplete category upon completing final field of current active category
  const prevCategoryCompleteRef = useRef(isCurrentCategoryComplete);
  const prevActiveCategoryRef = useRef(activeCategory);

  // Ensure native select element stays synced with activeCategory / selectedCategoryIndex even when options list mutates
  useEffect(() => {
    if (categorySelectRef.current) {
      categorySelectRef.current.value = selectedCategoryIndex;
    }
  }, [showAllCategories, selectedCategoryIndex]);

  useEffect(() => {
    if (prevActiveCategoryRef.current !== activeCategory) {
      prevActiveCategoryRef.current = activeCategory;
      prevCategoryCompleteRef.current = isCurrentCategoryComplete;
      return;
    }

    if (!prevCategoryCompleteRef.current && isCurrentCategoryComplete) {
      prevCategoryCompleteRef.current = true;
      const timer = setTimeout(() => {
        onJumpNextIncomplete();
      }, 250);
      return () => clearTimeout(timer);
    } else {
      prevCategoryCompleteRef.current = isCurrentCategoryComplete;
    }
  }, [isCurrentCategoryComplete, activeCategory, onJumpNextIncomplete]);

  // Auto scroll to active row
  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeRowIndex, activeCategory]);

  // Global keyboard shortcuts for active row
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing when user is in input/select/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        return;
      }

      const activeItem = currentItems[activeRowIndex];
      if (!activeItem) return;

      switch (e.key) {
        case '0':
          e.preventDefault();
          onToggleNeverEaten(activeItem.id);
          break;
        case '1':
          e.preventDefault();
          onSetFrequency(activeItem.id, 1);
          break;
        case '2':
          e.preventDefault();
          onSetFrequency(activeItem.id, 2);
          break;
        case '3':
          e.preventDefault();
          onSetFrequency(activeItem.id, 3);
          break;
        case '7':
          e.preventDefault();
          onToggleOccasionOutStore(activeItem.id);
          break;
        case 'Enter':
        case 'ArrowDown':
          e.preventDefault();
          if (activeRowIndex < currentItems.length - 1) {
            setActiveRowIndex(activeRowIndex + 1);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (activeRowIndex > 0) {
            setActiveRowIndex(activeRowIndex - 1);
          }
          break;
        case 'Backspace':
        case 'Delete':
          e.preventDefault();
          onResetRow(activeItem.id);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRowIndex, currentItems, onToggleNeverEaten, onSetFrequency, onToggleOccasionOutStore, onResetRow, setActiveRowIndex]);

  // Memoized row items to ensure optimal 60fps rendering and zero CLS for survey items
  const renderedRowItems = useMemo(() => {
    return currentItems.map((item, idx) => {
      const rowData = answers[item.id] || DEFAULT_ROW_DATA;
      const isCurrentActive = idx === activeRowIndex;

      return (
        <div
          key={item.id}
          ref={isCurrentActive ? activeRowRef : null}
          role="listitem"
          className="min-h-[140px] sm:min-h-[128px]"
        >
          <SurveyRowItem
            item={item}
            idx={idx}
            isActive={isCurrentActive}
            rowData={rowData}
            onSelectRow={setActiveRowIndex}
            onToggleNeverEaten={onToggleNeverEaten}
            onSetFrequency={onSetFrequency}
            onToggleOccasionOutStore={onToggleOccasionOutStore}
            onResetRow={onResetRow}
            language={language}
            t={t}
          />
        </div>
      );
    });
  }, [
    currentItems,
    answers,
    activeRowIndex,
    setActiveRowIndex,
    onToggleNeverEaten,
    onSetFrequency,
    onToggleOccasionOutStore,
    onResetRow,
    language,
    t,
  ]);

  return (
    <section
      aria-label={t('surveyFormEntry')}
      className="w-full md:w-[42%] lg:w-[38%] h-full flex flex-col bg-panelbg border-t md:border-t-0 border-slate-800"
    >
      {/* Target Category & Progress Summary Banner */}
      <div className="p-3.5 border-b border-slate-800 space-y-2.5 shrink-0 bg-slate-900/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" id="statusDot" aria-hidden="true"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200" id="statusText">
              {t('statusReady')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="openMatrixBtn"
              onClick={onOpenMatrix}
              aria-label={t('matrixModalTitle')}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 transition flex items-center gap-1 cursor-pointer"
            >
              <LayoutGrid className="w-3 h-3" />
              <span id="matrixSummaryBadge">
                {t('matrixSummary', { completed: completeCats, total: RAW_1974_SPEC.length })}
              </span>
            </button>
            <span className="text-xs font-mono text-emerald-400 font-bold" id="progressBadge" aria-live="polite">
              {t('progressSummary', { filled: totalFilledItems, total: FULL_1974_SCHEMA.length })}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="categorySelector" className="text-[11px] font-semibold text-slate-200 flex items-center gap-1 notranslate">
              <span>{t('surveyCategoryLabel')}</span>
            </label>
            <button
              id="jumpNextIncompleteBtn"
              type="button"
              onClick={onJumpNextIncomplete}
              aria-label={t('nextIncomplete')}
              className="text-[10px] font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1 transition cursor-pointer"
            >
              <ChevronsRight className="w-3 h-3" aria-hidden="true" />
              <span>{t('nextIncomplete')}</span>
            </button>
          </div>
          <div className="relative">
            {/* Screen reader live updates for category & completion state */}
            <div className="sr-only" aria-live="polite" aria-atomic="true" id="categorySelectionLive">
              {currentStat
                ? `${language === 'ja' ? (currentSpec?.name_ja || activeCategory) : (currentSpec?.name_en || activeCategory)}: ${currentStat.filled}/${currentStat.total} ${language === 'ja' ? '入力完了' : 'completed'}${currentStat.isComplete ? (language === 'ja' ? '（全項目完了）' : ' (All completed)') : ''}`
                : ''}
            </div>

            <select
              ref={categorySelectRef}
              id="categorySelector"
              value={activeCategory}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '__TOGGLE__') {
                  setShowAllCategories((prev) => !prev);
                  // Immediately preserve and restore the select value to selectedCategoryIndex so that the select dropdown does not get stuck showing the toggle text
                  e.target.value = selectedCategoryIndex;
                  if (categorySelectRef.current) {
                    categorySelectRef.current.value = selectedCategoryIndex;
                    categorySelectRef.current.focus();
                  }
                  return;
                }
                if (val === '__SEP__' || !val) {
                  e.target.value = selectedCategoryIndex;
                  if (categorySelectRef.current) {
                    categorySelectRef.current.value = selectedCategoryIndex;
                  }
                  return;
                }
                setActiveCategory(val);
                setActiveRowIndex(0);
              }}
              aria-label="Category Selector"
              aria-live="polite"
              className={`w-full min-h-[38px] h-[38px] text-xs rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none transition notranslate font-sans cursor-pointer ${
                isCurrentCategoryComplete
                  ? 'border-emerald-500 bg-emerald-950/20'
                  : 'border border-slate-700 bg-darkbg'
              }`}
            >
              {displayedCategories.map((spec) => {
                const stat = getCategoryStatus(spec, answers);
                const markIcon = stat.isComplete ? '✅' : stat.isStarted ? '⏳' : '⚪';
                const localizedCatName = language === 'en' ? (spec.name_en || tCategory(spec.cat)) : (spec.name_ja || spec.cat);
                return (
                  <option key={`category-option-${spec.cat}`} value={spec.cat} className="bg-slate-900 text-slate-200">
                    {t('categoryOptionFormat', {
                      icon: markIcon,
                      filled: stat.filled,
                      total: stat.total,
                      cat: localizedCatName,
                      start: spec.ids[0],
                      end: spec.ids[spec.ids.length - 1],
                    })}
                  </option>
                );
              })}
              <option key="category-separator-option" disabled value="__SEP__" className="text-slate-400 bg-slate-900 font-mono select-none">
                ────────────────────────
              </option>
              <option key="toggle-view-option" value="__TOGGLE__" className="font-semibold text-amber-300 bg-slate-900">
                {showAllCategories ? t('showIncompleteOnly') : t('showAllCategories')}
              </option>
            </select>
          </div>
        </div>

        {/* 1974 Customer Excel 3-Column Specifications Guide: Aligns with 3 / 6 / 3 Grouping */}
        <div
          className="grid grid-cols-12 gap-2 sm:gap-2.5 text-[10px] text-center font-mono pt-1 notranslate"
          role="group"
          aria-label={t('colMeanings')}
        >
          <div className="col-span-3 bg-rose-950/30 py-1.5 px-1 rounded-lg text-rose-200 font-semibold border border-rose-500/30 truncate min-w-0">
            {language === 'ja' ? '① ない [0]' : '① None [0]'}
          </div>
          <div className="col-span-6 bg-amber-950/30 py-1.5 px-1 rounded-lg text-amber-200 font-semibold border border-amber-500/30 truncate min-w-0">
            {language === 'ja' ? '② 頻度 [1, 2, 3]' : '② Freq [1, 2, 3]'}
          </div>
          <div className="col-span-3 bg-emerald-950/30 py-1.5 px-1 rounded-lg text-emerald-200 font-semibold border border-emerald-500/30 truncate min-w-0">
            {language === 'ja' ? '③ 外食 [7]' : '③ Out [7]'}
          </div>
        </div>

        {/* Shortcut Legend */}
        <div
          role="note"
          className="text-[10px] font-mono text-slate-300 bg-slate-950/60 px-2 py-1 rounded border border-slate-800 text-center"
        >
          {t('shortcutSummary1974')}
        </div>
      </div>

      {/* Item Form Stream */}
      <div
        id="itemStreamList"
        role="list"
        aria-label={t('surveyQuestionsList')}
        className="flex-1 overflow-y-auto p-3 space-y-2 focus:outline-none notranslate"
        tabIndex={0}
      >
        {renderedRowItems}
      </div>

      {/* Action Footer: 3-Column Horizontal TSV, Vertical TSV, and CSV */}
      <div className="p-3 bg-darkbg border-t border-slate-800 space-y-2 shrink-0">
        <div className="flex items-center gap-2">
          {/* Main: Copy TSV (横1行 Excel 1-Row) */}
          <button
            id="copyHorizontalTsvBtn"
            type="button"
            onClick={onCopyHorizontalTsv}
            title="ExcelのC列にそのまま貼り付け可能な横1行TSVをコピー"
            aria-label={t('copyTsvHorizontal')}
            className="flex-1 py-2 min-h-[38px] bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center justify-center gap-1.5 notranslate focus:ring-2 focus:ring-blue-400 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('copyTsvHorizontal')}</span>
          </button>

          {/* Secondary: TSV (縦 Debug View) */}
          <button
            id="copyVerticalTsvBtn"
            type="button"
            onClick={onCopyVerticalTsv}
            title="縦形式のデバッグ用TSVをコピー"
            aria-label={t('copyTsvVertical')}
            className="px-2.5 py-2 min-h-[38px] bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center justify-center gap-1 notranslate cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('copyTsvVertical')}</span>
          </button>

          {/* Clear Active Cat */}
          <button
            id="clearCategoryMarksBtn"
            type="button"
            onClick={onClearActiveCategory}
            title="現在の分類の入力をすべてクリア"
            aria-label={t('clearActiveCat')}
            className="px-2.5 py-2 min-h-[38px] bg-slate-800 hover:bg-rose-900/40 text-slate-200 hover:text-rose-200 text-xs font-medium rounded-lg border border-slate-700 transition notranslate cursor-pointer"
          >
            {t('clearActiveCat')}
          </button>
        </div>

        {/* Full CSV Download */}
        <button
          id="downloadCsvBtn"
          type="button"
          onClick={onDownloadCsv}
          aria-label={t('downloadCsv', { count: FULL_1974_SCHEMA.length })}
          className="w-full py-2 min-h-[38px] bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition flex items-center justify-center gap-2 notranslate focus:ring-2 focus:ring-emerald-400 cursor-pointer"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span id="downloadBtnLabel">
            {t('downloadCsv', { count: FULL_1974_SCHEMA.length })}
          </span>
        </button>
      </div>
    </section>
  );
};

