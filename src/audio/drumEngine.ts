export type DrumInstrument =
  | 'kick'
  | 'snare'
  | 'rim'
  | 'hihatClosed'
  | 'hihatOpen'
  | 'crash'
  | 'ride'
  | 'rideBell'
  | 'tomHigh'
  | 'tomMid'
  | 'tomLow'
  | 'zabumbaBass'
  | 'zabumbaBacalhau'
  | 'triangleOpen'
  | 'triangleMuted'
  | 'pandeiroBass'
  | 'pandeiroSlap'
  | 'pandeiroJingle'
  | 'surdo'
  | 'surdoMuted'
  | 'cowbell'
  | 'shaker'
  | 'tamborim';

export interface StepHit {
  instrument: DrumInstrument;
  velocity?: number; // 0.0 to 1.0
}

export type Pattern16 = StepHit[][]; // length 16 (steps 0..15)

class DrumAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbSend: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private volume = 1.0;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(18, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.002, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.18, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.noiseBuffer = this.createNoiseBuffer(this.ctx);
      this.reverbNode = this.createStudioReverb(this.ctx);
      this.reverbSend = this.ctx.createGain();
      this.reverbSend.gain.setValueAtTime(0.24, this.ctx.currentTime);
      this.reverbSend.connect(this.reverbNode);
      this.reverbNode.connect(this.compressor);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public unlock(): AudioContext {
    return this.ensureContext();
  }

  public getCurrentTime(): number {
    return this.ensureContext().currentTime;
  }

  public setVolume(vol01: number): void {
    this.volume = Math.max(0, Math.min(1, vol01));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.015);
    }
  }

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = ctx.sampleRate * 2.0;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private createStudioReverb(ctx: AudioContext): ConvolverNode {
    const length = Math.floor(ctx.sampleRate * 0.42);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        const decay = Math.pow(1 - i / length, 2.8);
        data[i] = (Math.random() * 2 - 1) * decay;
      }
    }
    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }

  private route(node: AudioNode, reverbAmount = 0): void {
    if (!this.compressor) return;
    node.connect(this.compressor);
    if (reverbAmount > 0 && this.reverbSend && this.ctx) {
      const send = this.ctx.createGain();
      send.gain.setValueAtTime(reverbAmount, this.ctx.currentTime);
      node.connect(send);
      send.connect(this.reverbSend);
    }
  }

  public trigger(instrument: DrumInstrument, time?: number, velocity = 1): void {
    const ctx = this.ensureContext();
    const t = time ?? ctx.currentTime + 0.005;
    const vel = Math.max(0.05, Math.min(1.2, velocity));

    switch (instrument) {
      case 'kick':
        this.playKick(ctx, t, vel);
        break;
      case 'snare':
        this.playSnare(ctx, t, vel);
        break;
      case 'rim':
        this.playRim(ctx, t, vel);
        break;
      case 'hihatClosed':
        this.playHiHat(ctx, t, vel, false);
        break;
      case 'hihatOpen':
        this.playHiHat(ctx, t, vel, true);
        break;
      case 'crash':
        this.playCrash(ctx, t, vel);
        break;
      case 'ride':
        this.playRide(ctx, t, vel, false);
        break;
      case 'rideBell':
        this.playRide(ctx, t, vel, true);
        break;
      case 'tomHigh':
        this.playTom(ctx, t, vel, 220, 115, 0.24);
        break;
      case 'tomMid':
        this.playTom(ctx, t, vel, 165, 85, 0.28);
        break;
      case 'tomLow':
        this.playTom(ctx, t, vel, 120, 62, 0.34);
        break;
      case 'zabumbaBass':
        this.playZabumbaBass(ctx, t, vel);
        break;
      case 'zabumbaBacalhau':
        this.playZabumbaBacalhau(ctx, t, vel);
        break;
      case 'triangleOpen':
        this.playTriangle(ctx, t, vel, true);
        break;
      case 'triangleMuted':
        this.playTriangle(ctx, t, vel, false);
        break;
      case 'pandeiroBass':
        this.playPandeiroBass(ctx, t, vel);
        break;
      case 'pandeiroSlap':
        this.playPandeiroSlap(ctx, t, vel);
        break;
      case 'pandeiroJingle':
        this.playPandeiroJingle(ctx, t, vel);
        break;
      case 'surdo':
        this.playSurdo(ctx, t, vel, false);
        break;
      case 'surdoMuted':
        this.playSurdo(ctx, t, vel, true);
        break;
      case 'cowbell':
        this.playCowbell(ctx, t, vel);
        break;
      case 'shaker':
        this.playShaker(ctx, t, vel);
        break;
      case 'tamborim':
        this.playTamborim(ctx, t, vel);
        break;
    }
  }

  private playKick(ctx: AudioContext, t: number, vel: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(145, t);
    osc.frequency.exponentialRampToValueAtTime(52, t + 0.045);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.28);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(1.0 * vel, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);

    osc.connect(gain);
    this.route(gain, 0.04);
    osc.start(t);
    osc.stop(t + 0.36);

    // Beater click transient
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'triangle';
    click.frequency.setValueAtTime(1800, t);
    click.frequency.exponentialRampToValueAtTime(220, t + 0.018);
    clickGain.gain.setValueAtTime(0.32 * vel, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.022);
    click.connect(clickGain);
    this.route(clickGain, 0);
    click.start(t);
    click.stop(t + 0.025);
  }

  private playSnare(ctx: AudioContext, t: number, vel: number): void {
    // Drum shell body
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(215, t);
    osc.frequency.exponentialRampToValueAtTime(132, t + 0.09);
    oscGain.gain.setValueAtTime(0.55 * vel, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    osc.connect(oscGain);
    this.route(oscGain, 0.22);
    osc.start(t);
    osc.stop(t + 0.15);

    // Snare wires noise
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(1400, t);

      const bp = ctx.createBiquadFilter();
      bp.type = 'peaking';
      bp.frequency.setValueAtTime(3400, t);
      bp.gain.setValueAtTime(4, t);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.75 * vel, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      noise.connect(hp);
      hp.connect(bp);
      bp.connect(noiseGain);
      this.route(noiseGain, 0.32);
      noise.start(t);
      noise.stop(t + 0.22);
    }
  }

  private playRim(ctx: AudioContext, t: number, vel: number): void {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(490, t);
    osc1.frequency.exponentialRampToValueAtTime(360, t + 0.025);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1620, t);
    osc2.frequency.exponentialRampToValueAtTime(980, t + 0.02);

    gain.gain.setValueAtTime(0.65 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.048);

    osc1.connect(gain);
    osc2.connect(gain);
    this.route(gain, 0.22);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.055);
    osc2.stop(t + 0.055);
  }

  private playHiHat(ctx: AudioContext, t: number, vel: number, open: boolean): void {
    const duration = open ? 0.34 : 0.055;
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(6800, t);

      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(9800, t);
      bp.Q.setValueAtTime(1.1, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime((open ? 0.36 : 0.32) * vel, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(hp);
      hp.connect(bp);
      bp.connect(gain);
      this.route(gain, open ? 0.25 : 0.08);
      noise.start(t);
      noise.stop(t + duration + 0.02);
    }

    // Metallic partials
    const freqs = [310, 466, 678, 945];
    const metalGain = ctx.createGain();
    const metalHp = ctx.createBiquadFilter();
    metalHp.type = 'highpass';
    metalHp.frequency.setValueAtTime(6200, t);

    metalGain.gain.setValueAtTime((open ? 0.14 : 0.1) * vel, t);
    metalGain.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.85);
    metalHp.connect(metalGain);
    this.route(metalGain, open ? 0.2 : 0.05);

    for (const f of freqs) {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, t);
      osc.connect(metalHp);
      osc.start(t);
      osc.stop(t + duration);
    }
  }

  private playCrash(ctx: AudioContext, t: number, vel: number): void {
    const dur = 1.45;
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(3200, t);

      const peak = ctx.createBiquadFilter();
      peak.type = 'peaking';
      peak.frequency.setValueAtTime(6400, t);
      peak.gain.setValueAtTime(4.5, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.56 * vel, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      noise.connect(hp);
      hp.connect(peak);
      peak.connect(gain);
      this.route(gain, 0.48);
      noise.start(t);
      noise.stop(t + dur + 0.05);
    }

    const ratios = [285, 421, 597, 813, 1140, 1520];
    const metalGain = ctx.createGain();
    const metalFilter = ctx.createBiquadFilter();
    metalFilter.type = 'bandpass';
    metalFilter.frequency.setValueAtTime(5200, t);
    metalFilter.Q.setValueAtTime(0.6, t);

    metalGain.gain.setValueAtTime(0.24 * vel, t);
    metalGain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.9);
    metalFilter.connect(metalGain);
    this.route(metalGain, 0.42);

    for (const r of ratios) {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(r, t);
      osc.connect(metalFilter);
      osc.start(t);
      osc.stop(t + dur);
    }
  }

  private playRide(ctx: AudioContext, t: number, vel: number, bell: boolean): void {
    const dur = bell ? 0.72 : 0.52;
    const freqs = bell ? [680, 1045, 1690, 2410] : [412, 625, 910, 1340];
    const gain = ctx.createGain();
    const bp = ctx.createBiquadFilter();
    bp.type = 'highpass';
    bp.frequency.setValueAtTime(bell ? 1800 : 4200, t);

    gain.gain.setValueAtTime((bell ? 0.28 : 0.18) * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    bp.connect(gain);
    this.route(gain, 0.3);

    for (const f of freqs) {
      const osc = ctx.createOscillator();
      osc.type = bell ? 'triangle' : 'square';
      osc.frequency.setValueAtTime(f, t);
      osc.connect(bp);
      osc.start(t);
      osc.stop(t + dur);
    }

    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(7500, t);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime((bell ? 0.12 : 0.22) * vel, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      noise.connect(hp);
      hp.connect(nGain);
      this.route(nGain, 0.2);
      noise.start(t);
      noise.stop(t + 0.2);
    }
  }

  private playTom(
    ctx: AudioContext,
    t: number,
    vel: number,
    startFreq: number,
    endFreq: number,
    dur: number
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur * 0.75);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.8 * vel, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    this.route(gain, 0.28);
    osc.start(t);
    osc.stop(t + dur + 0.02);

    // Stick attack
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(startFreq * 4, t);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.22 * vel, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      noise.connect(bp);
      bp.connect(nGain);
      this.route(nGain, 0.15);
      noise.start(t);
      noise.stop(t + 0.04);
    }
  }

  private playZabumbaBass(ctx: AudioContext, t: number, vel: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(118, t);
    osc.frequency.exponentialRampToValueAtTime(58, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.34);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.95 * vel, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    this.route(gain, 0.16);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  private playZabumbaBacalhau(ctx: AudioContext, t: number, vel: number): void {
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(2200, t);
      bp.Q.setValueAtTime(2.2, t);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.55 * vel, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
      noise.connect(bp);
      bp.connect(gain);
      this.route(gain, 0.18);
      noise.start(t);
      noise.stop(t + 0.07);
    }

    const osc = ctx.createOscillator();
    const oGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.035);
    oGain.gain.setValueAtTime(0.38 * vel, t);
    oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    osc.connect(oGain);
    this.route(oGain, 0.12);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  private playTriangle(ctx: AudioContext, t: number, vel: number, open: boolean): void {
    const dur = open ? 0.36 : 0.055;
    const freqs = [3320, 4980, 6710];
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime((open ? 0.22 : 0.18) * vel, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    this.route(gain, open ? 0.25 : 0.08);

    for (const f of freqs) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      osc.connect(gain);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    }
  }

  private playPandeiroBass(ctx: AudioContext, t: number, vel: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(175, t);
    osc.frequency.exponentialRampToValueAtTime(76, t + 0.11);
    gain.gain.setValueAtTime(0.72 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(gain);
    this.route(gain, 0.16);
    osc.start(t);
    osc.stop(t + 0.18);

    this.playPandeiroJingle(ctx, t, vel * 0.45);
  }

  private playPandeiroSlap(ctx: AudioContext, t: number, vel: number): void {
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1950, t);
      bp.Q.setValueAtTime(1.8, t);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.65 * vel, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      noise.connect(bp);
      bp.connect(gain);
      this.route(gain, 0.2);
      noise.start(t);
      noise.stop(t + 0.07);
    }

    const osc = ctx.createOscillator();
    const oGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(340, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.04);
    oGain.gain.setValueAtTime(0.32 * vel, t);
    oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    osc.connect(oGain);
    this.route(oGain, 0.14);
    osc.start(t);
    osc.stop(t + 0.05);

    this.playPandeiroJingle(ctx, t, vel * 0.65);
  }

  private playPandeiroJingle(ctx: AudioContext, t: number, vel: number): void {
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(7800, t);
      const bp = ctx.createBiquadFilter();
      bp.type = 'peaking';
      bp.frequency.setValueAtTime(10500, t);
      bp.gain.setValueAtTime(5, t);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.28 * vel, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
      noise.connect(hp);
      hp.connect(bp);
      bp.connect(gain);
      this.route(gain, 0.15);
      noise.start(t);
      noise.stop(t + 0.075);
    }
  }

  private playSurdo(ctx: AudioContext, t: number, vel: number, muted: boolean): void {
    const dur = muted ? 0.14 : 0.42;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(muted ? 110 : 98, t);
    osc.frequency.exponentialRampToValueAtTime(muted ? 66 : 56, t + dur * 0.7);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime((muted ? 0.55 : 0.85) * vel, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    this.route(gain, muted ? 0.1 : 0.22);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private playCowbell(ctx: AudioContext, t: number, vel: number): void {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const bp = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(545, t);
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(815, t);

    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(720, t);
    bp.Q.setValueAtTime(2.5, t);

    gain.gain.setValueAtTime(0.28 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc1.connect(bp);
    osc2.connect(bp);
    bp.connect(gain);
    this.route(gain, 0.2);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.2);
    osc2.stop(t + 0.2);
  }

  private playShaker(ctx: AudioContext, t: number, vel: number): void {
    if (!this.noiseBuffer) return;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const hp = ctx.createBiquadFilter();
    hp.type = 'bandpass';
    hp.frequency.setValueAtTime(8200, t);
    hp.Q.setValueAtTime(1.4, t);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.22 * vel, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
    noise.connect(hp);
    hp.connect(gain);
    this.route(gain, 0.1);
    noise.start(t);
    noise.stop(t + 0.075);
  }

  private playTamborim(ctx: AudioContext, t: number, vel: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(410, t + 0.045);
    gain.gain.setValueAtTime(0.45 * vel, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(gain);
    this.route(gain, 0.2);
    osc.start(t);
    osc.stop(t + 0.08);
  }
}

export const drumEngine = new DrumAudioEngine();
