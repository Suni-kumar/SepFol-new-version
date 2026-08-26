import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { WorkspaceType, VaultItem, FlashDeck, SpeedDialOption } from './types';
import { SplashScreen } from './components/SplashScreen';
import { FolderScreen, FolderActionsHandle } from './folder/FolderScreen';
import { FlashcardsScreen, FlashcardsActionsHandle } from './flashcards/FlashcardsScreen';
import { FlashcardRevisionScreen } from './flashcards/FlashcardRevisionScreen';
import { InternalImageViewer } from './viewer/InternalImageViewer';
import { InternalPdfViewer } from './viewer/InternalPdfViewer';
import { FloatingTimerWidget } from './components/FloatingTimerWidget';
import { WorkspaceDock } from './components/WorkspaceDock';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LiquidBackgroundOrbs } from './components/LiquidBackgroundOrbs';
import { initAudioOnUserInteraction } from './utils/audioAlarm';
import { App as CapacitorApp } from '@capacitor/app';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceType>('DATA');
  const { currentConfig, visualMode } = useTheme();

  useEffect(() => {
    initAudioOnUserInteraction();
  }, []);
  
  // Active Viewers & Sub-screens
  const [activeFile, setActiveFile] = useState<VaultItem | null>(null);
  const [activeDeck, setActiveDeck] = useState<FlashDeck | null>(null);
  
  // Floating Focus Timer Widget State
  const [isTimerVisible, setIsTimerVisible] = useState(false);

  // Screen Action Refs (prevents state synchronization loops)
  const folderActionsRef = useRef<FolderActionsHandle | null>(null);
  const flashcardsActionsRef = useRef<FlashcardsActionsHandle | null>(null);

  // Hardware Back Button Handler (Android)
  useEffect(() => {
    const handleBackButton = () => {
      if (activeFile) {
        setActiveFile(null);
        return;
      }
      if (activeDeck) {
        setActiveDeck(null);
        return;
      }
      if (currentWorkspace === 'DATA') {
        const handled = folderActionsRef.current?.goBack?.();
        if (!handled) {
          CapacitorApp.exitApp();
        }
        return;
      }
      // If at root of flashcards or any other place
      CapacitorApp.exitApp();
    };

    const listener = CapacitorApp.addListener('backButton', (event) => {
      if (event.canGoBack) {
         // Optionally window.history.back() if using routing, but we are not.
      }
      handleBackButton();
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [activeFile, activeDeck, currentWorkspace]);

  const handleOpenFile = useCallback((item: VaultItem) => {
    setActiveFile(item);
  }, []);

  const handleOpenTimerWidget = useCallback(() => {
    setIsTimerVisible(true);
  }, []);

  const handleCloseTimerWidget = useCallback(() => {
    setIsTimerVisible(false);
  }, []);

  const isImageFile = (item: VaultItem) => {
    const ext = item.extension.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(ext);
  };

  // Memoized speed dial options directly derived from active workspace
  const speedDialOptions: SpeedDialOption[] = useMemo(() => {
    if (currentWorkspace === 'DATA') {
      return [
        {
          label: 'New Folder',
          icon: 'NewFolder',
          color: currentConfig.primaryColor,
          onClick: () => folderActionsRef.current?.createFolder(),
        },
        {
          label: 'Import Document',
          icon: 'Import',
          color: '#EC4899',
          onClick: () => folderActionsRef.current?.importFile(),
        },
        {
          label: 'Focus Timer',
          icon: 'Timer',
          color: '#06B6D4',
          onClick: handleOpenTimerWidget,
        },
      ];
    } else {
      return [
        {
          label: 'New Deck',
          icon: 'NewFolder',
          color: '#EC4899',
          onClick: () => flashcardsActionsRef.current?.createDeck(),
        },
        {
          label: 'AI Generate Deck',
          icon: 'Sparkles',
          color: '#8B5CF6',
          onClick: () => flashcardsActionsRef.current?.generateAiDeck(),
        },
        {
          label: 'Focus Timer',
          icon: 'Timer',
          color: '#06B6D4',
          onClick: handleOpenTimerWidget,
        },
      ];
    }
  }, [currentWorkspace, handleOpenTimerWidget, currentConfig.primaryColor]);

  return (
    <div
      style={{ backgroundColor: currentConfig.bgBase }}
      className={`min-h-screen text-white flex flex-col font-sans transition-colors duration-300 ${
        visualMode === 'LIQUID_GLASS'
          ? 'bg-gradient-to-b from-black/80 via-[#0a0614]/90 to-black'
          : `bg-gradient-to-b ${currentConfig.bgGradient}`
      }`}
    >
      {/* Animated Splash Screen */}
      {showSplash && <SplashScreen onSplashFinished={() => setShowSplash(false)} />}

      {/* Floating Focus Study Timer */}
      <FloatingTimerWidget
        isVisible={isTimerVisible}
        onDismiss={handleCloseTimerWidget}
      />

      {/* Full-Screen Viewers */}
      {activeFile && (
        isImageFile(activeFile) ? (
          <InternalImageViewer
            item={activeFile}
            onBack={() => setActiveFile(null)}
          />
        ) : (
          <InternalPdfViewer
            item={activeFile}
            onBack={() => setActiveFile(null)}
          />
        )
      )}

      {/* Flashcard Active Revision Sub-screen */}
      {activeDeck ? (
        <FlashcardRevisionScreen
          deck={activeDeck}
          onBack={() => setActiveDeck(null)}
          onDeckUpdated={() => {}}
        />
      ) : (
        <>
          {/* Main Workspaces: Vault vs Flashcards */}
          {currentWorkspace === 'DATA' ? (
            <FolderScreen
              onOpenFile={handleOpenFile}
              actionsRef={folderActionsRef}
            />
          ) : (
            <FlashcardsScreen
              onOpenDeck={(deck) => setActiveDeck(deck)}
              actionsRef={flashcardsActionsRef}
            />
          )}

          {/* Bottom Floating Navigation Dock & Smart Speed Dial FAB */}
          {!activeFile && !activeDeck && (
            <WorkspaceDock
              currentWorkspace={currentWorkspace}
              speedDialOptions={speedDialOptions}
              onWorkspaceChange={(ws) => setCurrentWorkspace(ws)}
            />
          )}
        </>
      )}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <LiquidBackgroundOrbs />
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
