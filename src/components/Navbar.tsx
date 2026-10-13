import React, { useRef } from 'react';
import { Sheet, FileUp, RotateCw, Scan } from 'lucide-react';
import { FULL_1974_SCHEMA } from '../data/survey1974';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  onFileSelect: (file: File) => void;
  onRotate: () => void;
  onClearBox: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onFileSelect,
  onRotate,
  onClearBox,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, language, toggleLanguage } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = ''; // Reset input to allow selecting same file again
    }
  };

  return (
    <header className="h-14 bg-panelbg border-b border-slate-800 px-4 flex items-center justify-between shrink-0 shadow-lg z-30">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-lg shadow-md" aria-hidden="true">
          <Sheet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm sm:text-base tracking-wide flex items-center gap-2 notranslate">
            <span>{t('appTitle')}</span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              id="totalItemsBadge"
            >
              {t('itemsDefined', { count: FULL_1974_SCHEMA.length })}
            </span>
          </h1>
          <p className="text-[10px] text-slate-400 hidden sm:block notranslate">
            {t('appSubtitle')}
          </p>
        </div>
      </div>

      {/* Document Controls, Language Toggle & Quick Shortcut Badges */}
      <div className="flex items-center space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          id="fileInput"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          aria-label={t('loadSurvey')}
          onChange={handleFileChange}
        />

        <button
          id="uploadBtn"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-lg text-white shadow transition focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
        >
          <FileUp className="w-4 h-4" />
          <span>{t('loadSurvey')}</span>
        </button>

        <button
          id="rotateBtn"
          onClick={onRotate}
          title={t('rotateClockwise')}
          aria-label={t('rotateClockwise')}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          id="clearBoxBtn"
          onClick={onClearBox}
          title={t('clearBoundingBox')}
          aria-label={t('clearBoundingBox')}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
        >
          <Scan className="w-4 h-4" />
        </button>

        {/* Accessible, Sleek Pill-Styled Language Switcher */}
        <div className="shrink-0 w-[78px] h-11 flex items-center justify-center">
          <button
            id="languageToggleBtn"
            type="button"
            onClick={toggleLanguage}
            aria-label="Switch language"
            title={language === 'ja' ? 'Switch to English' : '日本語に切り替え'}
            className="w-full h-11 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-full cursor-pointer"
          >
            <div className="w-[72px] h-7 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-full p-0.5 flex items-center justify-between shadow-inner transition select-none">
              <span
                className={`flex-1 flex items-center justify-center h-full text-[10px] font-mono font-bold rounded-full transition-all duration-150 ${
                  language === 'en'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400'
                }`}
              >
                EN
              </span>
              <span className="text-slate-600 text-[9px] px-0.5 font-mono select-none">|</span>
              <span
                className={`flex-1 flex items-center justify-center h-full text-[10px] font-mono font-bold rounded-full transition-all duration-150 ${
                  language === 'ja'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400'
                }`}
              >
                JA
              </span>
            </div>
          </button>
        </div>

        <div className="h-5 w-px bg-slate-800 mx-1 hidden lg:block"></div>

        {/* 1974 Hotkey Badges: [0: 未食切替] [1-3: 頻度] [7: 外食・店買] [BS/Del: 消去] [Enter/↓: 次行] */}
        <div
          className="hidden lg:flex items-center gap-1.5 text-[10px] xl:text-[11px] font-mono select-none"
          aria-label="Keyboard Shortcuts"
        >
          {/* [0: 未食切替] */}
          <span
            className="px-2 py-0.5 bg-rose-950/40 border border-rose-800/60 rounded text-rose-300 font-semibold"
            title={language === 'ja' ? '0: 食べたことない (未食切替)' : '0: Toggle Never Eaten'}
          >
            [{t('badgeNeverEaten')}]
          </span>

          {/* [1-3: 頻度] */}
          <span
            className="px-2 py-0.5 bg-sky-950/40 border border-sky-800/60 rounded text-sky-300 font-semibold"
            title={language === 'ja' ? '1–3: 頻度 (1:よく 2:割合 3:あまり)' : '1–3: Frequency (1:Often 2:Moderate 3:Rarely)'}
          >
            [{t('badgeFrequency')}]
          </span>

          {/* [7: 外食・店買] */}
          <span
            className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-800/60 rounded text-emerald-300 font-semibold"
            title={t('legendOccasion7')}
          >
            [{t('badgeOccasionOutStore')}]
          </span>

          {/* [BS/Del: 消去] */}
          <span
            className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-medium"
            title={language === 'ja' ? 'Backspace / Delete: 行の選択をリセット' : 'Backspace / Delete: Reset row marks'}
          >
            [{t('badgeClear')}]
          </span>

          {/* [Enter/↓: 次行] */}
          <span
            className="px-2 py-0.5 bg-amber-950/30 border border-amber-800/50 rounded text-amber-300 font-semibold"
            title={language === 'ja' ? 'Enter / ↓: 次の調査品目へ進む' : 'Enter / ↓: Advance to next row'}
          >
            [{t('badgeNextRow')}]
          </span>
        </div>
      </div>
    </header>
  );
};
