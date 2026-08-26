import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { SepfolLogo } from './SepfolLogo';

interface SplashScreenProps {
  onSplashFinished: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onSplashFinished }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onSplashFinished();
    }, 1800); // slightly longer to appreciate the logo
    return () => clearTimeout(timer);
  }, [onSplashFinished]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0F243D] via-[#070F1E] to-[#02060D] text-white">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 100,
          duration: 0.8
        }}
        className="relative flex flex-col items-center"
      >
        {/* Glow behind card */}
        <div className="absolute top-4 w-32 h-32 rounded-full bg-cyan-500/30 blur-2xl animate-pulse" />

        <div className="relative w-40 h-40 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-cyan-500/20 shadow-cyan-500/20">
            <SepfolLogo width={160} height={160} className="w-full h-full" theme="midnight" glowIntensity={0.9} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <h1 className="text-3xl font-bold tracking-wider bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
            sepfol
          </h1>
          <p className="text-xs text-cyan-400/70 font-medium tracking-widest uppercase mt-2">
            Data Vault & Revision
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
