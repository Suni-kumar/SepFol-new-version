import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Timer as TimerIcon, X, RotateCcw, BellRing } from 'lucide-react';
import { GlassBox } from './GlassBox';
import { startPhoneAlarm, stopPhoneAlarm } from '../utils/audioAlarm';
import { useTheme } from '../context/ThemeContext';

interface FloatingTimerWidgetProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export const FloatingTimerWidget: React.FC<FloatingTimerWidgetProps> = ({
  isVisible,
  onDismiss,
}) => {
  const { currentConfig } = useTheme();
  const [totalSeconds, setTotalSeconds] = useState(1500); // 25 mins default
  const [secondsLeft, setSecondsLeft] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Position state for drag
  const [position, setPosition] = useState({ x: 20, y: 120 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  // Custom input states
  const [customHours, setCustomHours] = useState('');
  const [customMins, setCustomMins] = useState('');

  // Countdown timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsAlarmRinging(true);
            startPhoneAlarm(() => setIsAlarmRinging(false));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Clean up alarm sound on unmount
  useEffect(() => {
    return () => {
      stopPhoneAlarm();
    };
  }, []);

  const handleStopAlarm = () => {
    stopPhoneAlarm();
    setIsAlarmRinging(false);
    setSecondsLeft(totalSeconds);
  };

  if (!isVisible) return null;

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const secs = secondsLeft % 60;

  const formattedTime =
    hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const handlePointerDown = (e: React.PointerEvent) => {
    // Ignore clicks on buttons
    if ((e.target as HTMLElement).closest('button')) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    setPosition({
      x: Math.max(10, Math.min(window.innerWidth - 240, dragStartRef.current.initialX + deltaX)),
      y: Math.max(10, Math.min(window.innerHeight - 80, dragStartRef.current.initialY + deltaY)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const PRESETS = [15, 25, 45, 60, 120, 180];

  return (
    <>
      <div
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="fixed top-0 left-0 z-40 cursor-move select-none touch-none"
      >
        <GlassBox
          className={`px-3.5 py-2 rounded-full border bg-[#13111C]/95 shadow-xl flex items-center gap-2.5 backdrop-blur-xl transition-all ${
            isAlarmRinging
              ? 'border-amber-400 bg-amber-950/90 shadow-amber-500/50 animate-bounce'
              : `${currentConfig.borderAccent} shadow-black/60`
          }`}
        >
          {isAlarmRinging ? (
            /* Alarm Ringing Active State with Stop Button */
            <button
              type="button"
              onClick={handleStopAlarm}
              className="px-2.5 py-1 rounded-full bg-amber-500 text-black font-bold text-xs flex items-center gap-1.5 animate-pulse shadow-md hover:bg-amber-400 transition"
              title="Stop Ringtone"
            >
              <BellRing className="w-3.5 h-3.5 animate-spin" />
              <span>Alarm Ringing (Stop)</span>
            </button>
          ) : (
            <>
              {/* Play/Pause Toggle */}
              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                  isRunning
                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                    : 'bg-white/10 text-white/90 hover:bg-white/20'
                }`}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>

              {/* Time Display */}
              <span className="font-mono text-sm font-bold text-white tracking-wider px-1">
                {formattedTime}
              </span>

              {/* Reset button if paused and modified */}
              {!isRunning && secondsLeft !== totalSeconds && (
                <button
                  type="button"
                  onClick={() => setSecondsLeft(totalSeconds)}
                  title="Reset Timer"
                  className="p-1 text-white/50 hover:text-white transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Configure Settings Button */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className={`p-1 ${currentConfig.textAccent} hover:opacity-80 transition`}
                title="Timer Settings"
              >
                <TimerIcon className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Close Widget */}
          <button
            type="button"
            onClick={() => {
              if (isAlarmRinging) handleStopAlarm();
              setIsRunning(false);
              onDismiss();
            }}
            className="p-1 text-white/40 hover:text-white/80 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </GlassBox>
      </div>

      {/* Timer Configuration Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-md"
            >
              <GlassBox className="p-6 border-white/20 bg-[#13111C]/95 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TimerIcon className={`w-5 h-5 ${currentConfig.textAccent}`} />
                    <span>Focus Study Timer</span>
                  </h3>
                  <button onClick={() => setIsSettingsOpen(false)} className="p-1 text-white/60 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="mt-5">
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2.5">
                    Quick Presets
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESETS.map((mins) => {
                      const label = mins >= 60 ? `${mins / 60}h` : `${mins}m`;
                      const isSelected = totalSeconds === mins * 60;
                      return (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => {
                            const secs = mins * 60;
                            setTotalSeconds(secs);
                            setSecondsLeft(secs);
                            setIsRunning(false);
                            setIsSettingsOpen(false);
                          }}
                          className={`py-3 rounded-xl font-bold text-xs border transition ${
                            isSelected
                              ? 'bg-white/20 border-white/40 text-white shadow-lg'
                              : 'bg-white/[0.04] border-white/10 text-white/80 hover:bg-white/[0.08]'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Duration */}
                <div className="mt-6">
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2.5">
                    Custom Duration (Max 5 Hours)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={customHours}
                        onChange={(e) => setCustomHours(e.target.value.slice(0, 1))}
                        placeholder="Hours (0-5)"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={customMins}
                        onChange={(e) => setCustomMins(e.target.value.slice(0, 2))}
                        placeholder="Minutes (0-59)"
                        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white text-sm placeholder-white/40 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-white/70 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const h = Math.min(5, Math.max(0, parseInt(customHours || '0', 10)));
                      const m = Math.min(59, Math.max(0, parseInt(customMins || '0', 10)));
                      const total = h * 3600 + m * 60;
                      if (total > 0) {
                        setTotalSeconds(total);
                        setSecondsLeft(total);
                        setIsRunning(false);
                      }
                      setIsSettingsOpen(false);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white ${currentConfig.buttonClass} transition`}
                  >
                    Apply Duration
                  </button>
                </div>
              </GlassBox>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
