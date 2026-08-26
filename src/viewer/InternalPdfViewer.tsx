import React, { useState, useEffect } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Bookmark, Download, FileText, Loader2, AlertCircle } from 'lucide-react';
import { VaultItem } from '../types';
import { storage } from '../storage/db';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface InternalPdfViewerProps {
  item: VaultItem;
  onBack: () => void;
}

export const InternalPdfViewer: React.FC<InternalPdfViewerProps> = ({
  item,
  onBack,
}) => {
  const initialPage = storage.getPdfPage(item.id) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [zoom, setZoom] = useState(100);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Save current page position bookmark
  useEffect(() => {
    storage.savePdfPage(item.id, currentPage);
  }, [item.id, currentPage]);

  const handleDownload = () => {
    if (!item.contentData) return;
    const a = document.createElement('a');
    a.href = item.contentData;
    a.download = item.name;
    a.click();
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setPdfError(error.message);
  };

  // If item is markdown or text
  const isTextDocument = item.extension === 'md' || item.extension === 'txt' || item.extension === 'json' || item.extension === 'csv';

  // Generate multi-page simulation if it's text/markdown
  const pages = isTextDocument
    ? (item.contentData || '').split('\n\n---\n\n').length > 1
      ? (item.contentData || '').split('\n\n---\n\n')
      : [item.contentData || '']
    : [item.contentData || ''];

  const isPdf = item.contentData?.startsWith('data:application/pdf') || item.extension === 'pdf';
  const totalPages = isPdf ? numPages : Math.max(1, pages.length);

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0C] flex flex-col select-none overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="h-16 px-4 flex items-center justify-between bg-[#13111C]/90 backdrop-blur-md border-b border-white/10 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="max-w-[180px] sm:max-w-md truncate">
            <h2 className="text-sm font-semibold text-white truncate">{item.name}</h2>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">
              Page {currentPage} of {totalPages || '?'} • Last Read Saved
            </span>
          </div>
        </div>

        {/* Page & Zoom Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {((!isPdf && totalPages > 1) || (isPdf && totalPages > 0)) && (
            <div className="flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded text-white/70 hover:text-white disabled:opacity-30 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-mono text-white/80">
                {currentPage}/{totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded text-white/70 hover:text-white disabled:opacity-30 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="hidden sm:flex items-center bg-white/5 rounded-lg border border-white/10 p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 20))}
              disabled={zoom <= 50}
              className="p-1.5 rounded text-white/70 hover:text-white disabled:opacity-30 transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono text-white/80 w-12 text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(250, z + 20))}
              disabled={zoom >= 250}
              className="p-1.5 rounded text-white/70 hover:text-white disabled:opacity-30 transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-lg border transition ${
              isBookmarked
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
            }`}
            title={isBookmarked ? 'Bookmarked' : 'Bookmark Page'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>

          {item.contentData && (
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 transition"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Reader Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="w-full max-w-3xl min-h-[75vh] bg-[#14121E] border border-white/15 rounded-2xl p-6 sm:p-10 shadow-2xl transition-transform duration-150"
        >
          {isTextDocument ? (
            <div className="prose prose-invert max-w-none text-white/90">
              <div className="flex items-center gap-2 pb-4 mb-6 border-b border-white/10 text-purple-400 font-semibold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>{item.name}</span>
              </div>
              <pre className="font-sans whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-white/85">
                {pages[currentPage - 1] || item.contentData}
              </pre>
            </div>
          ) : isPdf ? (
            <div className="w-full min-h-full flex flex-col items-center justify-center">
              {pdfError ? (
                <div className="flex flex-col items-center text-red-400/80 p-8 text-center bg-red-950/20 rounded-2xl border border-red-500/20">
                  <AlertCircle className="w-10 h-10 mb-3 text-red-500/60" />
                  <p className="font-semibold text-sm">Failed to load PDF</p>
                  <p className="text-xs opacity-75 mt-1">{pdfError}</p>
                  <button onClick={handleDownload} className="mt-6 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-xs font-medium text-red-300">
                    Download File Instead
                  </button>
                </div>
              ) : (
                <Document
                  file={item.contentData}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="flex flex-col items-center justify-center py-20 text-white/50">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-4" />
                      <span className="text-sm">Loading PDF Document...</span>
                    </div>
                  }
                  className="flex flex-col items-center w-full"
                >
                  {numPages > 0 && (
                    <Page 
                      pageNumber={currentPage} 
                      className="bg-white rounded-md overflow-hidden shadow-lg max-w-full"
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 64, 800) : 800}
                    />
                  )}
                </Document>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-white/60">
              <FileText className="w-12 h-12 text-purple-400/60 mb-3" />
              <p className="text-base font-semibold text-white">Document Preview</p>
              <p className="text-xs text-white/40 mt-1 max-w-sm">
                This document is securely stored in your SepFol Vault. You can download or read its raw contents.
              </p>
              {item.contentData && (
                <button
                  onClick={handleDownload}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition"
                >
                  Download {item.name}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
