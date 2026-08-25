import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../context/ThemeContext';

interface GlassBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  borderColors?: string;
  backgroundColors?: string;
  glow?: boolean;
}

export const GlassBox: React.FC<GlassBoxProps> = ({
  children,
  className = '',
  onClick,
  borderColors,
  backgroundColors,
  glow = false,
  ...props
}) => {
  const { visualMode, liquidColor } = useTheme();
  const isLiquid = visualMode === 'LIQUID_GLASS';

  const getLiquidStyling = () => {
    switch (liquidColor) {
      case 'AURORA_OPAL':
        return 'border-white/30 bg-gradient-to-br from-white/[0.16] via-white/[0.05] to-purple-500/[0.08] shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,0.7),inset_0_-2px_4px_0_rgba(0,0,0,0.3),0_12px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl';
      case 'NEBULA_MIDNIGHT':
        return 'border-purple-400/30 bg-gradient-to-br from-purple-900/[0.25] via-slate-900/[0.4] to-pink-900/[0.15] shadow-[inset_0_1.5px_2px_0_rgba(236,72,153,0.5),inset_0_-2px_4px_0_rgba(0,0,0,0.4),0_12px_32px_rgba(139,92,246,0.2)] backdrop-blur-2xl';
      case 'AQUA_CRYSTAL':
        return 'border-cyan-400/30 bg-gradient-to-br from-cyan-900/[0.25] via-slate-900/[0.4] to-teal-900/[0.15] shadow-[inset_0_1.5px_2px_0_rgba(6,182,212,0.5),inset_0_-2px_4px_0_rgba(0,0,0,0.4),0_12px_32px_rgba(6,182,212,0.2)] backdrop-blur-2xl';
      case 'ROSE_QUARTZ':
        return 'border-pink-400/30 bg-gradient-to-br from-pink-900/[0.25] via-rose-950/[0.4] to-amber-900/[0.15] shadow-[inset_0_1.5px_2px_0_rgba(251,146,60,0.5),inset_0_-2px_4px_0_rgba(0,0,0,0.4),0_12px_32px_rgba(244,114,182,0.2)] backdrop-blur-2xl';
      case 'EMERALD_MINT':
        return 'border-emerald-400/30 bg-gradient-to-br from-emerald-900/[0.25] via-slate-900/[0.4] to-teal-900/[0.15] shadow-[inset_0_1.5px_2px_0_rgba(16,185,129,0.5),inset_0_-2px_4px_0_rgba(0,0,0,0.4),0_12px_32px_rgba(16,185,129,0.2)] backdrop-blur-2xl';
      default:
        return 'border-white/30 bg-gradient-to-br from-white/[0.16] via-white/[0.05] to-purple-500/[0.08] shadow-[inset_0_1.5px_2px_0_rgba(255,255,255,0.7),inset_0_-2px_4px_0_rgba(0,0,0,0.3)] backdrop-blur-2xl';
    }
  };

  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'relative rounded-2xl transition-all duration-200 border overflow-hidden backdrop-blur-md',
          onClick && 'cursor-pointer active:scale-[0.98]',
          isLiquid
            ? getLiquidStyling()
            : [
                borderColors ? borderColors : 'border-white/10 hover:border-white/20',
                backgroundColors ? backgroundColors : 'bg-gradient-to-b from-[#1E1B2E]/70 to-[#0D0B18]/85',
                glow && 'glass-glow',
              ],
          className
        )
      )}
      {...props}
    >
      {/* Specular high-gloss sheen reflection in liquid mode */}
      {isLiquid && (
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.18] to-transparent pointer-events-none rounded-t-2xl" />
      )}
      {children}
    </div>
  );
};

