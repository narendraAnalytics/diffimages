export class BeepGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported');
      }
    }
  }

  playBeep(frequency = 800, duration = 150, volume = 0.3) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration / 1000
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  playBeeps(count: number, interval = 100) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => this.playBeep(), i * (150 + interval));
    }
  }

  /**
   * Play a success chime (3-tone ascending melody)
   * Used when user clicks correct difference
   */
  playSuccessChime(): void {
    if (!this.audioContext) return;

    // Three ascending tones: 600Hz, 800Hz, 1000Hz
    const frequencies = [600, 800, 1000];
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        this.playBeep(freq, 150, 0.25); // 150ms duration, 25% volume
      }, i * 100); // Stagger by 100ms
    });
  }

  /**
   * Play a single click sound
   * @param success - true for high pitch, false for low error pitch
   */
  playClickSound(success: boolean = false): void {
    if (!this.audioContext) return;

    const frequency = success ? 1200 : 400; // High for success, low for error
    const duration = success ? 200 : 100;   // Longer for success

    this.playBeep(frequency, duration, 0.2); // 20% volume
  }

  destroy() {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
