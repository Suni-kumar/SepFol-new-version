import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Download, Upload, Trash2, Edit2, Tag, Vibrate } from 'lucide-react';
import { CustomBadge, SepFolThemeType, VaultItem, LiquidGlassColor } from '../types';
import { GlassBox } from './GlassBox';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Droplets } from 'lucide-react';
import { storage } from '../storage/db';
import { triggerHaptic } from '../utils/haptics';

interface SimpleInputDialogProps {
  isOpen: boolean;
  title: string;
  initialText?: string;
  placeholder?: string;
  confirmButtonText?: string;
  onDismiss: () => void;
  onConfirm: (text: string) => void;
}

export const SimpleInputDialog: React.FC<SimpleInputDialogProps> = ({
  isOpen,
  title,
  initialText = '',
  placeholder = 'Enter name...',
  confirmButtonText = 'Confirm',
  onDismiss,
  onConfirm,
}) => {
  const [text, setText] = useState(initialText);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <GlassBox className="p-6 border-white/20 bg-[#13111C]/95 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">{title}</h3>

            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={placeholder}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && text.trim()) {
                  onConfirm(text.trim());
                }
              }}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition mb-6"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onDismiss}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!text.trim()}
                onClick={() => {
                  if (text.trim()) onConfirm(text.trim());
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30 transition"
              >
                {confirmButtonText}
              </button>
            </div>
          </GlassBox>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

interface CreateBadgeDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
  onConfirm: (name: string, colorHex: string) => void;
}

const BADGE_COLORS = [
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#F97316', // Orange
];

export const CreateBadgeDialog: React.FC<CreateBadgeDialogProps> = ({
  isOpen,
  onDismiss,
  onConfirm,
}) => {
  const [badgeName, setBadgeName] = useState('');
  const [selectedColor, setSelectedColor] = useState(BADGE_COLORS[0]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <GlassBox className="p-6 border-white/20 bg-[#13111C]/95 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">New Custom Badge</h3>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                Badge Name
              </label>
              <input
                type="text"
                value={badgeName}
                onChange={(e) => setBadgeName(e.target.value)}
                placeholder="e.g. Important, Formulas, Exam 2026"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                Select Color
              </label>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {BADGE_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setSelectedColor(hex)}
                    style={{ backgroundColor: hex }}
                    className={`w-9 h-9 rounded-full transition-transform flex items-center justify-center ${
                      selectedColor === hex ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#13111C]' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {selectedColor === hex && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onDismiss}
                className="px-4 py-2 rounded-xl text-sm text-white/70 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!badgeName.trim()}
                onClick={() => {
                  if (badgeName.trim()) {
                    onConfirm(badgeName.trim(), selectedColor);
                  }
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 shadow-lg shadow-purple-900/30 transition"
              >
                Add Badge
              </button>
            </div>
          </GlassBox>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

interface SettingsDialogProps {
  isOpen: boolean;
  currentTheme: SepFolThemeType;
  onThemeChange: (theme: SepFolThemeType) => void;
  currentGridCols: number;
  onGridColsChange: (cols: number) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => void;
  onDismiss: () => void;
}

const THEMES: { id: SepFolThemeType; name: string; color: string }[] = [
  { id: 'CYBER_AMOLED', name: 'Cyber AMOLED', color: '#8B5CF6' },
  { id: 'MIDNIGHT_CYAN', name: 'Midnight Cyan', color: '#06B6D4' },
  { id: 'EMERALD_AURORA', name: 'Emerald Aurora', color: '#10B981' },
  { id: 'SUNSET_EMBER', name: 'Sunset Ember', color: '#F97316' },
  { id: 'NEBULA_VIOLET', name: 'Nebula Violet', color: '#EC4899' },
  { id: 'FROSTED_VELVET', name: 'Frosted Velvet', color: '#6366F1' },
];

const LIQUID_COLORS: { id: LiquidGlassColor; name: string; gradient: string; borderHex: string }[] = [
  { id: 'AURORA_OPAL', name: 'Aurora Opal (Pearl)', gradient: 'from-purple-300 via-pink-200 to-cyan-200', borderHex: '#E9D5FF' },
  { id: 'NEBULA_MIDNIGHT', name: 'Nebula Midnight', gradient: 'from-purple-600 via-indigo-700 to-pink-600', borderHex: '#C084FC' },
  { id: 'AQUA_CRYSTAL', name: 'Aqua Crystal', gradient: 'from-cyan-400 via-teal-500 to-blue-500', borderHex: '#22D3EE' },
  { id: 'ROSE_QUARTZ', name: 'Rose Quartz', gradient: 'from-rose-400 via-pink-500 to-amber-400', borderHex: '#FB7185' },
  { id: 'EMERALD_MINT', name: 'Emerald Mint', gradient: 'from-emerald-400 via-teal-400 to-cyan-400', borderHex: '#34D399' },
];

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  currentTheme,
  onThemeChange,
  currentGridCols,
  onGridColsChange,
  onExportBackup,
  onImportBackup,
  onDismiss,
}) => {
  const { visualMode, setVisualMode, liquidColor, setLiquidColor } = useTheme();
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => storage.getHapticsEnabled());
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportBackup(content);
        onDismiss();
      }
    };
    reader.readAsText(file);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          <GlassBox className="p-6 border-white/20 bg-[#13111C]/95 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Vault Settings</h3>
              <button onClick={onDismiss} className="p-1 rounded-full text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Glass Engine Theme Toggle */}
            <div className="mt-6 p-4 rounded-2xl border border-white/15 bg-white/[0.03]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Visual Engine Theme</h4>
                    <p className="text-[11px] text-white/50">Toggle 3D Liquid Glass or Classic Obsidian</p>
                  </div>
                </div>
              </div>

              {/* Mode Switcher Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisualMode('OBSIDIAN')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center ${
                    visualMode === 'OBSIDIAN'
                      ? 'bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-950/40'
                      : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="text-xs font-bold">Classic Obsidian</span>
                  <span className="text-[10px] text-white/40">Clean Dark UI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVisualMode('LIQUID_GLASS')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-center ${
                    visualMode === 'LIQUID_GLASS'
                      ? 'bg-gradient-to-br from-pink-500/30 to-purple-600/30 border-pink-400 text-white shadow-lg shadow-pink-950/40'
                      : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-pink-400" />
                    <span className="text-xs font-bold">3D Liquid Glass</span>
                  </div>
                  <span className="text-[10px] text-white/40">Iridescent Sheen</span>
                </button>
              </div>

              {/* Liquid Color Styles (only if Liquid Glass is active) */}
              {visualMode === 'LIQUID_GLASS' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-3 border-t border-white/10"
                >
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">
                    Liquid Glass Palette
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LIQUID_COLORS.map((lc) => (
                      <button
                        key={lc.id}
                        type="button"
                        onClick={() => setLiquidColor(lc.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                          liquidColor === lc.id
                            ? 'bg-white/[0.12] border-white/60 text-white shadow-md'
                            : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 rounded-full bg-gradient-to-tr ${lc.gradient} shadow-inner border border-white/40`}
                          />
                          <span className="text-xs font-medium">{lc.name}</span>
                        </div>
                        {liquidColor === lc.id && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Grid Columns */}
            <div className="mt-5">
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2.5">
                Vault Grid Layout
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((cols) => (
                  <button
                    key={cols}
                    type="button"
                    onClick={() => onGridColsChange(cols)}
                    className={`py-2.5 rounded-xl font-semibold text-xs transition border ${
                      currentGridCols === cols
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/40'
                        : 'bg-white/[0.04] text-white/70 border-white/10 hover:bg-white/[0.08]'
                    }`}
                  >
                    {cols} Col{cols > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Presets */}
            <div className="mt-6">
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2.5">
                Accent Theme Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      onThemeChange(theme.id);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition text-left ${
                      currentTheme === theme.id
                        ? 'bg-white/[0.12] border-white/40 text-white'
                        : 'bg-white/[0.03] border-white/5 text-white/70 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: theme.color }} />
                    <span className="text-xs font-medium truncate">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Haptic Feedback (Vibration) Toggle */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Vibrate className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Haptic Touch Feedback</div>
                    <div className="text-[11px] text-white/50">Vibrate on FAB, workspace switch & cards</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !hapticsEnabled;
                    setHapticsEnabled(next);
                    storage.saveHapticsEnabled(next);
                    if (next) triggerHaptic('medium');
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    hapticsEnabled ? 'bg-purple-600 shadow-md shadow-purple-900/50' : 'bg-white/20'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Backup & Restore */}
            <div className="mt-6">
              <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2.5">
                Data Backup & Restore
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onExportBackup}
                  className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 transition flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Upload className="w-4 h-4" />
                  <span>Restore Backup</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={onDismiss}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/20 transition"
              >
                Done
              </button>
            </div>
          </GlassBox>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

interface ItemManageModalProps {
  isOpen: boolean;
  item: VaultItem | null;
  allBadges: CustomBadge[];
  currentBadges: string[];
  onToggleBadge: (badgeId: string) => void;
  onRename: (item: VaultItem) => void;
  onDelete: (item: VaultItem) => void;
  onDismiss: () => void;
}

export const ItemManageModal: React.FC<ItemManageModalProps> = ({
  isOpen,
  item,
  allBadges,
  currentBadges,
  onToggleBadge,
  onRename,
  onDelete,
  onDismiss,
}) => {
  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 w-full max-w-md max-h-[85vh] flex flex-col"
        >
          <GlassBox className="p-6 border-white/20 bg-[#13111C]/95 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white truncate max-w-[260px]">{item.name}</h3>
              <button onClick={onDismiss} className="p-1 text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions: Rename & Delete */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={() => onRename(item)}
                className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Rename</span>
              </button>

              <button
                type="button"
                onClick={() => onDelete(item)}
                className="py-2.5 px-4 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-900/30 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>

            {/* Badges Assignment */}
            <div className="mt-6 flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white/50 uppercase tracking-wider mb-3">
                <Tag className="w-3.5 h-3.5 text-purple-400" />
                <span>Assign Badges / Tags</span>
              </div>

              <div className="max-h-48 overflow-y-auto pr-1 flex flex-col gap-2">
                {allBadges.length === 0 ? (
                  <div className="text-center py-4 text-xs text-white/40">
                    No custom badges available yet.
                  </div>
                ) : (
                  allBadges.map((badge) => {
                    const isAssigned = currentBadges.includes(badge.id);
                    return (
                      <button
                        key={badge.id}
                        type="button"
                        onClick={() => onToggleBadge(badge.id)}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition ${
                          isAssigned
                            ? 'border-purple-500/60 bg-purple-950/40 text-white'
                            : 'border-white/5 bg-white/[0.02] text-white/70 hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: badge.colorHex }} />
                          <span className="text-xs font-medium">{badge.name}</span>
                        </div>
                        {isAssigned && <Check className="w-4 h-4 text-purple-400" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onDismiss}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition"
              >
                Done
              </button>
            </div>
          </GlassBox>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

interface AiDeckDialogProps {
  isOpen: boolean;
  onDismiss: () => void;
  onConfirm: (name: string, topic: string, count: number) => void;
}

export const AiDeckDialog: React.FC<AiDeckDialogProps> = ({
  isOpen,
  onDismiss,
  onConfirm,
}) => {
  const [deckName, setDeckName] = useState('');
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isGenerating ? onDismiss : undefined}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 w-full max-w-lg"
        >
          <GlassBox className="p-6 border-white/20 bg-[#13111C]/95 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Flashcards</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                  Deck Name
                </label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="e.g. Biology Chapter 4"
                  disabled={isGenerating}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                  Topic or Source Text
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Paste your notes or describe a topic..."
                  rows={4}
                  disabled={isGenerating}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition disabled:opacity-50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                  Number of Cards ({count})
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  disabled={isGenerating}
                  className="w-full accent-purple-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={onDismiss}
                disabled={isGenerating}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!deckName.trim() || !topic.trim() || isGenerating}
                onClick={async () => {
                  if (deckName.trim() && topic.trim()) {
                    setIsGenerating(true);
                    await onConfirm(deckName.trim(), topic.trim(), count);
                    setIsGenerating(false);
                  }
                }}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-900/30 transition flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Deck
                  </>
                )}
              </button>
            </div>
          </GlassBox>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
