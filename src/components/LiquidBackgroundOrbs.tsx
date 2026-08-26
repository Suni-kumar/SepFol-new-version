import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';

export const LiquidBackgroundOrbs: React.FC = () => {
  const { visualMode, liquidColor } = useTheme();

  if (visualMode !== 'LIQUID_GLASS') return null;

  const getOrbGradients = () => {
    switch (liquidColor) {
      case 'AURORA_OPAL':
        return {
          orb1: 'bg-[radial-gradient(circle,rgba(216,180,254,0.35)_0%,rgba(244,114,182,0.2)_40%,transparent_70%)]',
          orb2: 'bg-[radial-gradient(circle,rgba(103,232,249,0.3)_0%,rgba(165,180,252,0.2)_40%,transparent_70%)]',
          orb3: 'bg-[radial-gradient(circle,rgba(253,224,71,0.2)_0%,rgba(244,114,182,0.2)_40%,transparent_70%)]',
        };
      case 'NEBULA_MIDNIGHT':
        return {
          orb1: 'bg-[radial-gradient(circle,rgba(168,85,247,0.45)_0%,rgba(126,34,206,0.25)_40%,transparent_70%)]',
          orb2: 'bg-[radial-gradient(circle,rgba(236,72,153,0.35)_0%,rgba(99,102,241,0.2)_40%,transparent_70%)]',
          orb3: 'bg-[radial-gradient(circle,rgba(6,182,212,0.3)_0%,rgba(147,51,234,0.15)_40%,transparent_70%)]',
        };
      case 'AQUA_CRYSTAL':
        return {
          orb1: 'bg-[radial-gradient(circle,rgba(6,182,212,0.45)_0%,rgba(14,165,233,0.25)_40%,transparent_70%)]',
          orb2: 'bg-[radial-gradient(circle,rgba(45,212,191,0.35)_0%,rgba(59,130,246,0.2)_40%,transparent_70%)]',
          orb3: 'bg-[radial-gradient(circle,rgba(56,189,248,0.3)_0%,rgba(20,184,166,0.15)_40%,transparent_70%)]',
        };
      case 'ROSE_QUARTZ':
        return {
          orb1: 'bg-[radial-gradient(circle,rgba(244,114,182,0.45)_0%,rgba(225,29,72,0.25)_40%,transparent_70%)]',
          orb2: 'bg-[radial-gradient(circle,rgba(251,146,60,0.35)_0%,rgba(236,72,153,0.2)_40%,transparent_70%)]',
          orb3: 'bg-[radial-gradient(circle,rgba(253,186,116,0.3)_0%,rgba(244,63,94,0.15)_40%,transparent_70%)]',
        };
      case 'EMERALD_MINT':
        return {
          orb1: 'bg-[radial-gradient(circle,rgba(52,211,153,0.45)_0%,rgba(16,185,129,0.25)_40%,transparent_70%)]',
          orb2: 'bg-[radial-gradient(circle,rgba(45,212,191,0.35)_0%,rgba(5,150,105,0.2)_40%,transparent_70%)]',
          orb3: 'bg-[radial-gradient(circle,rgba(110,231,183,0.3)_0%,rgba(6,182,212,0.15)_40%,transparent_70%)]',
        };
      default:
        return {
          orb1: 'bg-[radial-gradient(circle,rgba(168,85,247,0.35)_0%,rgba(236,72,153,0.2)_40%,transparent_70%)]',
          orb2: 'bg-[radial-gradient(circle,rgba(6,182,212,0.3)_0%,rgba(59,130,246,0.2)_40%,transparent_70%)]',
          orb3: 'bg-[radial-gradient(circle,rgba(244,114,182,0.25)_0%,rgba(251,146,60,0.15)_40%,transparent_70%)]',
        };
    }
  };

  const gradients = getOrbGradients();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" style={{ transform: 'translateZ(0)' }}>
      {/* Orb 1 */}
      <motion.div
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -50, 40, 0],
          scale: [1, 1.25, 0.9, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-80 ${gradients.orb1}`}
        style={{ willChange: 'transform' }}
      />

      {/* Orb 2 */}
      <motion.div
        animate={{
          x: [0, -70, 50, 0],
          y: [0, 60, -40, 0],
          scale: [1, 0.9, 1.2, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute top-1/3 -right-28 w-[28rem] h-[28rem] rounded-full opacity-75 ${gradients.orb2}`}
        style={{ willChange: 'transform' }}
      />

      {/* Orb 3 */}
      <motion.div
        animate={{
          x: [0, 40, -50, 0],
          y: [0, -40, 60, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -bottom-32 left-1/4 w-[32rem] h-[32rem] rounded-full opacity-70 ${gradients.orb3}`}
        style={{ willChange: 'transform' }}
      />
    </div>
  );
};
