let audioCtx: AudioContext | null = null;
let tunerOscillator: OscillatorNode | null = null;
let tunerGainNode: GainNode | null = null;

// Base frequencies for acoustic guitar strings: 6th (Low E) to 1st (High e)
const stringBaseFreqs = [
  82.41,  // E2 (6ª corda)
  110.00, // A2 (5ª corda)
  146.83, // D3 (4ª corda)
  196.00, // G3 (3ª corda)
  246.94, // B3 (2ª corda)
  329.63  // E4 (1ª corda)
];

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a single guitar string tone (fretted or open)
 */
function playStringTone(
  ctx: AudioContext,
  stringIndex: number,
  fret: number,
  time: number,
  duration = 1.8
) {
  const baseFreq = stringBaseFreqs[stringIndex];
  const frequency = baseFreq * Math.pow(2, fret / 12);

  // We combine a triangle wave (for fat acoustic wood depth) and a sine wave (for support)
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc1.type = "triangle";
  osc2.type = "sine";

  osc1.frequency.setValueAtTime(frequency, time);
  osc2.frequency.setValueAtTime(frequency * 2, time); // Harmony harmonic

  filter.type = "lowpass";
  // The cutoff sweeps down as the string rings out, mimicking string damping
  filter.frequency.setValueAtTime(1500, time);
  filter.frequency.exponentialRampToValueAtTime(150, time + duration);

  // Attack-Decay-Sustain-Release Gain Envelope
  const maxGain = stringIndex >= 3 ? 0.25 : 0.4; // Bass strings slightly louder, treble crisp
  gainNode.gain.setValueAtTime(0, time);
  gainNode.gain.linearRampToValueAtTime(maxGain, time + 0.008); // Sharp pluck attack
  gainNode.gain.exponentialRampToValueAtTime(0.005, time + duration); // Gradual decay

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc1.start(time);
  osc2.start(time);

  osc1.stop(time + duration + 0.1);
  osc2.stop(time + duration + 0.1);
}

/**
 * Strum a guitar chord with a small strum separation delay (e.g. 35ms - 60ms)
 * to simulate a physical pick hitting strings in sequence.
 */
export function playGuitarChord(frets: (number | "x")[], speed: "strum" | "fast" | "plucked" = "strum") {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Strum delay separation in seconds
  let delayBetweenStrings = 0.035; // default is moderate
  if (speed === "plucked") {
    delayBetweenStrings = 0.18; // Slow arpeggio
  } else if (speed === "fast") {
    delayBetweenStrings = 0.015; // Fast sweep
  }

  // Iterate over strings (normally from 6th (E2, index 0) to 1st (E4, index 5))
  let playedCount = 0;
  for (let i = 0; i < 6; i++) {
    const fret = frets[i];
    if (fret !== "x") {
      const scheduledTime = now + (playedCount * delayBetweenStrings);
      playStringTone(ctx, i, fret, scheduledTime, 2.0);
      playedCount++;
    }
  }
}

/**
 * Continuous tuning tone for a specific string
 */
export function startReferenceTone(stringIndex: number) {
  stopReferenceTone();
  
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  const frequency = stringBaseFreqs[stringIndex];

  tunerOscillator = ctx.createOscillator();
  tunerGainNode = ctx.createGain();

  tunerOscillator.type = "triangle";
  tunerOscillator.frequency.setValueAtTime(frequency, now);

  tunerGainNode.gain.setValueAtTime(0, now);
  tunerGainNode.gain.linearRampToValueAtTime(0.15, now + 0.1); // Smooth volume ramp up

  tunerOscillator.connect(tunerGainNode);
  tunerGainNode.connect(ctx.destination);

  tunerOscillator.start(now);
}

export function stopReferenceTone() {
  if (tunerOscillator && tunerGainNode) {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      tunerGainNode.gain.cancelScheduledValues(now);
      tunerGainNode.gain.setValueAtTime(tunerGainNode.gain.value, now);
      tunerGainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15); // Fade out
      tunerOscillator.stop(now + 0.2);
    } catch (e) {
      // Ignored if state is completed or suspended
    }
    tunerOscillator = null;
    tunerGainNode = null;
  }
}

/**
 * Plays a simple, crisp metronome sound
 * high tick for beat 1, low tick for subsequent beats.
 */
export function playMetronomeBeat(isFirstBeat: boolean) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = "sine";
    // First beat is high pitched, other beats are woodblock low click
    osc.frequency.setValueAtTime(isFirstBeat ? 1000 : 600, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08); // short click

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  } catch (err) {
    console.error("Metronome audio failed", err);
  }
}
