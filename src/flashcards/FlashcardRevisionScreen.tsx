import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle,
  Plus,
  List,
  BookOpen,
  Trash2,
  X
} from 'lucide-react';
import { FlashDeck, FlashCard } from '../types';
import { storage } from '../storage/db';
import { GlassBox } from '../components/GlassBox';

interface FlashcardRevisionScreenProps {
  deck: FlashDeck;
  onBack: () => void;
  onDeckUpdated: () => void;
}

const PALETTES = [
  { name: 'Cyber Sapphire', from: 'from-blue-600/30', to: 'to-indigo-950/80', border: 'border-blue-500/40', accent: '#3B82F6' },
  { name: 'Nebula Violet', from: 'from-purple-600/30', to: 'to-pink-950/80', border: 'border-purple-500/40', accent: '#8B5CF6' },
  { name: 'Emerald Aurora', from: 'from-emerald-600/30', to: 'to-teal-950/80', border: 'border-emerald-500/40', accent: '#10B981' },
  { name: 'Sunset Ember', from: 'from-orange-600/30', to: 'to-red-950/80', border: 'border-orange-500/40', accent: '#F97316' },
  { name: 'Obsidian Cyan', from: 'from-cyan-600/30', to: 'to-slate-950/80', border: 'border-cyan-500/40', accent: '#06B6D4' },
  { name: 'Frosted Velvet', from: 'from-fuchsia-600/30', to: 'to-purple-950/80', border: 'border-fuchsia-500/40', accent: '#D946EF' },
];

export const FlashcardRevisionScreen: React.FC<FlashcardRevisionScreenProps> = ({
  deck,
  onBack,
  onDeckUpdated,
}) => {
  const [cards, setCards] = useState<FlashCard[]>(deck.cards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Dialogs
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isCardManagerOpen, setIsCardManagerOpen] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const currentCard = cards[currentIndex];
  const palette = PALETTES[deck.paletteIndex % PALETTES.length] || PALETTES[0];

  const updateAndSaveCards = (newCards: FlashCard[]) => {
    setCards(newCards);
    const allDecks = storage.getDecks();
    const target = allDecks.find((d) => d.id === deck.id);
    if (target) {
      target.cards = newCards;
      storage.saveDecks(allDecks);
      onDeckUpdated();
    }
  };

  const handleToggleMastered = () => {
    if (!currentCard) return;
    const nextMastered = !currentCard.isMastered;
    const updated = cards.map((c, i) =>
      i === currentIndex ? { ...c, isMastered: nextMastered } : c
    );
    updateAndSaveCards(updated);

    if (nextMastered) {
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { y: 0.7 },
        colors: [palette.accent, '#10B981', '#F59E0B'],
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleAddCard = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const newCardItem: FlashCard = {
      id: 'c_' + Date.now(),
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      isMastered: false,
    };
    const updated = [...cards, newCardItem];
    updateAndSaveCards(updated);
    setNewQuestion('');
    setNewAnswer('');
    setIsAddCardOpen(false);
    setCurrentIndex(updated.length - 1);
    setIsFlipped(false);
  };

  const handleDeleteCard = (cardId: string) => {
    const updated = cards.filter((c) => c.id !== cardId);
    updateAndSaveCards(updated);
    if (currentIndex >= updated.length) {
      setCurrentIndex(Math.max(0, updated.length - 1));
    }
    setIsFlipped(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#07060B] select-none pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-20 px-4 sm:px-6 py-3.5 bg-[#07060B]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="max-w-[200px] sm:max-w-md truncate">
            <h1 className="text-base font-bold text-white truncate">{deck.name}</h1>
            <span className="text-[11px] text-white/40 font-medium">
              {cards.length} Flashcards • {cards.filter((c) => c.isMastered).length} Mastered
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setIsCardManagerOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition"
            title="Card Manager"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsAddCardOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-900/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Card</span>
          </button>
        </div>
      </header>

      {/* Main Flashcard Revision Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-xl mx-auto w-full">
        {cards.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-base font-bold text-white/80">No flashcards in deck</h3>
            <p className="text-xs text-white/40 max-w-xs mt-1 mb-6">
              Start adding questions and answers to begin your revision session.
            </p>
            <button
              onClick={() => setIsAddCardOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg transition"
            >
              Add First Card
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            {/* Counter and Mastered status banner */}
            <div className="w-full flex items-center justify-between mb-4 px-2">
              <span className="text-xs font-mono text-white/50 tracking-wider">
                CARD {currentIndex + 1} OF {cards.length}
              </span>

              <button
                onClick={handleToggleMastered}
                className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition ${
                  currentCard?.isMastered
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                }`}
              >
                <CheckCircle className={`w-3.5 h-3.5 ${currentCard?.isMastered ? 'fill-emerald-400/30 text-emerald-400' : ''}`} />
                <span>{currentCard?.isMastered ? 'Mastered' : 'Mark Mastered'}</span>
              </button>
            </div>

            {/* 3D Flippable Card Stage */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[300px] sm:min-h-[340px] perspective-1000 cursor-pointer"
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className="w-full h-full relative transform-style-3d min-h-[300px] sm:min-h-[340px]"
              >
                {/* FRONT FACE (Question / Concept) */}
                <div className={`absolute inset-0 backface-hidden rounded-3xl p-6 sm:p-8 flex flex-col justify-between border ${palette.border} bg-gradient-to-br ${palette.from} ${palette.to} shadow-2xl backdrop-blur-xl`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                      QUESTION / CONCEPT
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsReaderOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition"
                      title="Read Full Text"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="my-auto py-4">
                    <p className="text-lg sm:text-xl font-bold text-white leading-relaxed text-center font-display">
                      {currentCard?.question}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-white/40 font-medium">
                    <RotateCw className="w-3.5 h-3.5 text-white/50" />
                    <span>Tap to flip and reveal answer</span>
                  </div>
                </div>

                {/* BACK FACE (Answer / Revision Note) */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-purple-400/40 bg-gradient-to-br from-[#1E1B2E] to-[#0D0B18] shadow-2xl backdrop-blur-xl`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest">
                      REVISION ANSWER
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsReaderOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition"
                      title="Read Full Text"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="my-auto py-4 overflow-y-auto max-h-[220px]">
                    <p className="text-base sm:text-lg font-medium text-white/95 leading-relaxed text-center">
                      {currentCard?.answer}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-white/40 font-medium">
                    <RotateCw className="w-3.5 h-3.5 text-white/50" />
                    <span>Tap to flip back to question</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Card Navigation Controls */}
            <div className="w-full flex items-center justify-between mt-6 px-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex <= 0}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition"
                title="Flip Card"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex >= cards.length - 1}
                className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Add Card Dialog */}
      <AnimatePresence>
        {isAddCardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddCardOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-lg"
            >
              <GlassBox className="p-6 border-white/20 bg-[#13111C]/95 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white">Add Revision Flashcard</h3>
                  <button onClick={() => setIsAddCardOpen(false)} className="p-1 text-white/60 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                      Front: Question or Key Term
                    </label>
                    <textarea
                      rows={3}
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="e.g. What is the First Law of Thermodynamics?"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">
                      Back: Answer or Detailed Explanation
                    </label>
                    <textarea
                      rows={4}
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      placeholder="e.g. Energy cannot be created or destroyed, only transformed (ΔU = Q - W)."
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-500 transition"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddCardOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-white/70 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!newQuestion.trim() || !newAnswer.trim()}
                    onClick={handleAddCard}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 shadow-lg shadow-purple-900/30 transition"
                  >
                    Add Flashcard
                  </button>
                </div>
              </GlassBox>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Card Manager Sheet */}
      <AnimatePresence>
        {isCardManagerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCardManagerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-xl max-h-[85vh] flex flex-col"
            >
              <GlassBox className="p-6 border-white/20 bg-[#13111C]/95 shadow-2xl flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white">Deck Cards ({cards.length})</h3>
                  <button onClick={() => setIsCardManagerOpen(false)} className="p-1 text-white/60 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 flex-1 overflow-y-auto pr-1 flex flex-col gap-3 max-h-[50vh]">
                  {cards.map((card, idx) => (
                    <div
                      key={card.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsFlipped(false);
                        setIsCardManagerOpen(false);
                      }}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                        idx === currentIndex
                          ? 'border-purple-500 bg-purple-950/30'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-purple-400 font-bold">#{idx + 1}</span>
                          <p className="text-xs font-semibold text-white truncate">{card.question}</p>
                        </div>
                        <p className="text-[11px] text-white/40 truncate mt-0.5">{card.answer}</p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(card.id);
                        }}
                        className="p-1.5 text-white/40 hover:text-red-400 transition"
                        title="Delete Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCardManagerOpen(false)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition"
                  >
                    Done
                  </button>
                </div>
              </GlassBox>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Content Reader Modal */}
      <AnimatePresence>
        {isReaderOpen && currentCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReaderOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-lg"
            >
              <GlassBox className="p-6 border-white/20 bg-[#13111C]/95 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-base font-bold text-white">Full Card Details</h3>
                  <button onClick={() => setIsReaderOpen(false)} className="p-1 text-white/60 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                      Question / Concept
                    </span>
                    <p className="text-sm font-semibold text-white leading-relaxed">{currentCard.question}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">
                      Answer / Explanation
                    </span>
                    <p className="text-sm text-white/90 leading-relaxed">{currentCard.answer}</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsReaderOpen(false)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition"
                  >
                    Close
                  </button>
                </div>
              </GlassBox>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
