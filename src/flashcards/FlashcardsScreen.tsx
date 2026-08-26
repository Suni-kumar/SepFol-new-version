import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import {
  Layers,
  MoreVertical,
  CheckSquare,
  Square,
  Trash2,
  BookOpen,
  LayoutGrid,
  Settings
} from 'lucide-react';
import { FlashDeck } from '../types';
import { storage } from '../storage/db';
import { GlassBox } from '../components/GlassBox';
import { SimpleInputDialog, SettingsDialog, AiDeckDialog } from '../components/Dialogs';
import { useTheme } from '../context/ThemeContext';
import { triggerHaptic } from '../utils/haptics';

export interface FlashcardsActionsHandle {
  createDeck: () => void;
  generateAiDeck: () => void;
}

interface FlashcardsScreenProps {
  onOpenDeck: (deck: FlashDeck) => void;
  actionsRef?: React.MutableRefObject<FlashcardsActionsHandle | null>;
}

const PALETTES = [
  { name: 'Cyber Sapphire', from: 'from-blue-600/30', to: 'to-indigo-950/80', border: 'border-blue-500/40', accent: '#3B82F6' },
  { name: 'Nebula Violet', from: 'from-purple-600/30', to: 'to-pink-950/80', border: 'border-purple-500/40', accent: '#8B5CF6' },
  { name: 'Emerald Aurora', from: 'from-emerald-600/30', to: 'to-teal-950/80', border: 'border-emerald-500/40', accent: '#10B981' },
  { name: 'Sunset Ember', from: 'from-orange-600/30', to: 'to-red-950/80', border: 'border-orange-500/40', accent: '#F97316' },
  { name: 'Obsidian Cyan', from: 'from-cyan-600/30', to: 'to-slate-950/80', border: 'border-cyan-500/40', accent: '#06B6D4' },
  { name: 'Frosted Velvet', from: 'from-fuchsia-600/30', to: 'to-purple-950/80', border: 'border-fuchsia-500/40', accent: '#D946EF' },
];

export const FlashcardsScreen: React.FC<FlashcardsScreenProps> = ({
  onOpenDeck,
  actionsRef,
}) => {
  const { accentTheme, setAccentTheme } = useTheme();
  const [decks, setDecks] = useState<FlashDeck[]>([]);
  const [gridCols, setGridCols] = useState<number>(2);

  // Selection Mode
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedDeckIds, setSelectedDeckIds] = useState<Set<string>>(new Set());

  // Dialogs
  const [isCreateDeckOpen, setIsCreateDeckOpen] = useState(false);
  const [isAiDeckOpen, setIsAiDeckOpen] = useState(false);
  const [deckToRename, setDeckToRename] = useState<FlashDeck | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const refreshDecks = () => {
    setDecks(storage.getDecks());
  };

  useEffect(() => {
    refreshDecks();
  }, []);

  // Bind actions for FAB Speed Dial
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        createDeck: () => setIsCreateDeckOpen(true),
        generateAiDeck: () => setIsAiDeckOpen(true),
      };
    }
    return () => {
      if (actionsRef) {
        actionsRef.current = null;
      }
    };
  }, [actionsRef]);

  const toggleSelectDeck = (deckId: string) => {
    setSelectedDeckIds((prev) => {
      const next = new Set(prev);
      if (next.has(deckId)) {
        next.delete(deckId);
      } else {
        next.add(deckId);
      }
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (confirm(`Delete ${selectedDeckIds.size} selected deck(s)?`)) {
      const remaining = decks.filter((d) => !selectedDeckIds.has(d.id));
      storage.saveDecks(remaining);
      setSelectedDeckIds(new Set());
      setIsSelectionMode(false);
      refreshDecks();
    }
  };

  const getGridClass = () => {
    switch (gridCols) {
      case 1:
        return 'grid-cols-1';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      case 2:
      default:
        return 'grid-cols-1 sm:grid-cols-2';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 px-4 sm:px-6 py-3.5 bg-[#07060B]/85 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Revision Flashcards</h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {isSelectionMode ? (
            <>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedDeckIds.size === 0}
                className="p-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 disabled:opacity-30 transition"
                title="Delete Selected Decks"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedDeckIds(new Set());
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setGridCols((prev) => (prev === 2 ? 1 : prev === 1 ? 3 : 2))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition"
                title="Toggle Columns"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsSelectionMode(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition"
                title="Select Decks"
              >
                <CheckSquare className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition"
                title="Workspace Settings & Themes"
              >
                <Settings className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Decks Grid */}
      <main className="flex-1 px-4 sm:px-6 pt-5">
        {decks.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-base font-semibold text-white/80">No decks created yet</h3>
            <p className="text-xs text-white/40 max-w-xs mt-1 mb-6">
              Create your first flashcard deck to begin active recall study sessions.
            </p>
            <button
              onClick={() => setIsCreateDeckOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition"
            >
              Create First Deck
            </button>
          </div>
        ) : (
          <div className={`grid ${getGridClass()} gap-4`}>
            {decks.map((deck) => {
              const isSelected = selectedDeckIds.has(deck.id);
              const palette = PALETTES[deck.paletteIndex % PALETTES.length] || PALETTES[0];
              const totalCards = deck.cards?.length || 0;
              const masteredCount = deck.cards?.filter((c) => c.isMastered).length || 0;
              const percent = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

              return (
                <GlassBox
                  key={deck.id}
                  onClick={() => {
                    triggerHaptic('selection');
                    if (isSelectionMode) {
                      toggleSelectDeck(deck.id);
                    } else {
                      onOpenDeck(deck);
                    }
                  }}
                  className={`p-5 flex flex-col justify-between min-h-[160px] border transition relative ${
                    isSelected
                      ? 'border-purple-500 bg-purple-950/40 ring-1 ring-purple-500'
                      : `${palette.border} bg-gradient-to-br ${palette.from} ${palette.to}`
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: `${palette.accent}30`, borderColor: palette.accent }}
                      >
                        <BookOpen className="w-5 h-5" style={{ color: palette.accent }} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">
                          {deck.name}
                        </h3>
                        <span className="text-[11px] text-white/50 font-medium">
                          {totalCards} Card{totalCards !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isSelectionMode ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectDeck(deck.id);
                          }}
                          className="p-1 text-white/70"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-purple-400" />
                          ) : (
                            <Square className="w-5 h-5 text-white/40" />
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeckToRename(deck);
                          }}
                          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mastered Progress Bar */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-white/60 mb-1.5">
                      <span>Revision Progress</span>
                      <span className="font-mono" style={{ color: palette.accent }}>{percent}% ({masteredCount}/{totalCards})</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: palette.accent,
                        }}
                      />
                    </div>
                  </div>
                </GlassBox>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Deck Dialog */}
      <SimpleInputDialog
        isOpen={isCreateDeckOpen}
        title="Create New Flashcard Deck"
        placeholder="e.g. Molecular Genetics, GRE Vocabulary..."
        confirmButtonText="Create Deck"
        onDismiss={() => setIsCreateDeckOpen(false)}
        onConfirm={(name) => {
          storage.createDeck(name);
          setIsCreateDeckOpen(false);
          refreshDecks();
        }}
      />

      {/* AI Generate Deck Dialog */}
      <AiDeckDialog
        isOpen={isAiDeckOpen}
        onDismiss={() => setIsAiDeckOpen(false)}
        onConfirm={async (name, topic, count) => {
          try {
            const baseUrl = Capacitor.isNativePlatform() 
              ? 'https://ais-pre-egtloc5g4ul6x4r7vrdzze-479837758603.asia-east1.run.app' 
              : '';
            const res = await fetch(`${baseUrl}/api/generate-flashcards`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ topic, count })
            });
            if (!res.ok) {
              const data = await res.json();
              throw new Error(data.error || 'Failed to generate flashcards');
            }
            const data = await res.json();
            const newDeck = storage.createDeck(name);
            
            // Re-fetch all decks since createDeck updates storage but returns the object.
            // Actually, we can just mutate the newDeck we got and then save all decks.
            if (data.cards && Array.isArray(data.cards)) {
              data.cards.forEach((c: { front: string; back: string }) => {
                newDeck.cards.push({
                  id: 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
                  question: c.front,
                  answer: c.back,
                  isMastered: false
                });
              });
              const updatedDecks = storage.getDecks().map(d => d.id === newDeck.id ? newDeck : d);
              storage.saveDecks(updatedDecks);
            }
            setIsAiDeckOpen(false);
            refreshDecks();
          } catch (e: any) {
            alert(e.message);
          }
        }}
      />

      {/* Rename Deck Dialog */}
      <SimpleInputDialog
        isOpen={!!deckToRename}
        title="Rename Deck"
        initialText={deckToRename?.name || ''}
        placeholder="Enter new deck name..."
        confirmButtonText="Save"
        onDismiss={() => setDeckToRename(null)}
        onConfirm={(name) => {
          if (deckToRename) {
            const allDecks = storage.getDecks();
            const target = allDecks.find((d) => d.id === deckToRename.id);
            if (target) {
              target.name = name;
              storage.saveDecks(allDecks);
              refreshDecks();
            }
            setDeckToRename(null);
          }
        }}
      />
      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        currentTheme={accentTheme}
        onThemeChange={(theme) => setAccentTheme(theme)}
        currentGridCols={gridCols}
        onGridColsChange={(cols) => setGridCols(cols)}
        onExportBackup={() => {
          const json = storage.exportWorkspaceJson();
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `sepfol_backup_${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        onImportBackup={(jsonStr) => {
          if (storage.importWorkspaceJson(jsonStr)) {
            refreshDecks();
          }
        }}
        onDismiss={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
