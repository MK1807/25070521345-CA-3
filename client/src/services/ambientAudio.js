// Web Audio API Synthesizer for Ambient Sound Lounge
// Zero external asset dependencies - runs 100% offline and in-browser!

class AmbientEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.tracks = {};
    this.isRunning = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this._setupWhiteNoise();
    this._setupRain();
    this._setupCafe();
    this._setupLofi();
  }

  ensureRunning() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _createNoiseBuffer(seconds = 5) {
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  _setupWhiteNoise() {
    const buffer = this._createNoiseBuffer(5);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(0);

    this.tracks.white = { gain, filter };
  }

  _setupRain() {
    const buffer = this._createNoiseBuffer(6);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Bandpass for gentle downpour sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(0);

    this.tracks.rain = { gain, filter };
  }

  _setupCafe() {
    // Cafe murmur synthesized via dual resonant bandpasses and subtle modulation
    const buffer = this._createNoiseBuffer(6);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start(0);

    this.tracks.cafe = { gain, filter };
  }

  _setupLofi() {
    // Warm lo-fi chill chords + subtle rhythm
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, this.ctx.currentTime);

    filter.connect(gain);
    gain.connect(this.masterGain);

    // Minor 9th chord progression frequencies (Dm9 -> G13 -> Cmaj9 -> Am7)
    const chords = [
      [146.83, 220.0, 261.63, 329.63], // Dm9
      [196.0, 246.94, 329.63, 392.0],  // G13
      [130.81, 196.0, 246.94, 293.66], // Cmaj9
      [220.0, 261.63, 329.63, 392.0]   // Am7
    ];

    let chordIndex = 0;
    const playChord = () => {
      if (!this.ctx) return;
      const notes = chords[chordIndex];
      chordIndex = (chordIndex + 1) % chords.length;

      notes.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        noteGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.6);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.2);

        osc.connect(noteGain);
        noteGain.connect(filter);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + 3.4);
      });
    };

    // Schedule chords every 3.2 seconds
    setInterval(playChord, 3200);

    this.tracks.lofi = { gain, filter };
  }

  setVolume(trackKey, volume) {
    this.ensureRunning();
    const track = this.tracks[trackKey];
    if (track && track.gain) {
      const v = Math.max(0, Math.min(1, volume));
      track.gain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    }
  }

  getVisualizerData(array) {
    if (!this.analyser) return;
    this.analyser.getByteFrequencyData(array);
  }

  stopAll() {
    ['lofi', 'rain', 'cafe', 'white'].forEach((t) => this.setVolume(t, 0));
  }
}

export const ambientEngine = new AmbientEngine();
