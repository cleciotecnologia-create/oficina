/**
 * Safe, browser-synthesized audio feedback using the Web Audio API.
 * This runs entirely on the client side with no external audios, avoiding 404s or bundle size issues.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

/**
 * Plays a cheerful, professional "success" double-chime (sine wave arpeggio)
 */
export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Resume context if browser suspended it due to user interaction policies
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const now = ctx.currentTime;
    
    // Tone 1: C5 (523.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    
    // Smooth volume decay
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.16);
    
    // Tone 2: G5 (783.99Hz) - played slightly delayed
    const delay = 0.08;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + delay);
    
    gain2.gain.setValueAtTime(0.0, now);
    gain2.gain.setValueAtTime(0.15, now + delay);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + delay);
    osc2.stop(now + delay + 0.26);
    
  } catch (error) {
    // Fail silently so audio issues never crash any critical system operations
    console.warn('Audio feedback failed or was blocked by browser policies:', error);
  }
}

/**
 * Plays a crisp, subtle "cash register click" sound
 */
export function playCashRegisterSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const now = ctx.currentTime;
    
    // Click tone 1: High pitch sine chirp
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6
    
    gain1.gain.setValueAtTime(0.1, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.09);
    
    // Click tone 2 (delayed): higher pitch chime
    const delay = 0.05;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1567.98, now + delay); // G6
    
    gain2.gain.setValueAtTime(0.0, now);
    gain2.gain.setValueAtTime(0.08, now + delay);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + delay);
    osc2.stop(now + delay + 0.19);
    
  } catch (error) {
    console.warn('Audio feedback failed or was blocked by browser policies:', error);
  }
}
