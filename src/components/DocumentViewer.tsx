import React, { useRef, useEffect, useCallback } from 'react';
import { Crosshair, Hand, ZoomIn, ZoomOut, Maximize, ChevronLeft, ChevronRight, FileUp, FolderOpen } from 'lucide-react';
import { ActiveTool, SelectionBox } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface DocumentViewerProps {
  imageSource: HTMLImageElement | HTMLCanvasElement | null;
  imageRotation: number;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  selectionBox: SelectionBox | null;
  setSelectionBox: (box: SelectionBox | null) => void;
  pdfDoc: any;
  pdfCurrentPage: number;
  pdfTotalPages: number;
  onPdfPageChange: (page: number) => void;
  onFileSelect: (file: File) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  imageSource,
  imageRotation,
  zoom,
  setZoom,
  pan,
  setPan,
  activeTool,
  setActiveTool,
  selectionBox,
  setSelectionBox,
  pdfDoc,
  pdfCurrentPage,
  pdfTotalPages,
  onPdfPageChange,
  onFileSelect,
}) => {
  const { t } = useLanguage();
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const isDrawingRef = useRef(false);
  const tempDrawStartRef = useRef<{ x: number; y: number } | null>(null);
  const isSpaceDownRef = useRef(false);

  // Keep references for event handlers without stale closures
  const stateRef = useRef({
    imageSource,
    imageRotation,
    zoom,
    pan,
    activeTool,
    selectionBox,
    focusRegionText: t('focusRegion'),
  });

  useEffect(() => {
    stateRef.current = {
      imageSource,
      imageRotation,
      zoom,
      pan,
      activeTool,
      selectionBox,
      focusRegionText: t('focusRegion'),
    };
  }, [imageSource, imageRotation, zoom, pan, activeTool, selectionBox, t]);

  const fitImage = useCallback(() => {
    const img = stateRef.current.imageSource;
    const vp = viewportRef.current;
    if (!img || !vp) return;

    const rect = vp.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const rot = stateRef.current.imageRotation;
    const isRotatedQuarter = rot === 90 || rot === 270;
    const w = isRotatedQuarter ? img.height : img.width;
    const h = isRotatedQuarter ? img.width : img.height;

    const scaleX = (rect.width - 40) / w;
    const scaleY = (rect.height - 40) / h;
    const newZoom = Math.min(scaleX, scaleY, 1.2);
    const newPanX = (rect.width - w * newZoom) / 2;
    const newPanY = (rect.height - h * newZoom) / 2;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [setZoom, setPan]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const vp = viewportRef.current;
    if (!canvas || !vp) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = vp.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const {
      imageSource: img,
      imageRotation: rot,
      zoom: z,
      pan: p,
      selectionBox: box,
      focusRegionText,
    } = stateRef.current;

    if (!img) return;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(z, z);

    const w = img.width;
    const h = img.height;

    ctx.save();
    if (rot === 90) {
      ctx.translate(h, 0);
      ctx.rotate((90 * Math.PI) / 180);
    } else if (rot === 180) {
      ctx.translate(w, h);
      ctx.rotate((180 * Math.PI) / 180);
    } else if (rot === 270) {
      ctx.translate(0, w);
      ctx.rotate((270 * Math.PI) / 180);
    }
    ctx.drawImage(img, 0, 0);
    ctx.restore();

    if (box) {
      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2 / z;
      ctx.setLineDash([5 / z, 3 / z]);
      ctx.fillRect(box.x, box.y, box.w, box.h);
      ctx.strokeRect(box.x, box.y, box.w, box.h);

      ctx.setLineDash([]);
      ctx.fillStyle = '#f59e0b';
      const hs = 6 / z;
      ctx.fillRect(box.x - hs / 2, box.y - hs / 2, hs, hs);
      ctx.fillRect(box.x + box.w - hs / 2, box.y - hs / 2, hs, hs);
      ctx.fillRect(box.x - hs / 2, box.y + box.h - hs / 2, hs, hs);
      ctx.fillRect(box.x + box.w - hs / 2, box.y + box.h - hs / 2, hs, hs);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(box.x, box.y - 18 / z, 100 / z, 16 / z);
      ctx.font = `${Math.max(10 / z, 10)}px sans-serif`;
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(focusRegionText, box.x + 4 / z, box.y - 5 / z);
      ctx.restore();
    }

    ctx.restore();
  }, []);

  // Re-render canvas whenever relevant props change
  useEffect(() => {
    renderCanvas();
  }, [imageSource, imageRotation, zoom, pan, selectionBox, renderCanvas]);

  // ResizeObserver for canvas
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    const ro = new ResizeObserver(() => {
      renderCanvas();
    });
    ro.observe(vp);

    return () => ro.disconnect();
  }, [renderCanvas]);

  // Handle image load auto-fit
  useEffect(() => {
    if (imageSource) {
      fitImage();
    }
  }, [imageSource, fitImage]);

  const getViewportCoords = (e: React.MouseEvent | MouseEvent) => {
    const vp = viewportRef.current;
    if (!vp) return { screenX: 0, screenY: 0, imgX: 0, imgY: 0 };
    const rect = vp.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const { pan: p, zoom: z } = stateRef.current;
    const imgX = (screenX - p.x) / z;
    const imgY = (screenY - p.y) / z;
    return { screenX, screenY, imgX, imgY };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!stateRef.current.imageSource) return;
    const coords = getViewportCoords(e);
    const vp = viewportRef.current;

    if (e.button === 1 || isSpaceDownRef.current || stateRef.current.activeTool === 'pan') {
      isPanningRef.current = true;
      panStartRef.current = {
        x: e.clientX - stateRef.current.pan.x,
        y: e.clientY - stateRef.current.pan.y,
      };
      if (vp) vp.style.cursor = 'grabbing';
      return;
    }

    if (e.button === 0 && stateRef.current.activeTool === 'draw') {
      isDrawingRef.current = true;
      tempDrawStartRef.current = { x: coords.imgX, y: coords.imgY };
      setSelectionBox({ x: coords.imgX, y: coords.imgY, w: 0, h: 0 });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanningRef.current) {
        setPan({
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y,
        });
        return;
      }

      if (isDrawingRef.current && tempDrawStartRef.current) {
        const coords = getViewportCoords(e);
        const x = Math.min(tempDrawStartRef.current.x, coords.imgX);
        const y = Math.min(tempDrawStartRef.current.y, coords.imgY);
        const w = Math.abs(coords.imgX - tempDrawStartRef.current.x);
        const h = Math.abs(coords.imgY - tempDrawStartRef.current.y);

        setSelectionBox({ x, y, w, h });
      }
    };

    const handleMouseUp = () => {
      const vp = viewportRef.current;
      if (isPanningRef.current) {
        isPanningRef.current = false;
        if (vp) {
          vp.style.cursor = isSpaceDownRef.current
            ? 'grab'
            : stateRef.current.activeTool === 'draw'
            ? 'crosshair'
            : 'grab';
        }
      }
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        tempDrawStartRef.current = null;
        const box = stateRef.current.selectionBox;
        if (box && (box.w < 10 || box.h < 10)) {
          setSelectionBox(null);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setPan, setSelectionBox]);

  // Mouse wheel zoom
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    const handleWheel = (e: WheelEvent) => {
      if (!stateRef.current.imageSource) return;
      e.preventDefault();
      const rect = vp.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const { zoom: currZoom, pan: currPan } = stateRef.current;
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      const newZoom = Math.max(0.1, Math.min(currZoom * zoomFactor, 8.0));

      const newPanX = mouseX - (mouseX - currPan.x) * (newZoom / currZoom);
      const newPanY = mouseY - (mouseY - currPan.y) * (newZoom / currZoom);

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    };

    vp.addEventListener('wheel', handleWheel, { passive: false });
    return () => vp.removeEventListener('wheel', handleWheel);
  }, [setZoom, setPan]);

  // Spacebar grab mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !isSpaceDownRef.current &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'SELECT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        isSpaceDownRef.current = true;
        if (viewportRef.current) viewportRef.current.style.cursor = 'grab';
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpaceDownRef.current = false;
        if (viewportRef.current) {
          viewportRef.current.style.cursor =
            stateRef.current.activeTool === 'draw' ? 'crosshair' : 'grab';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    viewportRef.current?.classList.add('ring-2', 'ring-blue-500');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    viewportRef.current?.classList.remove('ring-2', 'ring-blue-500');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    viewportRef.current?.classList.remove('ring-2', 'ring-blue-500');
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <section
      aria-label={t('docViewerCanvas')}
      className="w-full md:w-[63%] h-full flex flex-col bg-darkbg border-r border-slate-800 relative"
    >
      {/* Floating Canvas Navigation Controls */}
      <div
        role="toolbar"
        aria-label={t('canvasViewerToolbar')}
        className="absolute top-3 left-3 z-20 flex items-center bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-1 shadow-xl space-x-1"
      >
        <button
          id="toolDrawBtn"
          onClick={() => setActiveTool('draw')}
          aria-label={t('drawBox')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded shadow transition cursor-pointer ${
            activeTool === 'draw'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>{t('drawBox')}</span>
        </button>
        <button
          id="toolPanBtn"
          onClick={() => setActiveTool('pan')}
          aria-label={t('pan')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded shadow transition cursor-pointer ${
            activeTool === 'pan'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Hand className="w-3.5 h-3.5" />
          <span>{t('pan')}</span>
        </button>
        <div className="h-4 w-px bg-slate-700 mx-1"></div>
        <button
          id="zoomOutBtn"
          onClick={() => setZoom((z) => Math.max(z * 0.8, 0.1))}
          aria-label={t('zoomOut')}
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span
          id="zoomLabel"
          aria-live="polite"
          className="text-[11px] font-mono text-slate-300 w-12 text-center"
        >
          {Math.round(zoom * 100)}%
        </span>
        <button
          id="zoomInBtn"
          onClick={() => setZoom((z) => Math.min(z * 1.25, 8.0))}
          aria-label={t('zoomIn')}
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          id="zoomFitBtn"
          onClick={fitImage}
          title={t('fitToScreen')}
          aria-label={t('fitToScreen')}
          className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* PDF Pagination Controls */}
      {pdfDoc && (
        <div
          id="pdfPagination"
          className="absolute top-3 right-3 z-20 flex items-center bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg px-2.5 py-1 space-x-2 text-xs"
        >
          <button
            id="prevPageBtn"
            onClick={() => onPdfPageChange(pdfCurrentPage - 1)}
            disabled={pdfCurrentPage <= 1}
            aria-label={t('prevPage')}
            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span id="pageIndicator" className="font-mono text-slate-200">
            {pdfCurrentPage} / {pdfTotalPages}
          </span>
          <button
            id="nextPageBtn"
            onClick={() => onPdfPageChange(pdfCurrentPage + 1)}
            disabled={pdfCurrentPage >= pdfTotalPages}
            aria-label={t('nextPage')}
            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hidden file input for dragzone click */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onFileSelect(file);
            e.target.value = '';
          }
        }}
      />

      {/* Viewport Canvas Container */}
      <div
        ref={viewportRef}
        id="viewport"
        onMouseDown={handleMouseDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 w-full h-full overflow-hidden relative bg-slate-950 ${
          activeTool === 'draw' ? 'cursor-crosshair' : 'cursor-grab'
        }`}
      >
        <canvas id="docCanvas" ref={canvasRef} className="absolute top-0 left-0" aria-label={t('surveyDocViewer')} />

        {/* Empty State & Upload Dropzone */}
        {!imageSource && (
          <div id="emptyUploadPrompt" className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <div
              role="button"
              tabIndex={0}
              id="dropzoneClickTarget"
              aria-label={t('dropzoneTitle')}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className="max-w-md w-full p-8 rounded-2xl bg-slate-900/90 border-2 border-dashed border-slate-700 hover:border-blue-500 transition-all flex flex-col items-center shadow-2xl backdrop-blur-sm cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 group-hover:bg-blue-600/20 transition transform">
                <FileUp className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-1">{t('dropzoneTitle')}</h3>
              <p
                className="text-xs text-slate-400 mb-4 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: t('dropzoneDesc') }}
              />
              <span className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-900/30 transition flex items-center gap-1.5 pointer-events-none">
                <FolderOpen className="w-4 h-4" /> {t('selectFile')}
              </span>
            </div>
          </div>
        )}

        {/* Crop Region Badge */}
        {selectionBox && (
          <div
            id="boxCoordsBadge"
            className="absolute bottom-3 left-3 z-20 bg-slate-900/90 border border-slate-700 text-[10px] font-mono text-slate-300 px-2.5 py-1 rounded-md shadow pointer-events-none"
          >
            {t('cropRegion')}{' '}
            <span id="boxCoordsText">
              X:{Math.round(selectionBox.x)} Y:{Math.round(selectionBox.y)}{' '}
              {Math.round(selectionBox.w)}x{Math.round(selectionBox.h)}px
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
