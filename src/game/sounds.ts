// Geluidjes bij goed, fout en klaar. Ze worden in de browser zelf gemaakt (Web
// Audio), dus er zijn geen geluidsbestanden nodig. Aan of uit staat in de
// voorkeuren van de speler (zie storage); standaard aan.

import { getSoundOn } from '../storage';

export type SoundKind = 'correct' | 'wrong' | 'complete';

interface Tone {
  /** Toonhoogte in Hz. */
  freq: number;
  /** Begin en lengte in seconden. */
  start: number;
  length: number;
  type: OscillatorType;
}

/** Korte, zachte deuntjes: twee tonen omhoog (goed), een lage toon (fout), een loopje (klaar). */
export const SOUNDS: Record<SoundKind, Tone[]> = {
  correct: [
    { freq: 660, start: 0, length: 0.12, type: 'sine' },
    { freq: 880, start: 0.1, length: 0.18, type: 'sine' },
  ],
  wrong: [{ freq: 196, start: 0, length: 0.22, type: 'triangle' }],
  complete: [
    { freq: 523, start: 0, length: 0.14, type: 'sine' },
    { freq: 659, start: 0.13, length: 0.14, type: 'sine' },
    { freq: 784, start: 0.26, length: 0.14, type: 'sine' },
    { freq: 1047, start: 0.39, length: 0.35, type: 'sine' },
  ],
};

/** Niet te hard: het moet ook in een klas fijn blijven. */
const VOLUME = 0.12;

let context: AudioContext | null = null;

export function playSound(kind: SoundKind): void {
  if (!getSoundOn()) return;
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    const now = context.currentTime;
    for (const tone of SOUNDS[kind]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = tone.type;
      oscillator.frequency.value = tone.freq;
      // Zacht in- en uitfaden, anders klikt het.
      gain.gain.setValueAtTime(0, now + tone.start);
      gain.gain.linearRampToValueAtTime(VOLUME, now + tone.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + tone.start + tone.length);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + tone.start);
      oscillator.stop(now + tone.start + tone.length + 0.02);
    }
  } catch {
    // Geen geluid mogelijk (oude browser of geblokkeerd): dan stil, het spel gaat door.
  }
}
