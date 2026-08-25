import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Layers } from 'lucide-react';

interface SplashScreenProps {
  onSplashFinished: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onSplashFinished }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onSplashFinished();
    }, 1400);
    return () => clearTimeout(timer);
  }, [onSplashFinished]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0F243D] via-[#070F1E] to-[#02060D] text-white">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          damping: 15,
          stiffness: 220,
          duration: 0.8
        }}
        className="relative flex flex-col items-center"
      >
        {/* Glow behind card */}
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-purple-600/40 to-pink-600/40 blur-xl animate-pulse-slow" />

        <div className="relative w-32 h-32 rounded-3xl border border-white/20 bg-gradient-to-b from-[#1E1B2E]/90 to-[#0D0B18]/95 p-6 flex flex-col items-center justify-center shadow-2xl backdrop-blur-xl">
          <div className="relative flex items-center justify-center">
            {/* Holographic glowing emblem */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl blur opacity-75 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6] via-[#EC4899] to-[#06B6D4] flex items-center justify-center shadow-lg">
              <Layers className="w-9 h-9 text-white drop-shadow-md" />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            SepFol
          </h1>
          <p className="text-xs text-purple-300/60 font-medium tracking-widest uppercase mt-1">
            Data Vault & Revision
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
