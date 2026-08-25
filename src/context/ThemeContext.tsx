import React, { createContext, useContext, useState, useEffect } from 'react';
import { VisualThemeMode, LiquidGlassColor, SepFolThemeType } from '../types';
import { storage } from '../storage/db';

export interface ThemeConfig {
  id: SepFolThemeType;
  name: string;
  primaryColor: string;
  bgBase: string;
  bgGradient: string;
  glowColor: string;
  textAccent: string;
  borderAccent: string;
  badgeGradient: string;
  buttonClass: string;
  activeCardGlow: string;
}

export const THEME_CONFIGS: Record<SepFolThemeType, ThemeConfig> = {
  CYBER_AMOLED: {
    id: 'CYBER_AMOLED',
    name: 'Cyber AMOLED',
    primaryColor: '#8B5CF6',
    bgBase: '#07060B',
    bgGradient: 'from-[#07060B] via-[#0E0C18] to-[#140E26]',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    textAccent: 'text-purple-400',
    borderAccent: 'border-purple-500/50',
    badgeGradient: 'from-purple-600 to-indigo-600',
    buttonClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-900/40',
    activeCardGlow: 'shadow-purple-950/50 border-purple-500/60 bg-purple-950/30',
  },
  MIDNIGHT_CYAN: {
    id: 'MIDNIGHT_CYAN',
    name: 'Midnight Cyan',
    primaryColor: '#06B6D4',
    bgBase: '#040B13',
    bgGradient: 'from-[#040B13] via-[#081827] to-[#0A2238]',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    textAccent: 'text-cyan-400',
    borderAccent: 'border-cyan-500/50',
    badgeGradient: 'from-cyan-600 to-blue-600',
    buttonClass: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/40',
    activeCardGlow: 'shadow-cyan-950/50 border-cyan-500/60 bg-cyan-950/30',
  },
  EMERALD_AURORA: {
    id: 'EMERALD_AURORA',
    name: 'Emerald Aurora',
    primaryColor: '#10B981',
    bgBase: '#040D09',
    bgGradient: 'from-[#040D09] via-[#071C14] to-[#0A281D]',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    textAccent: 'text-emerald-400',
    borderAccent: 'border-emerald-500/50',
    badgeGradient: 'from-emerald-600 to-teal-600',
    buttonClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/40',
    activeCardGlow: 'shadow-emerald-950/50 border-emerald-500/60 bg-emerald-950/30',
  },
  SUNSET_EMBER: {
    id: 'SUNSET_EMBER',
    name: 'Sunset Ember',
    primaryColor: '#F97316',
    bgBase: '#0D0805',
    bgGradient: 'from-[#0D0805] via-[#1A0E07] to-[#26150A]',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    textAccent: 'text-amber-400',
    borderAccent: 'border-amber-500/50',
    badgeGradient: 'from-amber-600 to-rose-600',
    buttonClass: 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 shadow-amber-900/40',
    activeCardGlow: 'shadow-amber-950/50 border-amber-500/60 bg-amber-950/30',
  },
  NEBULA_VIOLET: {
    id: 'NEBULA_VIOLET',
    name: 'Nebula Violet',
    primaryColor: '#EC4899',
    bgBase: '#0E050B',
    bgGradient: 'from-[#0E050B] via-[#1A0A16] to-[#260C22]',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    textAccent: 'text-pink-400',
    borderAccent: 'border-pink-500/50',
    badgeGradient: 'from-pink-600 to-purple-600',
    buttonClass: 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-pink-900/40',
    activeCardGlow: 'shadow-pink-950/50 border-pink-500/60 bg-pink-950/30',
  },
  FROSTED_VELVET: {
    id: 'FROSTED_VELVET',
    name: 'Frosted Velvet',
    primaryColor: '#6366F1',
    bgBase: '#080714',
    bgGradient: 'from-[#080714] via-[#100D28] to-[#18133E]',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    textAccent: 'text-indigo-400',
    borderAccent: 'border-indigo-500/50',
    badgeGradient: 'from-indigo-600 to-purple-700',
    buttonClass: 'bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 shadow-indigo-900/40',
    activeCardGlow: 'shadow-indigo-950/50 border-indigo-500/60 bg-indigo-950/30',
  },
};

interface ThemeContextType {
  visualMode: VisualThemeMode;
  setVisualMode: (mode: VisualThemeMode) => void;
  liquidColor: LiquidGlassColor;
  setLiquidColor: (color: LiquidGlassColor) => void;
  accentTheme: SepFolThemeType;
  setAccentTheme: (theme: SepFolThemeType) => void;
  currentConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visualMode, setVisualModeState] = useState<VisualThemeMode>(() => storage.getVisualThemeMode());
  const [liquidColor, setLiquidColorState] = useState<LiquidGlassColor>(() => storage.getLiquidGlassColor());
  const [accentTheme, setAccentThemeState] = useState<SepFolThemeType>(() => storage.getAppTheme());

  const setVisualMode = (mode: VisualThemeMode) => {
    setVisualModeState(mode);
    storage.saveVisualThemeMode(mode);
  };

  const setLiquidColor = (color: LiquidGlassColor) => {
    setLiquidColorState(color);
    storage.saveLiquidGlassColor(color);
  };

  const setAccentTheme = (theme: SepFolThemeType) => {
    setAccentThemeState(theme);
    storage.saveAppTheme(theme);
  };

  const currentConfig = THEME_CONFIGS[accentTheme] || THEME_CONFIGS.CYBER_AMOLED;

  // Sync class on root body and set CSS variables
  useEffect(() => {
    const root = document.documentElement;
    if (visualMode === 'LIQUID_GLASS') {
      root.classList.add('liquid-glass-active');
    } else {
      root.classList.remove('liquid-glass-active');
    }

    root.style.setProperty('--theme-primary', currentConfig.primaryColor);
    root.style.setProperty('--theme-glow', currentConfig.glowColor);
    root.style.setProperty('--theme-bg', currentConfig.bgBase);
  }, [visualMode, accentTheme, currentConfig]);

  return (
    <ThemeContext.Provider
      value={{
        visualMode,
        setVisualMode,
        liquidColor,
        setLiquidColor,
        accentTheme,
        setAccentTheme,
        currentConfig,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
