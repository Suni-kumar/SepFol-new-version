// Web Audio API based Realistic Phone Alarm & Chime Generator
// Safe in all browsers, zero external dependencies, works offline and on mobile.

let audioCtx: AudioContext | null = null;
let alarmInterval: number | null = null;
let isAlarmPlaying = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Unlock audio on initial user touch/click to prevent autoplay policy blocks
export function initAudioOnUserInteraction() {
  const unlock = () => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {}
    window.removeEventListener('click', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('click', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true });
}

// Play a single harmonic bell / marimba note with warm overtone decay
function playBellNote(ctx: AudioContext, frequency: number, time: number, duration = 0.6) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Gentle sine-triangle hybrid for phone alarm ringtone warmth
  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, time);

  // Envelope: immediate punch, smooth bell decay
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.28, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

  // Subtle overtone for phone marimba realism
  const overtone = ctx.createOscillator();
  const overtoneGain = ctx.createGain();
  overtone.type = 'triangle';
  overtone.frequency.setValueAtTime(frequency * 2.01, time);
  overtoneGain.gain.setValueAtTime(0, time);
  overtoneGain.gain.linearRampToValueAtTime(0.08, time + 0.01);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.7);

  osc.connect(gain);
  gain.connect(ctx.destination);

  overtone.connect(overtoneGain);
  overtoneGain.connect(ctx.destination);

  osc.start(time);
  osc.stop(time + duration);
  overtone.start(time);
  overtone.stop(time + duration);
}

// Play one iteration of the phone alarm melody (Classic pleasant phone chime)
export function playChimePattern() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime + 0.05;

    // Melody: High gentle ascending chime followed by resolving cadence
    // Notes: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50), B5 (987.77), G5 (783.99)
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.4 },
      { freq: 659.25, time: 0.18, dur: 0.4 },
      { freq: 783.99, time: 0.36, dur: 0.45 },
      { freq: 1046.5, time: 0.54, dur: 0.7 },
      { freq: 880.0, time: 0.85, dur: 0.4 },
      { freq: 987.77, time: 1.05, dur: 0.45 },
      { freq: 1046.5, time: 1.25, dur: 0.8 },
    ];

    notes.forEach((n) => {
      playBellNote(ctx, n.freq, now + n.time, n.dur);
    });
  } catch (e) {
    console.warn('Audio alarm could not play:', e);
  }
}

// Start continuous looping alarm until user stops it
export function startPhoneAlarm(onAutoStop?: () => void) {
  if (isAlarmPlaying) return;
  isAlarmPlaying = true;

  playChimePattern();
  alarmInterval = window.setInterval(() => {
    playChimePattern();
  }, 2200);

  // Auto-stop after 45 seconds to preserve battery
  window.setTimeout(() => {
    if (isAlarmPlaying) {
      stopPhoneAlarm();
      if (onAutoStop) onAutoStop();
    }
  }, 45000);
}

// Stop the playing alarm
export function stopPhoneAlarm() {
  isAlarmPlaying = false;
  if (alarmInterval !== null) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
}

export function isAlarmActive(): boolean {
  return isAlarmPlaying;
}
