import { storage } from '../storage/db';

export type HapticIntensity = 'light' | 'selection' | 'medium' | 'fab' | 'workspace' | 'flip' | 'success';

const HAPTIC_PATTERNS: Record<HapticIntensity, number | number[]> = {
  light: 15,
  selection: 20,
  flip: 25,
  medium: 35,
  fab: 40,
  workspace: [25, 40, 30],
  success: [20, 30, 25, 30, 40],
};

/**
 * Triggers vibration haptic feedback across modern browsers & webviews
 * Uses navigator.vibrate with fallback handling
 */
export function triggerHaptic(type: HapticIntensity = 'selection'): void {
  try {
    if (!storage.getHapticsEnabled()) return;

    if (typeof window !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      const pattern = HAPTIC_PATTERNS[type] ?? 20;
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore if not supported or restricted in environment
  }
}
