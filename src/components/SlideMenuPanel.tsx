import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HardDrive, Star, Plus, Check } from 'lucide-react';
import { VaultFilterMode, CustomBadge } from '../types';
import { GlassBox } from './GlassBox';

interface SlideMenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilter: VaultFilterMode;
  selectedBadgeId: string | null;
  badges: CustomBadge[];
  onSelectFilter: (mode: VaultFilterMode, badgeId: string | null) => void;
  onCreateBadgeClick: () => void;
}

export const SlideMenuPanel: React.FC<SlideMenuPanelProps> = ({
  isOpen,
  onClose,
  currentFilter,
  selectedBadgeId,
  badges,
  onSelectFilter,
  onCreateBadgeClick
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative z-50 w-80 max-w-[85vw] h-full bg-[#0D0B18]/95 border-l border-white/10 p-6 flex flex-col shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white tracking-wide">Filter Vault</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Filters List */}
            <div className="mt-6 flex flex-col gap-3">
              <GlassBox
                onClick={() => {
                  onSelectFilter('ALL', null);
                  onClose();
                }}
                className={`p-3.5 flex items-center justify-between border ${
                  currentFilter === 'ALL'
                    ? 'border-purple-500/60 bg-purple-900/30'
                    : 'border-white/5 hover:border-white/20 bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <span className={`text-sm ${currentFilter === 'ALL' ? 'font-bold text-white' : 'font-medium text-white/80'}`}>
                    All Files & Folders
                  </span>
                </div>
                {currentFilter === 'ALL' && <Check className="w-4 h-4 text-purple-400" />}
              </GlassBox>

              <GlassBox
                onClick={() => {
                  onSelectFilter('STARRED', null);
                  onClose();
                }}
                className={`p-3.5 flex items-center justify-between border ${
                  currentFilter === 'STARRED'
                    ? 'border-amber-500/60 bg-amber-900/30'
                    : 'border-white/5 hover:border-white/20 bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <span className={`text-sm ${currentFilter === 'STARRED' ? 'font-bold text-white' : 'font-medium text-white/80'}`}>
                    Starred Items
                  </span>
                </div>
                {currentFilter === 'STARRED' && <Check className="w-4 h-4 text-amber-400" />}
              </GlassBox>
            </div>

            {/* Custom Badges Section */}
            <div className="mt-8 flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-white/40 tracking-wider uppercase">
                  Custom Badges
                </span>
                <button
                  onClick={onCreateBadgeClick}
                  className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition flex items-center gap-1 text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>

              <div className="mt-2 flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
                {badges.length === 0 ? (
                  <div className="text-center py-8 text-white/40 text-xs">
                    No custom badges created yet.
                  </div>
                ) : (
                  badges.map((badge) => {
                    const isSelected = currentFilter === 'BADGE' && selectedBadgeId === badge.id;
                    return (
                      <GlassBox
                        key={badge.id}
                        onClick={() => {
                          onSelectFilter('BADGE', badge.id);
                          onClose();
                        }}
                        className={`p-3 flex items-center justify-between border transition ${
                          isSelected
                            ? 'border-purple-400/60 bg-purple-900/25'
                            : 'border-white/5 hover:border-white/15 bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: badge.colorHex }}
                          />
                          <span className={`text-sm ${isSelected ? 'font-bold text-white' : 'text-white/80'}`}>
                            {badge.name}
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </GlassBox>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-center text-xs text-white/30">
              SepFol Cyber-AMOLED v1.0
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
