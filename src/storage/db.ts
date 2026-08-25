import { VaultItem, FlashDeck, CustomBadge, VisualThemeMode, LiquidGlassColor, SepFolThemeType } from '../types';

const STORAGE_KEYS = {
  VAULT_ITEMS: 'sepfol_vault_items',
  FLASH_DECKS: 'sepfol_flash_decks',
  CUSTOM_BADGES: 'sepfol_custom_badges',
  STARRED_PATHS: 'sepfol_starred_paths',
  ITEM_BADGES: 'sepfol_item_badges',
  PDF_BOOKMARKS: 'sepfol_pdf_bookmarks',
  APP_THEME: 'sepfol_app_theme',
  VISUAL_THEME_MODE: 'sepfol_visual_theme_mode',
  LIQUID_GLASS_COLOR: 'sepfol_liquid_glass_color',
  GRID_COLS: 'sepfol_grid_cols',
  DECK_GRID_COLS: 'sepfol_deck_grid_cols',
};

// Initial Seed Data
const INITIAL_BADGES: CustomBadge[] = [
  { id: 'b_exam', name: 'Exam Prep', colorHex: '#EC4899' },
  { id: 'b_urgent', name: 'High Priority', colorHex: '#EF4444' },
  { id: 'b_formula', name: 'Formulas', colorHex: '#06B6D4' },
  { id: 'b_reviewed', name: 'Reviewed', colorHex: '#10B981' },
];

const INITIAL_DECKS: FlashDeck[] = [
  {
    id: 'deck_1',
    name: 'Quantum Physics & Mechanics',
    paletteIndex: 0,
    cards: [
      {
        id: 'c1',
        question: "What is Heisenberg's Uncertainty Principle?",
        answer: "It states that the position and the momentum of a particle cannot be measured simultaneously with arbitrary high precision: Δx · Δp ≥ ℏ / 2.",
        isMastered: true
      },
      {
        id: 'c2',
        question: "What is Wave-Particle Duality?",
        answer: "The fundamental concept that all matter and light exhibit behaviors of both waves and particles depending on the measurement setup (de Broglie hypothesis: λ = h/p).",
        isMastered: false
      },
      {
        id: 'c3',
        question: "Explain the Schrödinger Wave Equation in simple terms.",
        answer: "A linear partial differential equation that describes the wave function or state function of a quantum-mechanical system (iℏ ∂Ψ/∂t = ĤΨ).",
        isMastered: false
      },
      {
        id: 'c4',
        question: "What is Quantum Tunneling?",
        answer: "A quantum phenomenon where a wavefunction can propagate through a potential barrier whose height is greater than the kinetic energy of the particle.",
        isMastered: true
      }
    ]
  },
  {
    id: 'deck_2',
    name: 'Computer Science & Data Structures',
    paletteIndex: 1,
    cards: [
      {
        id: 'c5',
        question: "What is the Time Complexity of QuickSort on average vs worst case?",
        answer: "Average case: O(n log n). Worst case: O(n²) when the chosen pivot is always the smallest or largest element.",
        isMastered: true
      },
      {
        id: 'c6',
        question: "What is the difference between BFS and DFS?",
        answer: "BFS explores neighbor nodes level by level using a Queue (FIFO), while DFS explores as deep as possible along each branch before backtracking using a Stack / Recursion (LIFO).",
        isMastered: false
      },
      {
        id: 'c7',
        question: "Explain CAP Theorem in Distributed Systems.",
        answer: "It states that a distributed data store can at most provide 2 of 3 guarantees: Consistency (every read gets the latest write), Availability (every request receives a response), and Partition tolerance.",
        isMastered: false
      }
    ]
  },
  {
    id: 'deck_3',
    name: 'Cell Biology & Genetics',
    paletteIndex: 2,
    cards: [
      {
        id: 'c8',
        question: "What is the primary function of Mitochondria?",
        answer: "Powerhouse of the cell: generates most of the chemical energy needed to power biochemical reactions via cellular respiration (ATP synthesis).",
        isMastered: true
      },
      {
        id: 'c9',
        question: "Explain Transcription vs Translation.",
        answer: "Transcription: DNA is copied into mRNA inside the nucleus. Translation: mRNA is decoded by ribosomes in the cytoplasm to synthesize polypeptide amino acid chains (proteins).",
        isMastered: false
      }
    ]
  }
];

const SAMPLE_STUDY_NOTE_CONTENT = `# Advanced Mathematics & Physics Formula Sheet

## 1. Calculus & Derivatives
* Product Rule: (uv)' = u'v + uv'
* Quotient Rule: (u/v)' = (u'v - uv') / v²
* Chain Rule: d/dx[f(g(x))] = f'(g(x)) · g'(x)
* Integration by Parts: ∫ u dv = uv - ∫ v du

## 2. Electromagnetism (Maxwell's Equations)
1. Gauss's Law: ∇ · E = ρ / ε₀
2. Gauss's Law for Magnetism: ∇ · B = 0
3. Faraday's Law: ∇ × E = -∂B/∂t
4. Ampère's Law with Maxwell's addition: ∇ × B = μ₀(J + ε₀ ∂E/∂t)

## 3. Thermodynamics
* First Law: ΔU = Q - W
* Entropy: dS = dQ_rev / T
* Ideal Gas Law: PV = nRT

---
*SepFol Data Vault • Auto-saved local study reference*`;

const INITIAL_VAULT_ITEMS: VaultItem[] = [
  {
    id: 'folder_science',
    name: 'Science & Engineering',
    isDirectory: true,
    parentId: null,
    sizeBytes: 0,
    itemCount: 2,
    lastModified: Date.now() - 3600000 * 24,
    extension: ''
  },
  {
    id: 'folder_cheatsheets',
    name: 'Quick Formula Cheatsheets',
    isDirectory: true,
    parentId: null,
    sizeBytes: 0,
    itemCount: 1,
    lastModified: Date.now() - 3600000 * 12,
    extension: ''
  },
  {
    id: 'file_math_note',
    name: 'Math_Formulas_2026.md',
    isDirectory: false,
    parentId: null,
    sizeBytes: 2048,
    lastModified: Date.now() - 3600000 * 4,
    extension: 'md',
    mimeType: 'text/markdown',
    contentData: SAMPLE_STUDY_NOTE_CONTENT
  },
  {
    id: 'file_sample_svg',
    name: 'Quantum_Orbital_Diagram.svg',
    isDirectory: false,
    parentId: 'folder_science',
    sizeBytes: 3450,
    lastModified: Date.now() - 3600000 * 8,
    extension: 'svg',
    mimeType: 'image/svg+xml',
    contentData: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0a0a14"/>
  <circle cx="200" cy="200" r="140" fill="none" stroke="#8B5CF6" stroke-width="2" stroke-dasharray="6,6" opacity="0.6"/>
  <ellipse cx="200" cy="200" rx="160" ry="60" fill="none" stroke="#EC4899" stroke-width="2" transform="rotate(30 200 200)" opacity="0.8"/>
  <ellipse cx="200" cy="200" rx="160" ry="60" fill="none" stroke="#06B6D4" stroke-width="2" transform="rotate(-30 200 200)" opacity="0.8"/>
  <ellipse cx="200" cy="200" rx="160" ry="60" fill="none" stroke="#10B981" stroke-width="2" transform="rotate(90 200 200)" opacity="0.7"/>
  <circle cx="200" cy="200" r="16" fill="#F59E0B"/>
  <circle cx="200" cy="200" r="24" fill="#F59E0B" opacity="0.3"/>
  <circle cx="90" cy="140" r="8" fill="#EC4899"/>
  <circle cx="310" cy="260" r="8" fill="#06B6D4"/>
  <circle cx="200" cy="60" r="8" fill="#10B981"/>
  <text x="200" y="360" fill="#ffffff" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="bold">Atomic Orbital Shell Model</text>
</svg>`
  },
  {
    id: 'file_physics_doc',
    name: 'Physics_Notes_Quantum.txt',
    isDirectory: false,
    parentId: 'folder_science',
    sizeBytes: 1540,
    lastModified: Date.now() - 3600000 * 18,
    extension: 'txt',
    mimeType: 'text/plain',
    contentData: `Physics Notes: Quantum Mechanics & Electrodynamics
1. Planck's constant: h = 6.62607015 × 10⁻³⁴ J·s
2. Speed of light: c = 2.99792458 × 10⁸ m/s
3. Energy of photon: E = h·ν = h·c / λ
4. Photoelectric effect: K_max = h·ν - Φ (Work function)
5. Compton Scattering formula: Δλ = (h / m_e c) * (1 - cos θ)`
  },
  {
    id: 'file_cheatsheet_doc',
    name: 'Standard_Calculus_Integrals.txt',
    isDirectory: false,
    parentId: 'folder_cheatsheets',
    sizeBytes: 1280,
    lastModified: Date.now() - 3600000 * 2,
    extension: 'txt',
    mimeType: 'text/plain',
    contentData: `Standard Integrals Reference:
∫ x^n dx = (x^(n+1))/(n+1) + C (for n ≠ -1)
∫ (1/x) dx = ln|x| + C
∫ e^x dx = e^x + C
∫ a^x dx = (a^x)/ln(a) + C
∫ sin(x) dx = -cos(x) + C
∫ cos(x) dx = sin(x) + C
∫ sec²(x) dx = tan(x) + C
∫ 1/(1+x²) dx = arctan(x) + C
∫ 1/√(1-x²) dx = arcsin(x) + C`
  }
];

class StorageManager {
  private getStorage<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data) as T;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
    }
    return defaultValue;
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  }

  // Vault Items
  getVaultItems(): VaultItem[] {
    return this.getStorage<VaultItem[]>(STORAGE_KEYS.VAULT_ITEMS, INITIAL_VAULT_ITEMS);
  }

  saveVaultItems(items: VaultItem[]): void {
    this.setStorage(STORAGE_KEYS.VAULT_ITEMS, items);
  }

  getItemsInDirectory(parentId: string | null): VaultItem[] {
    const all = this.getVaultItems();
    return all.filter(item => item.parentId === parentId)
      .sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
  }

  createFolder(parentId: string | null, name: string): VaultItem {
    const all = this.getVaultItems();
    const newFolder: VaultItem = {
      id: 'f_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: name.trim(),
      isDirectory: true,
      parentId,
      sizeBytes: 0,
      itemCount: 0,
      lastModified: Date.now(),
      extension: ''
    };
    all.push(newFolder);
    this.saveVaultItems(all);
    this.updateFolderCounts(all);
    return newFolder;
  }

  importFile(parentId: string | null, file: File, contentData?: string): Promise<VaultItem> {
    return new Promise((resolve) => {
      const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() || '' : '';
      
      const createItemWithData = (data: string) => {
        const all = this.getVaultItems();
        const newItem: VaultItem = {
          id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: file.name,
          isDirectory: false,
          parentId,
          sizeBytes: file.size,
          lastModified: Date.now(),
          extension,
          mimeType: file.type || 'application/octet-stream',
          contentData: data
        };
        all.push(newItem);
        this.saveVaultItems(all);
        this.updateFolderCounts(all);
        resolve(newItem);
      };

      if (contentData) {
        createItemWithData(contentData);
        return;
      }

      const reader = new FileReader();
      if (file.type.startsWith('text/') || extension === 'md' || extension === 'txt' || extension === 'json' || extension === 'csv') {
        reader.onload = (e) => {
          createItemWithData(e.target?.result as string || '');
        };
        reader.readAsText(file);
      } else {
        reader.onload = (e) => {
          createItemWithData(e.target?.result as string || '');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  deleteItem(id: string): void {
    let all = this.getVaultItems();
    const idsToDelete = new Set<string>([id]);
    
    // Find all children recursively if directory
    let foundNew = true;
    while (foundNew) {
      foundNew = false;
      for (const item of all) {
        if (item.parentId && idsToDelete.has(item.parentId) && !idsToDelete.has(item.id)) {
          idsToDelete.add(item.id);
          foundNew = true;
        }
      }
    }

    all = all.filter(item => !idsToDelete.has(item.id));
    this.saveVaultItems(all);
    this.updateFolderCounts(all);

    // Clean up associated metadata
    const starred = this.getStarredPaths();
    idsToDelete.forEach(itemId => {
      starred.delete(itemId);
      localStorage.removeItem(`badges_mapped_${itemId}`);
      localStorage.removeItem(`pdf_page_${itemId}`);
    });
    this.setStorage(STORAGE_KEYS.STARRED_PATHS, Array.from(starred));
  }

  renameItem(id: string, newName: string): boolean {
    const all = this.getVaultItems();
    const item = all.find(i => i.id === id);
    if (!item) return false;
    item.name = newName.trim();
    item.lastModified = Date.now();
    this.saveVaultItems(all);
    return true;
  }

  private updateFolderCounts(items: VaultItem[]) {
    const countMap = new Map<string, number>();
    for (const item of items) {
      if (item.parentId) {
        countMap.set(item.parentId, (countMap.get(item.parentId) || 0) + 1);
      }
    }
    for (const item of items) {
      if (item.isDirectory) {
        item.itemCount = countMap.get(item.id) || 0;
      }
    }
    this.saveVaultItems(items);
  }

  // Decks CRUD
  getDecks(): FlashDeck[] {
    return this.getStorage<FlashDeck[]>(STORAGE_KEYS.FLASH_DECKS, INITIAL_DECKS);
  }

  saveDecks(decks: FlashDeck[]): void {
    this.setStorage(STORAGE_KEYS.FLASH_DECKS, decks);
  }

  createDeck(name: string, paletteIndex?: number): FlashDeck {
    const decks = this.getDecks();
    const newDeck: FlashDeck = {
      id: 'deck_' + Date.now(),
      name: name.trim(),
      paletteIndex: paletteIndex !== undefined ? paletteIndex : Math.floor(Math.random() * 6),
      cards: []
    };
    decks.unshift(newDeck);
    this.saveDecks(decks);
    return newDeck;
  }

  // Custom Badges
  getBadges(): CustomBadge[] {
    return this.getStorage<CustomBadge[]>(STORAGE_KEYS.CUSTOM_BADGES, INITIAL_BADGES);
  }

  saveBadges(badges: CustomBadge[]): void {
    this.setStorage(STORAGE_KEYS.CUSTOM_BADGES, badges);
  }

  createBadge(name: string, colorHex: string): CustomBadge {
    const badges = this.getBadges();
    const newBadge: CustomBadge = {
      id: 'b_' + Date.now(),
      name: name.trim(),
      colorHex
    };
    badges.push(newBadge);
    this.saveBadges(badges);
    return newBadge;
  }

  // Item Badges Mapping
  getItemBadges(itemId: string): string[] {
    return this.getStorage<string[]>(`badges_mapped_${itemId}`, []);
  }

  setItemBadges(itemId: string, badgeIds: string[]): void {
    this.setStorage(`badges_mapped_${itemId}`, badgeIds);
  }

  // Starred Items
  getStarredPaths(): Set<string> {
    const list = this.getStorage<string[]>(STORAGE_KEYS.STARRED_PATHS, ['file_math_note', 'folder_science']);
    return new Set(list);
  }

  toggleStar(itemId: string): boolean {
    const starred = this.getStarredPaths();
    if (starred.has(itemId)) {
      starred.delete(itemId);
    } else {
      starred.add(itemId);
    }
    this.setStorage(STORAGE_KEYS.STARRED_PATHS, Array.from(starred));
    return starred.has(itemId);
  }

  // PDF Bookmarks
  getPdfPage(itemId: string): number {
    return this.getStorage<number>(`pdf_page_${itemId}`, 0);
  }

  savePdfPage(itemId: string, page: number): void {
    this.setStorage(`pdf_page_${itemId}`, page);
  }

  // Visual Theme Modes
  getVisualThemeMode(): VisualThemeMode {
    return this.getStorage<VisualThemeMode>(STORAGE_KEYS.VISUAL_THEME_MODE, 'OBSIDIAN');
  }

  saveVisualThemeMode(mode: VisualThemeMode): void {
    this.setStorage(STORAGE_KEYS.VISUAL_THEME_MODE, mode);
  }

  getLiquidGlassColor(): LiquidGlassColor {
    return this.getStorage<LiquidGlassColor>(STORAGE_KEYS.LIQUID_GLASS_COLOR, 'AURORA_OPAL');
  }

  saveLiquidGlassColor(color: LiquidGlassColor): void {
    this.setStorage(STORAGE_KEYS.LIQUID_GLASS_COLOR, color);
  }

  getAppTheme(): SepFolThemeType {
    return this.getStorage<SepFolThemeType>(STORAGE_KEYS.APP_THEME, 'CYBER_AMOLED');
  }

  saveAppTheme(theme: SepFolThemeType): void {
    this.setStorage(STORAGE_KEYS.APP_THEME, theme);
  }

  // Backup & Restore
  exportWorkspaceJson(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      vaultItems: this.getVaultItems(),
      decks: this.getDecks(),
      badges: this.getBadges(),
      starred: Array.from(this.getStarredPaths())
    };
    return JSON.stringify(data, null, 2);
  }

  importWorkspaceJson(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.vaultItems) this.saveVaultItems(data.vaultItems);
      if (data.decks) this.saveDecks(data.decks);
      if (data.badges) this.saveBadges(data.badges);
      if (data.starred) this.setStorage(STORAGE_KEYS.STARRED_PATHS, data.starred);
      return true;
    } catch (e) {
      console.error('Failed to import JSON backup:', e);
      return false;
    }
  }
}

export const storage = new StorageManager();
