import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import {
  Plus,
  Folder,
  Layers,
  Timer,
  Upload,
  FolderPlus,
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { WorkspaceType, SpeedDialOption } from '../types';
import { GlassBox } from './GlassBox';
import { triggerHaptic } from '../utils/haptics';

interface WorkspaceDockProps {
  currentWorkspace: WorkspaceType;
  speedDialOptions: SpeedDialOption[];
  onWorkspaceChange: (ws: WorkspaceType) => void;
}

export const WorkspaceDock: React.FC<WorkspaceDockProps> = ({
  currentWorkspace,
  speedDialOptions,
  onWorkspaceChange,
}) => {
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  
  // Touch tracking for swipe up detection
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);

  const getOptionIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreateNewFolder':
      case 'NewFolder':
        return <FolderPlus className="w-4 h-4 text-white" />;
      case 'UploadFile':
      case 'Import':
        return <Upload className="w-4 h-4 text-white" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-white" />;
      case 'Timer':
      default:
        return <Timer className="w-4 h-4 text-white" />;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    const timeDiff = Date.now() - touchStartTime.current;
    
    // If swiped up by > 25px within 400ms or swiped up by > 50px
    if ((diffY > 25 && timeDiff < 450) || diffY > 50) {
      setIsFabExpanded(false);
      setIsWorkspaceModalOpen(true);
    }
    touchStartY.current = null;
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If dragged/swiped up
    if (info.offset.y < -25 || info.velocity.y < -150) {
      setIsFabExpanded(false);
      setIsWorkspaceModalOpen(true);
    }
  };

  const handleSelectWorkspace = (ws: WorkspaceType) => {
    triggerHaptic('workspace');
    onWorkspaceChange(ws);
    setIsWorkspaceModalOpen(false);
  };

  return (
    <>
      {/* Background dark overlay for Speed Dial or Workspace Switcher */}
      <AnimatePresence>
        {(isFabExpanded || isWorkspaceModalOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsFabExpanded(false);
              setIsWorkspaceModalOpen(false);
            }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      {/* Middle-Bottom Animated Workspace Switcher Modal */}
      <AnimatePresence>
        {isWorkspaceModalOpen && (
          <div className="fixed inset-x-0 bottom-6 z-50 flex items-end justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ y: 120, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 120, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="w-full max-w-md pointer-events-auto select-none"
            >
              <GlassBox className="p-5 rounded-3xl border border-white/20 bg-[#0E0C18]/95 shadow-2xl backdrop-blur-2xl flex flex-col gap-4">
                {/* Grab Handle & Header */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-1.5 rounded-full bg-white/25" />
                  <div className="w-full flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white tracking-wide">
                          Switch Workspace
                        </h3>
                        <p className="text-xs text-white/50">
                          Select your active study environment
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsWorkspaceModalOpen(false)}
                      className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Workspace Cards */}
                <div className="grid grid-cols-1 gap-3 pt-1">
                  {/* Vault Workspace Card */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectWorkspace('DATA')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      currentWorkspace === 'DATA'
                        ? 'border-purple-500/80 bg-gradient-to-r from-purple-950/60 to-[#1A1230] shadow-lg shadow-purple-950/40'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          currentWorkspace === 'DATA'
                            ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-md shadow-purple-600/30'
                            : 'bg-white/5 text-white/70'
                        }`}
                      >
                        <Folder className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-white">
                          SepFol Vault
                        </span>
                        <span className="text-xs text-white/50 line-clamp-1">
                          File tree, PDF/doc reader, high-res image zoom & tags
                        </span>
                      </div>
                    </div>

                    {currentWorkspace === 'DATA' && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </div>
                    )}
                  </motion.div>

                  {/* Flashcards Workspace Card */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectWorkspace('FLASHCARDS')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      currentWorkspace === 'FLASHCARDS'
                        ? 'border-pink-500/80 bg-gradient-to-r from-pink-950/60 to-[#2A0E22] shadow-lg shadow-pink-950/40'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                          currentWorkspace === 'FLASHCARDS'
                            ? 'bg-gradient-to-br from-pink-600 to-rose-700 text-white shadow-md shadow-pink-600/30'
                            : 'bg-white/5 text-white/70'
                        }`}
                      >
                        <Layers className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-bold text-white">
                          Revision Flashcards
                        </span>
                        <span className="text-xs text-white/50 line-clamp-1">
                          3D interactive flip cards, active recall & decks
                        </span>
                      </div>
                    </div>

                    {currentWorkspace === 'FLASHCARDS' && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </div>
                    )}
                  </motion.div>
                </div>
              </GlassBox>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button & Speed Dial (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
        <div className="relative pointer-events-auto flex flex-col items-end">
          {/* Speed Dial Menu Items */}
          <AnimatePresence>
            {isFabExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.9 }}
                transition={{ duration: 0.18 }}
                className="absolute bottom-16 right-0 flex flex-col items-end gap-3 pb-2 select-none"
              >
                {/* Switch Workspace Quick Option inside Speed Dial */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0 }}
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => {
                    triggerHaptic('selection');
                    setIsFabExpanded(false);
                    setIsWorkspaceModalOpen(true);
                  }}
                >
                  <div className="px-3.5 py-2 rounded-xl border border-white/25 bg-[#181528]/95 shadow-2xl text-xs font-semibold text-white whitespace-nowrap group-hover:border-purple-400 group-hover:bg-[#201C35] transition backdrop-blur-md">
                    Switch Workspace
                  </div>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-xl shadow-purple-950/60 bg-gradient-to-tr from-purple-600 to-pink-600 border border-white/20 transition-transform group-hover:scale-105">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </motion.div>

                {speedDialOptions.map((opt, idx) => (
                  <motion.div
                    key={opt.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (idx + 1) * 0.04 }}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => {
                      triggerHaptic('light');
                      setIsFabExpanded(false);
                      opt.onClick();
                    }}
                  >
                    <div className="px-3.5 py-2 rounded-xl border border-white/25 bg-[#181528]/95 shadow-2xl text-xs font-semibold text-white whitespace-nowrap group-hover:border-white/40 group-hover:bg-[#201C35] transition backdrop-blur-md">
                      {opt.label}
                    </div>

                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shadow-xl border border-white/20 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: opt.color }}
                    >
                      {getOptionIcon(opt.icon)}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Draggable & Swipeable Smart FAB */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.4}
            onDragEnd={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            whileTap={{ scale: 0.93 }}
            className="cursor-grab active:cursor-grabbing touch-none"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('fab');
                setIsFabExpanded(!isFabExpanded);
              }}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-950/70 transition-all ${
                isFabExpanded
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 ring-2 ring-white/20'
                  : 'bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-500 hover:brightness-110'
              }`}
            >
              <motion.div
                animate={{ rotate: isFabExpanded ? 135 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="w-7 h-7 text-white" />
              </motion.div>
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
};

