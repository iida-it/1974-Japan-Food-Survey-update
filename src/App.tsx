import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { DocumentViewer } from './components/DocumentViewer';
import { SurveyEntryPanel } from './components/SurveyEntryPanel';
import { CategoryMatrixModal } from './components/CategoryMatrixModal';
import { IncompleteWarningModal } from './components/IncompleteWarningModal';
import { ToastContainer } from './components/ToastContainer';
import { RAW_1974_SPEC, FULL_1974_SCHEMA, getCategoryStatus } from './data/survey1974';
import {
  ActiveTool,
  SelectionBox,
  ToastMessage,
  CategoryStatus,
  SurveyRowData,
  createDefaultSurveyRowData,
} from './types';

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}

function AppContent() {
  const { language, t, tCategory } = useLanguage();
  const [imageSource, setImageSource] = useState<HTMLImageElement | HTMLCanvasElement | null>(null);
  const [imageRotation, setImageRotation] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<ActiveTool>('draw');
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  // PDF states
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfCurrentPage, setPdfCurrentPage] = useState<number>(1);
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(1);

  // Survey states (1974 3-Column architecture)
  const [activeCategory, setActiveCategory] = useState<string>(RAW_1974_SPEC[0].cat);
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, SurveyRowData>>({});

  // Modals
  const [isMatrixOpen, setIsMatrixOpen] = useState<boolean>(false);
  const [isIncompleteWarningOpen, setIsIncompleteWarningOpen] = useState<boolean>(false);
  const [incompleteCategories, setIncompleteCategories] = useState<CategoryStatus[]>([]);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // Update document title and meta description dynamically based on language
  useEffect(() => {
    const title = t('appTitle');
    const desc = t('metaDescription');
    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', desc);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', desc);
    }
  }, [language, t]);

  // Configure PDF.js worker if available
  useEffect(() => {
    if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions?.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }, []);

  const renderPdfPage = useCallback(
    async (doc: any, pageNo: number) => {
      try {
        const page = await doc.getPage(pageNo);
        const vp = page.getViewport({ scale: 2.2 });
        const off = document.createElement('canvas');
        off.width = vp.width;
        off.height = vp.height;
        const ctx = off.getContext('2d');
        if (!ctx) return;
        await page.render({ canvasContext: ctx, viewport: vp }).promise;
        setImageSource(off);
        setImageRotation(0);
        setSelectionBox(null);
        setPdfCurrentPage(pageNo);
      } catch (err) {
        console.error('Failed to render PDF page:', err);
        showToast(t('toastPdfRenderFailed'), 'warning');
      }
    },
    [showToast, t]
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (isPdf) {
        if (!window.pdfjsLib) {
          showToast(t('toastPdfLibLoading'), 'warning');
          return;
        }
        try {
          const arrayBuffer = await file.arrayBuffer();
          const doc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          setPdfDoc(doc);
          setPdfTotalPages(doc.numPages);
          setPdfCurrentPage(1);
          await renderPdfPage(doc, 1);
          showToast(t('toastPdfLoaded', { pages: doc.numPages }), 'success');
        } catch (err) {
          console.error('Failed to load PDF:', err);
          showToast(t('toastPdfLoadFailed'), 'warning');
        }
      } else {
        const img = new Image();
        img.onload = () => {
          setPdfDoc(null);
          setPdfCurrentPage(1);
          setPdfTotalPages(1);
          setImageSource(img);
          setImageRotation(0);
          setSelectionBox(null);
          showToast(t('toastImageLoaded'), 'success');
        };
        img.onerror = () => {
          showToast(t('toastPdfLoadFailed'), 'warning');
        };
        img.src = URL.createObjectURL(file);
      }
    },
    [renderPdfPage, showToast, t]
  );

  const handleRotate = useCallback(() => {
    setImageRotation((prev) => {
      const next = (prev + 90) % 360;
      showToast(t('toastRotated', { deg: next }), 'info');
      return next;
    });
  }, [showToast, t]);

  const handleClearBox = useCallback(() => {
    setSelectionBox(null);
    showToast(t('toastClearedBox'), 'info');
  }, [showToast, t]);

  // Option 1: Toggle Never Eaten (Column 1) [Key: 0] - Decoupled
  const handleToggleNeverEaten = useCallback((itemId: number) => {
    setAnswers((prev) => {
      const current = prev[itemId] || createDefaultSurveyRowData();
      return {
        ...prev,
        [itemId]: {
          ...current,
          never_eaten: !current.never_eaten,
        },
      };
    });
  }, []);

  // Option 2: Set / Toggle Frequency (Column 2: 1: よく, 2: 割合, 3: あまり) [Keys: 1, 2, 3] - Decoupled
  const handleSetFrequency = useCallback((itemId: number, freq: number) => {
    setAnswers((prev) => {
      const current = prev[itemId] || createDefaultSurveyRowData();
      return {
        ...prev,
        [itemId]: {
          ...current,
          frequency: current.frequency === freq ? null : freq,
        },
      };
    });
  }, []);

  // Option 3: Toggle Occasion Out / Store-bought (Column 3) [Key: 7] - Decoupled
  const handleToggleOccasionOutStore = useCallback((itemId: number) => {
    setAnswers((prev) => {
      const current = prev[itemId] || createDefaultSurveyRowData();
      return {
        ...prev,
        [itemId]: {
          ...current,
          occasion_out_store: !current.occasion_out_store,
        },
      };
    });
  }, []);

  // Reset current row to clean defaults (never_eaten: false, frequency: null, occasion_out_store: false)
  const handleResetRow = useCallback((itemId: number) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }, []);

  const handleClearActiveCategory = useCallback(() => {
    const cur = RAW_1974_SPEC.find((s) => s.cat === activeCategory);
    if (!cur) return;
    setAnswers((prev) => {
      const next = { ...prev };
      cur.ids.forEach((id) => {
        delete next[id];
      });
      return next;
    });
    showToast(t('toastClearedCat', { cat: tCategory(cur.cat) }), 'info');
  }, [activeCategory, showToast, t, tCategory]);

  const handleJumpNextIncomplete = useCallback(() => {
    const currentIdx = RAW_1974_SPEC.findIndex((s) => s.cat === activeCategory);
    for (let i = 1; i <= RAW_1974_SPEC.length; i++) {
      const checkIdx = (currentIdx + i) % RAW_1974_SPEC.length;
      const spec = RAW_1974_SPEC[checkIdx];
      const stat = getCategoryStatus(spec, answers);
      if (!stat.isComplete) {
        setActiveCategory(spec.cat);
        setActiveRowIndex(0);
        showToast(t('toastJumpedIncomplete', { cat: tCategory(spec.cat) }), 'info');
        return;
      }
    }
    showToast(t('toastAllCompleted'), 'success');
  }, [activeCategory, answers, showToast, t, tCategory]);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('navigator.clipboard.writeText failed, attempting execCommand fallback', err);
      }
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-999999px';
      ta.style.top = '-999999px';
      ta.setAttribute('readonly', '');
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const success = document.execCommand('copy');
      document.body.removeChild(ta);
      return success;
    } catch (err) {
      console.error('execCommand fallback failed', err);
      return false;
    }
  }, []);

  // 3-Column Horizontal TSV Export (Excel 1-Row format for Active Category)
  // Strictly iterates through currentCategory.lines (matching items like Line 1, Line 9, Line 13, Line 14, Line 15, Line 16, Line 19...).
  // For each line, constructs exactly 3 columns:
  // Col 1: row.never_eaten ? "1" : ""
  // Col 2: row.frequency !== null ? String(row.frequency) : ""
  // Col 3: row.occasion_out_store ? "1" : ""
  // Joined on a SINGLE string with "\t" (no newline characters between items).
  const handleCopyHorizontalTsv = useCallback(async () => {
    const currentSpec = RAW_1974_SPEC.find((s) => s.cat === activeCategory);
    if (!currentSpec) return;

    const values: string[] = [];
    currentSpec.ids.forEach((itemId) => {
      const row = answers[itemId] || createDefaultSurveyRowData();
      values.push(row.never_eaten ? '1' : '');
      values.push(row.frequency !== null ? String(row.frequency) : '');
      values.push(row.occasion_out_store ? '1' : '');
    });

    const tsv = values.join('\t');
    const success = await copyToClipboard(tsv);
    if (success) {
      showToast(t('toastCopiedHorizontalTsv'), 'success');
    } else {
      showToast(t('toastCopyTsvFailed'), 'warning');
    }
  }, [activeCategory, answers, copyToClipboard, showToast, t]);

  // Secondary Vertical TSV (Debug View)
  const handleCopyVerticalTsv = useCallback(async () => {
    const currentItems = FULL_1974_SCHEMA.filter((i) => i.cat === activeCategory);
    const lines = ['行番号\t品目名\t食べたことない\t食べるもの\t外食・店で買うもの'];

    currentItems.forEach((item) => {
      const row = answers[item.id] || createDefaultSurveyRowData();
      const food = item.food_ja || `品目 #${item.id}`;
      const c1 = row.never_eaten ? '1' : '';
      const c2 = row.frequency !== null ? String(row.frequency) : '';
      const c3 = row.occasion_out_store ? '1' : '';
      lines.push(`${item.id}\t${food}\t${c1}\t${c2}\t${c3}`);
    });

    const tsv = lines.join('\r\n');
    try {
      await copyToClipboard(tsv);
      showToast(t('toastCopiedVerticalTsv'), 'success');
    } catch {
      showToast(t('toastCopyTsvFailed'), 'warning');
    }
  }, [activeCategory, answers, showToast, t]);

  // CSV Generator adhering to Customer Excel 3-Column template
  const generate1974SurveyCsv = useCallback(() => {
    // Row 1: Header with item names spanning 3 columns
    const row1 = ['ファイル', '調査票'];
    // Row 2: Sub-headers for each of the 3 columns
    const row2 = ['文書情報', '分類'];
    // Row 3: Data values
    const dataRow = [
      pdfDoc ? `PDF Page ${pdfCurrentPage}` : '1974 Scan Image',
      activeCategory,
    ];

    FULL_1974_SCHEMA.forEach((item) => {
      const food = item.food_ja || `品目 #${item.id}`;
      row1.push(`"${item.id}. ${food}"`, '""', '""');
      row2.push('"食べたことない"', '"食べるもの"', '"外食・店で買うもの"');

      const row = answers[item.id] || createDefaultSurveyRowData();
      dataRow.push(
        row.never_eaten ? '"1"' : '""',
        row.frequency !== null ? `"${row.frequency}"` : '""',
        row.occasion_out_store ? '"1"' : '""'
      );
    });

    return [
      row1.join(','),
      row2.join(','),
      dataRow.join(','),
    ].join('\r\n');
  }, [pdfDoc, pdfCurrentPage, activeCategory, answers]);

  const triggerDirectCsvDownload = useCallback(() => {
    const csv = '\uFEFF' + generate1974SurveyCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `1974_Japan_Food_Survey_Transcription_${Date.now()}.csv`;
    link.click();
    showToast(t('toastCsvDownloaded'), 'success');
  }, [generate1974SurveyCsv, showToast, t]);

  const handleDownloadCsv = useCallback(() => {
    const incomplete: CategoryStatus[] = [];
    RAW_1974_SPEC.forEach((spec) => {
      const stat = getCategoryStatus(spec, answers);
      if (!stat.isComplete) {
        incomplete.push(stat);
      }
    });

    if (incomplete.length > 0) {
      setIncompleteCategories(incomplete);
      setIsIncompleteWarningOpen(true);
      return;
    }

    triggerDirectCsvDownload();
  }, [answers, triggerDirectCsvDownload]);

  // Global keydown for canvas tools ('c' to clear bounding box)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = document.activeElement as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'SELECT' ||
        target?.tagName === 'TEXTAREA';

      if ((e.key === 'c' || e.key === 'C') && !isInput) {
        handleClearBox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClearBox]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-sans select-none notranslate bg-darkbg text-slate-100">
      {/* Top Navbar */}
      <Navbar
        onFileSelect={handleFileSelect}
        onRotate={handleRotate}
        onClearBox={handleClearBox}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Viewport */}
        <DocumentViewer
          imageSource={imageSource}
          imageRotation={imageRotation}
          zoom={zoom}
          setZoom={setZoom}
          pan={pan}
          setPan={setPan}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          selectionBox={selectionBox}
          setSelectionBox={setSelectionBox}
          pdfDoc={pdfDoc}
          pdfCurrentPage={pdfCurrentPage}
          pdfTotalPages={pdfTotalPages}
          onPdfPageChange={(page) => {
            if (pdfDoc && page >= 1 && page <= pdfTotalPages) {
              renderPdfPage(pdfDoc, page);
            }
          }}
          onFileSelect={handleFileSelect}
        />

        {/* Right Form Panel */}
        <SurveyEntryPanel
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activeRowIndex={activeRowIndex}
          setActiveRowIndex={setActiveRowIndex}
          answers={answers}
          onToggleNeverEaten={handleToggleNeverEaten}
          onSetFrequency={handleSetFrequency}
          onToggleOccasionOutStore={handleToggleOccasionOutStore}
          onResetRow={handleResetRow}
          onOpenMatrix={() => setIsMatrixOpen(true)}
          onJumpNextIncomplete={handleJumpNextIncomplete}
          onCopyHorizontalTsv={handleCopyHorizontalTsv}
          onCopyVerticalTsv={handleCopyVerticalTsv}
          onClearActiveCategory={handleClearActiveCategory}
          onDownloadCsv={handleDownloadCsv}
        />
      </main>

      {/* 45-Category Matrix Modal */}
      <CategoryMatrixModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
        answers={answers}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setActiveRowIndex(0);
          setIsMatrixOpen(false);
          showToast(t('toastSelectedCat', { cat: tCategory(cat) }), 'info');
        }}
      />

      {/* Incomplete Warning Modal */}
      <IncompleteWarningModal
        isOpen={isIncompleteWarningOpen}
        incompleteCategories={incompleteCategories}
        onCancel={() => setIsIncompleteWarningOpen(false)}
        onConfirmForceExport={() => {
          setIsIncompleteWarningOpen(false);
          triggerDirectCsvDownload();
        }}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
