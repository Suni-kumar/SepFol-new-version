export type WorkspaceType = 'DATA' | 'FLASHCARDS';

export type VisualThemeMode = 'OBSIDIAN' | 'LIQUID_GLASS';

export type LiquidGlassColor = 'AURORA_OPAL' | 'NEBULA_MIDNIGHT' | 'AQUA_CRYSTAL' | 'ROSE_QUARTZ' | 'EMERALD_MINT';

export type SepFolThemeType = 
  | 'CYBER_AMOLED' 
  | 'MIDNIGHT_CYAN' 
  | 'EMERALD_AURORA' 
  | 'SUNSET_EMBER' 
  | 'NEBULA_VIOLET' 
  | 'FROSTED_VELVET';

export type VaultFilterMode = 'ALL' | 'STARRED' | 'BADGE';

export interface VaultItem {
  id: string;
  name: string;
  isDirectory: boolean;
  parentId: string | null; // null for vault root
  sizeBytes: number;
  itemCount?: number;
  lastModified: number;
  extension: string;
  contentData?: string; // base64 / text data for files
  mimeType?: string;
}

export interface CustomBadge {
  id: string;
  name: string;
  colorHex: string;
}

export interface FlashCard {
  id: string;
  question: string;
  answer: string;
  isMastered: boolean;
}

export interface FlashDeck {
  id: string;
  name: string;
  cards: FlashCard[];
  paletteIndex: number;
}

export interface SpeedDialOption {
  label: string;
  icon: string;
  color: string;
  onClick: () => void;
}
