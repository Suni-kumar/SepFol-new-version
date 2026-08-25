import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Folder as FolderIcon,
  FileText,
  Image as ImageIcon,
  Star,
  Search,
  MoreVertical,
  ChevronRight,
  Menu,
  Settings,
  Trash2,
  CheckSquare,
  Square,
  UploadCloud,
  FileCode,
  File
} from 'lucide-react';
import { VaultItem, VaultFilterMode, CustomBadge } from '../types';
import { storage } from '../storage/db';
import { GlassBox } from '../components/GlassBox';
import { SlideMenuPanel } from '../components/SlideMenuPanel';
import {
  SimpleInputDialog,
  CreateBadgeDialog,
  SettingsDialog,
  ItemManageModal
} from '../components/Dialogs';
import { useTheme } from '../context/ThemeContext';
import { triggerHaptic } from '../utils/haptics';

export interface FolderActionsHandle {
  createFolder: () => void;
  importFile: () => void;
}

interface FolderScreenProps {
  onOpenFile: (item: VaultItem) => void;
  actionsRef?: React.MutableRefObject<FolderActionsHandle | null>;
}

export const FolderScreen: React.FC<FolderScreenProps> = ({
  onOpenFile,
  actionsRef,
}) => {
  const { accentTheme, setAccentTheme, currentConfig } = useTheme();

  // Folder Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderHistory, setFolderHistory] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'Vault' }
  ]);

  // Data States
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [badges, setBadges] = useState<CustomBadge[]>([]);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  // Filter & Search
  const [filterMode, setFilterMode] = useState<VaultFilterMode>('ALL');
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Layout & Settings
  const [gridCols, setGridCols] = useState<number>(2);
  const [isSlideMenuOpen, setIsSlideMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Selection Mode (Batch operations)
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Modals & Dialogs
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isCreateBadgeOpen, setIsCreateBadgeOpen] = useState(false);
  const [managedItem, setManagedItem] = useState<VaultItem | null>(null);
  const [itemRenameTarget, setItemRenameTarget] = useState<VaultItem | null>(null);

  // File Upload Drop Zone
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Refresh data from storage
  const refreshData = () => {
    setVaultItems(storage.getVaultItems());
    setBadges(storage.getBadges());
    setStarredIds(storage.getStarredPaths());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Bind actions for FAB Speed Dial
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        createFolder: () => setIsCreateFolderOpen(true),
        importFile: () => fileInputRef.current?.click(),
      };
    }
    return () => {
      if (actionsRef) {
        actionsRef.current = null;
      }
    };
  }, [actionsRef]);

  // Current items in directory / filtered
  const visibleItems = useMemo(() => {
    let items = vaultItems;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return items.filter((item) => item.name.toLowerCase().includes(q));
    }

    if (filterMode === 'STARRED') {
      return items.filter((item) => starredIds.has(item.id));
    }

    if (filterMode === 'BADGE' && selectedBadgeId) {
      return items.filter((item) => {
        const itemBadgeList = storage.getItemBadges(item.id);
        return itemBadgeList.includes(selectedBadgeId);
      });
    }

    // Default: items in current folder
    return items
      .filter((item) => item.parentId === currentFolderId)
      .sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [vaultItems, currentFolderId, filterMode, selectedBadgeId, searchQuery, starredIds]);

  // Folder navigation handlers
  const handleOpenFolder = (folder: VaultItem) => {
    if (isSelectionMode) {
      toggleSelectItem(folder.id);
      return;
    }
    setCurrentFolderId(folder.id);
    setFolderHistory((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setFilterMode('ALL');
    setSelectedBadgeId(null);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    const target = folderHistory[index];
    setCurrentFolderId(target.id);
    setFolderHistory((prev) => prev.slice(0, index + 1));
    setFilterMode('ALL');
    setSelectedBadgeId(null);
  };

  // Star Toggle
  const handleToggleStar = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    storage.toggleStar(itemId);
    refreshData();
  };

  // Selection Mode Handlers
  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (confirm(`Delete ${selectedItemIds.size} selected item(s)?`)) {
      selectedItemIds.forEach((id) => storage.deleteItem(id));
      setSelectedItemIds(new Set());
      setIsSelectionMode(false);
      refreshData();
    }
  };

  const handleSelectAll = () => {
    if (selectedItemIds.size === visibleItems.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(visibleItems.map((i) => i.id)));
    }
  };

  // File Upload Handlers
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      await storage.importFile(currentFolderId, files[i]);
    }
    refreshData();
  };

  // Get item icon based on type
  const getItemIcon = (item: VaultItem) => {
    if (item.isDirectory) {
      return <FolderIcon className="w-8 h-8 text-purple-400 fill-purple-400/20" />;
    }
    const ext = item.extension.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'].includes(ext)) {
      return <ImageIcon className="w-8 h-8 text-pink-400" />;
    }
    if (['pdf', 'doc', 'docx'].includes(ext)) {
      return <FileText className="w-8 h-8 text-cyan-400" />;
    }
    if (['ts', 'tsx', 'js', 'json', 'py', 'java', 'kt', 'html', 'css'].includes(ext)) {
      return <FileCode className="w-8 h-8 text-amber-400" />;
    }
    return <File className="w-8 h-8 text-white/60" />;
  };

  const getGridClass = () => {
    switch (gridCols) {
      case 1:
        return 'grid-cols-1';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      case 4:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
      case 2:
      default:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3';
    }
  };

  return (
    <div
      className="flex-1 flex flex-col min-h-screen pb-32"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileUpload(e.dataTransfer.files);
      }}
    >
      {/* Top App Bar */}
      <header className="sticky top-0 z-20 px-4 sm:px-6 py-3 bg-[#07060B]/85 backdrop-blur-xl border-b border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSlideMenuOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition"
            title="Filter Vault"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <span>SepFol Vault</span>
              {filterMode === 'STARRED' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">
                  Starred
                </span>
              )}
              {filterMode === 'BADGE' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold">
                  {badges.find((b) => b.id === selectedBadgeId)?.name || 'Filtered'}
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isSelectionMode ? (
            <>
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {selectedItemIds.size === visibleItems.length ? (
                  <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                <span>{selectedItemIds.size} Selected</span>
              </button>

              <button
                onClick={handleDeleteSelected}
                disabled={selectedItemIds.size === 0}
                className="p-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 disabled:opacity-30 transition"
                title="Delete Selected"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedItemIds(new Set());
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsSearchActive(!isSearchActive)}
                className={`p-2 rounded-xl transition ${
                  isSearchActive ? 'bg-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-white/80'
                }`}
                title="Search Vault"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsSelectionMode(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition"
                title="Select Items"
              >
                <CheckSquare className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition"
                title="Settings & Backup"
              >
                <Settings className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Real-time Search Input Bar */}
      <AnimatePresence>
        {isSearchActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-4 sm:px-6 py-2.5 bg-[#13111C]/90 border-b border-white/10"
          >
            <div className="relative max-w-xl mx-auto">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files, documents, and folders..."
                autoFocus
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb Navigation Trail */}
      <div className="px-4 sm:px-6 py-3 flex items-center gap-1.5 overflow-x-auto text-xs text-white/60">
        {folderHistory.map((crumb, idx) => {
          const isLast = idx === folderHistory.length - 1;
          return (
            <React.Fragment key={crumb.id || 'root'}>
              <button
                onClick={() => handleNavigateBreadcrumb(idx)}
                className={`hover:text-white transition whitespace-nowrap ${
                  isLast ? `font-bold ${currentConfig.textAccent}` : 'text-white/60'
                }`}
              >
                {crumb.name}
              </button>
              {!isLast && <ChevronRight className="w-3 h-3 text-white/30 shrink-0" />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Grid Workspace */}
      <main className="flex-1 px-4 sm:px-6 pt-2">
        {isDragOver && (
          <div className="mb-6 p-8 border-2 border-dashed border-purple-500/80 rounded-2xl bg-purple-900/20 flex flex-col items-center justify-center text-center animate-pulse">
            <UploadCloud className="w-10 h-10 text-purple-400 mb-2" />
            <p className="text-sm font-bold text-white">Drop files to import into Vault</p>
          </div>
        )}

        {visibleItems.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <FolderIcon className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-base font-semibold text-white/80">No items found</h3>
            <p className="text-xs text-white/40 max-w-xs mt-1">
              Use the + button below to create a folder or import documents and study notes.
            </p>
          </div>
        ) : (
          <div className={`grid ${getGridClass()} gap-3 sm:gap-4`}>
            {visibleItems.map((item) => {
              const isSelected = selectedItemIds.has(item.id);
              const isStarred = starredIds.has(item.id);
              const itemBadgeIds = storage.getItemBadges(item.id);
              const assignedBadges = badges.filter((b) => itemBadgeIds.includes(b.id));

              return (
                <GlassBox
                  key={item.id}
                  onClick={() => {
                    triggerHaptic('selection');
                    if (isSelectionMode) {
                      toggleSelectItem(item.id);
                    } else if (item.isDirectory) {
                      handleOpenFolder(item);
                    } else {
                      onOpenFile(item);
                    }
                  }}
                  className={`p-4 flex flex-col justify-between min-h-[140px] border transition relative ${
                    isSelected
                      ? 'border-purple-500 bg-purple-950/40 ring-1 ring-purple-500'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Top Item Row: Icon, Star, Menu */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="p-2 rounded-xl bg-white/[0.05] border border-white/5">
                      {getItemIcon(item)}
                    </div>

                    <div className="flex items-center gap-1">
                      {isSelectionMode ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectItem(item.id);
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
                        <>
                          <button
                            type="button"
                            onClick={(e) => handleToggleStar(e, item.id)}
                            className={`p-1.5 rounded-lg transition ${
                              isStarred
                                ? 'text-amber-400 hover:text-amber-300'
                                : 'text-white/20 hover:text-white/60'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400' : ''}`} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setManagedItem(item);
                            }}
                            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Name and Metadata */}
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-white/90 truncate tracking-tight">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-white/40 mt-0.5">
                      {item.isDirectory
                        ? `${item.itemCount || 0} items`
                        : `${Math.round(item.sizeBytes / 1024)} KB • ${item.extension.toUpperCase() || 'FILE'}`}
                    </p>

                    {/* Assigned Badges Chips */}
                    {assignedBadges.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {assignedBadges.slice(0, 3).map((b) => (
                          <span
                            key={b.id}
                            style={{ backgroundColor: `${b.colorHex}25`, borderColor: `${b.colorHex}50`, color: b.colorHex }}
                            className="text-[10px] px-2 py-0.5 rounded-full border font-semibold truncate max-w-[90px]"
                          >
                            {b.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </GlassBox>
              );
            })}
          </div>
        )}
      </main>

      {/* Hidden File Input for Document Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e.target.files)}
        multiple
        className="hidden"
      />

      {/* Slide Menu Panel for Filtering */}
      <SlideMenuPanel
        isOpen={isSlideMenuOpen}
        onClose={() => setIsSlideMenuOpen(false)}
        currentFilter={filterMode}
        selectedBadgeId={selectedBadgeId}
        badges={badges}
        onSelectFilter={(mode, badgeId) => {
          setFilterMode(mode);
          setSelectedBadgeId(badgeId);
        }}
        onCreateBadgeClick={() => {
          setIsSlideMenuOpen(false);
          setIsCreateBadgeOpen(true);
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
          a.download = `sepfol_vault_backup_${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
        }}
        onImportBackup={(jsonStr) => {
          if (storage.importWorkspaceJson(jsonStr)) {
            refreshData();
          }
        }}
        onDismiss={() => setIsSettingsOpen(false)}
      />

      {/* Create Folder Dialog */}
      <SimpleInputDialog
        isOpen={isCreateFolderOpen}
        title="Create New Folder"
        placeholder="e.g. Organic Chemistry, Algorithms..."
        confirmButtonText="Create"
        onDismiss={() => setIsCreateFolderOpen(false)}
        onConfirm={(name) => {
          storage.createFolder(currentFolderId, name);
          setIsCreateFolderOpen(false);
          refreshData();
        }}
      />

      {/* Rename Item Dialog */}
      <SimpleInputDialog
        isOpen={!!itemRenameTarget}
        title="Rename Item"
        initialText={itemRenameTarget?.name || ''}
        placeholder="Enter new name..."
        confirmButtonText="Save"
        onDismiss={() => setItemRenameTarget(null)}
        onConfirm={(name) => {
          if (itemRenameTarget) {
            storage.renameItem(itemRenameTarget.id, name);
            setItemRenameTarget(null);
            refreshData();
          }
        }}
      />

      {/* Create Badge Dialog */}
      <CreateBadgeDialog
        isOpen={isCreateBadgeOpen}
        onDismiss={() => setIsCreateBadgeOpen(false)}
        onConfirm={(name, colorHex) => {
          storage.createBadge(name, colorHex);
          setIsCreateBadgeOpen(false);
          refreshData();
        }}
      />

      {/* Item Management Modal (Rename, Delete, Badges) */}
      <ItemManageModal
        isOpen={!!managedItem}
        item={managedItem}
        allBadges={badges}
        currentBadges={managedItem ? storage.getItemBadges(managedItem.id) : []}
        onToggleBadge={(badgeId) => {
          if (!managedItem) return;
          const current = storage.getItemBadges(managedItem.id);
          const next = current.includes(badgeId)
            ? current.filter((id) => id !== badgeId)
            : [...current, badgeId];
          storage.setItemBadges(managedItem.id, next);
          refreshData();
        }}
        onRename={(item) => {
          setManagedItem(null);
          setItemRenameTarget(item);
        }}
        onDelete={(item) => {
          if (confirm(`Delete "${item.name}"?`)) {
            storage.deleteItem(item.id);
            setManagedItem(null);
            refreshData();
          }
        }}
        onDismiss={() => setManagedItem(null)}
      />
    </div>
  );
};
