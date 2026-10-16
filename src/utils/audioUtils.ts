/**
 * Audio Utilities for Tides of Knysna Inventory & Asset Control
 * Generates subtle, professional audio cues via the Web Audio API
 * without external audio file dependencies.
 */

export const playLaserTagSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Laser tag zap primary sweep: crisp high-to-mid frequency chirp
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(1450, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.12);

    gain1.gain.setValueAtTime(0.22, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start();
    osc1.stop(ctx.currentTime + 0.16);

    // Harmonic laser echo chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2200, ctx.currentTime + 0.03);
    osc2.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);

    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.22);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(ctx.currentTime + 0.03);
    osc2.stop(ctx.currentTime + 0.23);
  } catch (e) {
    // Silently handle environments where Web Audio is muted/restricted
  }
};
