/**
 * SE Definitions — Web Audio API oscillator parameters for each sound effect.
 * Matrix/cyber-themed synthesized sounds. No external audio files needed.
 */

export const SE_DEFINITIONS = {
  // Short, sharp click for each keystroke. Must not interfere with typing tempo.
  type: {
    layers: [
      {
        type: 'oscillator',
        waveform: 'square',
        frequency: 1200,
        duration: 0.035,
        gain: 0.15,
        envelope: { attack: 0.002, decay: 0.033 },
      },
    ],
  },

  // Two-tone ascending chime for completing a word — a sense of achievement.
  correct: {
    layers: [
      {
        type: 'oscillator',
        waveform: 'sine',
        frequency: 880,
        duration: 0.12,
        gain: 0.2,
        envelope: { attack: 0.005, decay: 0.115 },
        delay: 0,
      },
      {
        type: 'oscillator',
        waveform: 'sine',
        frequency: 1320,
        duration: 0.18,
        gain: 0.25,
        envelope: { attack: 0.005, decay: 0.175 },
        delay: 0.08,
      },
    ],
  },

  // Short low buzzer for mistype — noticeable but not annoying.
  miss: {
    layers: [
      {
        type: 'oscillator',
        waveform: 'sawtooth',
        frequency: 180,
        duration: 0.12,
        gain: 0.15,
        envelope: { attack: 0.005, decay: 0.115 },
      },
      {
        type: 'oscillator',
        waveform: 'square',
        frequency: 220,
        duration: 0.1,
        gain: 0.08,
        envelope: { attack: 0.005, decay: 0.095 },
      },
    ],
  },

  // Matrix-style digital boot sound — layered tones for drama.
  start: {
    layers: [
      {
        type: 'oscillator',
        waveform: 'sawtooth',
        frequency: 120,
        duration: 0.3,
        gain: 0.12,
        envelope: { attack: 0.01, decay: 0.29 },
        delay: 0,
      },
      {
        type: 'oscillator',
        waveform: 'square',
        frequency: 440,
        duration: 0.15,
        gain: 0.1,
        envelope: { attack: 0.005, decay: 0.145 },
        delay: 0.05,
      },
      {
        type: 'oscillator',
        waveform: 'sine',
        frequency: 880,
        duration: 0.2,
        gain: 0.15,
        envelope: { attack: 0.01, decay: 0.19 },
        delay: 0.12,
      },
      {
        type: 'oscillator',
        waveform: 'square',
        frequency: 1760,
        duration: 0.25,
        gain: 0.1,
        envelope: { attack: 0.005, decay: 0.245 },
        delay: 0.2,
      },
      {
        type: 'oscillator',
        waveform: 'sine',
        frequency: 2200,
        duration: 0.35,
        gain: 0.08,
        envelope: { attack: 0.02, decay: 0.33 },
        delay: 0.3,
      },
    ],
  },

  // Descending chime for game over — a winding-down feel.
  end: {
    layers: [
      {
        type: 'oscillator',
        waveform: 'sine',
        frequency: 1200,
        duration: 0.2,
        gain: 0.2,
        envelope: { attack: 0.01, decay: 0.19 },
        delay: 0,
      },
      {
        type: 'oscillator',
        waveform: 'sine',
        frequency: 900,
        duration: 0.2,
        gain: 0.18,
        envelope: { attack: 0.01, decay: 0.19 },
        delay: 0.15,
      },
      {
        type: 'oscillator',
        waveform: 'sine',
        frequency: 600,
        duration: 0.3,
        gain: 0.15,
        envelope: { attack: 0.01, decay: 0.29 },
        delay: 0.3,
      },
      {
        type: 'oscillator',
        waveform: 'triangle',
        frequency: 400,
        duration: 0.4,
        gain: 0.1,
        envelope: { attack: 0.02, decay: 0.38 },
        delay: 0.45,
      },
    ],
  },

  // Countdown beeps: 3-2-1 are identical pips, then a distinct "pong" for GO.
  countdown: {
    pip: {
      layers: [
        {
          type: 'oscillator',
          waveform: 'sine',
          frequency: 1000,
          duration: 0.08,
          gain: 0.2,
          envelope: { attack: 0.005, decay: 0.075 },
        },
      ],
    },
    go: {
      layers: [
        {
          type: 'oscillator',
          waveform: 'sine',
          frequency: 1400,
          duration: 0.25,
          gain: 0.25,
          envelope: { attack: 0.01, decay: 0.24 },
        },
        {
          type: 'oscillator',
          waveform: 'triangle',
          frequency: 700,
          duration: 0.2,
          gain: 0.1,
          envelope: { attack: 0.005, decay: 0.195 },
        },
      ],
    },
  },
};
