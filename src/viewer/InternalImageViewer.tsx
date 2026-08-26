import React, { useState, useRef } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';
import { VaultItem } from '../types';

interface InternalImageViewerProps {
  item: VaultItem;
  onBack: () => void;
}

export const InternalImageViewer: React.FC<InternalImageViewerProps> = ({
  item,
  onBack,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, posX: 0, posY: 0 });

  const handleZoomIn = () => setScale((prev) => Math.min(5, prev + 0.5));
  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(1, prev - 0.5);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (scale <= 1) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || scale <= 1) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    setPosition({
      x: dragStartRef.current.posX + dx,
      y: dragStartRef.current.posY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      if ((e.target as HTMLElement).hasPointerCapture(e.pointerId)) {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      }
    } catch {}
  };

  const handleDownload = () => {
    if (!item.contentData) return;
    const a = document.createElement('a');
    a.href = item.contentData;
    a.download = item.name;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col select-none overflow-hidden">
      {/* Top Header Bar */}
      <div className="h-16 px-4 flex items-center justify-between bg-black/80 backdrop-blur-md border-b border-white/10 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="max-w-[200px] sm:max-w-md truncate">
            <h2 className="text-sm font-semibold text-white truncate">{item.name}</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">
              {item.extension.toUpperCase()} Image • {Math.round(item.sizeBytes / 1024)} KB
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 disabled:opacity-30 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-white/70 w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 5}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 disabled:opacity-30 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 transition"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {item.contentData && (
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 transition"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className={`flex-1 flex items-center justify-center overflow-hidden p-4 ${
          scale > 1 ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {item.extension === 'svg' && item.contentData?.startsWith('<svg') ? (
          <div
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
              transition: isDraggingRef.current ? 'none' : 'transform 0.15s ease-out',
            }}
            className="w-full max-w-2xl max-h-[80vh] flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: item.contentData }}
          />
        ) : (
          <img
            src={item.contentData || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop'}
            alt={item.name}
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
              transition: isDraggingRef.current ? 'none' : 'transform 0.15s ease-out',
            }}
            className="max-h-[82vh] max-w-[90vw] object-contain rounded-lg shadow-2xl pointer-events-none"
            draggable={false}
          />
        )}
      </div>
    </div>
  );
};
