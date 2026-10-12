/**
 * Utilitário de áudio sintetizado via Web Audio API nativa e elemento HTML5 Audio.
 * 100% livre de dependências externas, arquivos mp3 remotos ou falhas de carregamento.
 * Produz um toque de alerta agradável, acolhedor e contínuo a cada 2,5 segundos (carrilhão/chime de clínica de Pilates/Fisioterapia).
 * Suporta desbloqueio automático de áudio em iPhones, Androids e computadores.
 */

class AlertSoundManager {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private audioUnlocked: boolean = false;
  private fallbackAudioEl: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupGlobalUnlockListeners();
    }
  }

  /**
   * Monitora qualquer toque, clique ou tecla do usuário para desbloquear o áudio do navegador imediatamente
   */
  private setupGlobalUnlockListeners() {
    const unlockHandler = () => {
      this.unlockAudio().catch(() => {});
      // Remove após o primeiro desbloqueio bem-sucedido
      if (this.audioUnlocked) {
        window.removeEventListener('click', unlockHandler, true);
        window.removeEventListener('touchstart', unlockHandler, true);
        window.removeEventListener('pointerdown', unlockHandler, true);
        window.removeEventListener('keydown', unlockHandler, true);
      }
    };

    window.addEventListener('click', unlockHandler, { capture: true, passive: true });
    window.addEventListener('touchstart', unlockHandler, { capture: true, passive: true });
    window.addEventListener('pointerdown', unlockHandler, { capture: true, passive: true });
    window.addEventListener('keydown', unlockHandler, { capture: true, passive: true });
  }

  public async unlockAudio(): Promise<boolean> {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return false;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      // Toca um micro-som imperceptível de 1 milissegundo para acordar o driver de áudio (especialmente em iOS Safari)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.005);

      this.audioUnlocked = true;
      return true;
    } catch (e) {
      console.warn('[AlertSound] Aviso ao desbloquear áudio:', e);
      return false;
    }
  }

  private getAudioContext(): AudioContext | null {
    try {
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        const AudioContextClass =
          (typeof window !== 'undefined' && (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext));
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch (_) {
      return null;
    }
  }

  /**
   * Toca uma nota suave com envelope harmônico (senóide pura com decaimento suave de carrilhão)
   */
  private playSoftChimeTone(
    freq: number,
    startTime: number,
    duration: number = 0.85,
    volume: number = 0.22
  ) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Envelope suave de sino com ataque rápido e ressonância agradável
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch (e) {
      console.warn('[AlertSound] Erro ao sintetizar nota:', e);
    }
  }

  /**
   * Toca o ciclo de notas de sino harmônico (arpeggio suave: Mi5 -> Sol#5 -> Si5 -> Mi6)
   */
  public playChimeCycle() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) {
        this.playFallbackBeep();
        return;
      }
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;

      // Frequências suaves em tons maiores agradáveis (E5, G#5, B5, E6)
      this.playSoftChimeTone(659.25, now + 0.00, 0.9, 0.20); // E5
      this.playSoftChimeTone(830.61, now + 0.20, 0.9, 0.22); // G#5
      this.playSoftChimeTone(987.77, now + 0.40, 0.9, 0.24); // B5
      this.playSoftChimeTone(1318.51, now + 0.62, 1.2, 0.25); // E6
    } catch (e) {
      // Fallback para beep de emergência se Web Audio falhar
      this.playFallbackBeep();
    }
  }

  /**
   * Toca um ciclo individual para teste ou confirmação
   */
  public playSingleAlertChime() {
    this.unlockAudio().then(() => {
      this.playChimeCycle();
    }).catch(() => {
      this.playChimeCycle();
    });
  }

  /**
   * Inicia o som contínuo e agradável em repetição a cada 2,5 segundos até que alguém confirme
   */
  public startContinuousAlert() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Tenta desbloquear caso ainda não tenha sido
    this.unlockAudio().catch(() => {});

    const playLoop = () => {
      if (!this.isPlaying) return;
      this.playChimeCycle();
      // Repete rigorosamente a cada 2,5 segundos (2500ms) conforme requisito do usuário
      this.timerId = window.setTimeout(playLoop, 2500);
    };

    // Inicia imediatamente o primeiro ciclo
    playLoop();
  }

  /**
   * Interrompe o som de alerta contínuo
   */
  public stopContinuousAlert() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Toca um acorde harmônico agradável de sucesso na confirmação do agendamento
   */
  public playSuccessChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;
      // Tríade maior de celebração suave (Dó5, Mi5, Sol5, Dó6)
      this.playSoftChimeTone(523.25, now + 0.00, 0.7, 0.18); // C5
      this.playSoftChimeTone(659.25, now + 0.12, 0.8, 0.20); // E5
      this.playSoftChimeTone(783.99, now + 0.24, 0.9, 0.22); // G5
      this.playSoftChimeTone(1046.50, now + 0.38, 1.4, 0.25); // C6
    } catch (e) {}
  }

  /**
   * Fallback de áudio com elemento HTML5 Audio
   */
  private playFallbackBeep() {
    try {
      if (!this.fallbackAudioEl && typeof document !== 'undefined') {
        this.fallbackAudioEl = new Audio(
          'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YV4GAACBhYqFbF1fdJivrJBhNjVgodDbqWE1MV2huePmsm48LkWayeXptX9GLTqTy+vvuYFPLTGK0PP1wY1UKyV+zvf7y5hdMCt3y/v+06JtPTBrwv7/27eHYEU0Zrf6/93Fm29GLV2t9//g1beVbkksVav5/uXZv5tsRStOofj/49e8n3BGLkWa9f/f07ebbEMsTJnz/+DTsp1xRi1FmfT/4NKvnXFFLEST8//gz7Sec0UsQo/y/9/MtZ50Ri0/ifH/3sqwn3VGLD2E7//cxqugeUcpPH/t/9q/pqB8Ri04eOX/1bmjoH5HKzZz4v/SsqCigkcqM27c/86pnKOCRygxZ9T/x6KWo4VHKC1jzv/CnpSmhkgnLly+/L6XlKeISyQoVLH3upOPqIlMICZMrPPskYyqi08dIVSn77GJi6yPTxcfUaTvrouHro9OEx1MoOi6hX+rkk8THUmf5b2Bfa2VUBAZSpe+un93r5lNDhhHmbeud3WxmU8LGEGVsq1vcLGbTgsZP5Krp2lssZxQCxg7kKamY2mznFALGTmQpKdhZrOeTwsZP5KpqGpssp5PCxg8k6qma22znk4LGECUqqttbbKdUAsYQpSpqmxrrpxPCxg/k6upbGuunE8LGTuSqKdoaa2cTwsaO5Kop2tqq51SCxo9kqina2qpnVMKGz2SqKdrb6ifVQocP5Kop2xup55XChw/k6mpaW2nmVkKHD+TqaZobKWYWQocP5Kop2dtpJZZCRw+k6mnZ2uhk1gIHD6TqadmZZ2PWQccPpOppmdimolUBh0+k6mmZ16Ug1IEHT6TqadqW416TQYePpOpp2hVgnNLBB8+k6mmZVFvXQYfP5OppWlOZlgEIT+TqaVnS15WAyE/k6qlZkVTUQMiP5OqpWREUFAEJECUq6VbQE1OBiZBlauiVD5HRQsnQpWro0s3PUIIJ0SWraFCMDUJLEKVq5s1KC0KMEKVqZEoIycNMEKWo4ccICMPMEKWnXoWEhMKM0OXl2sNDg8HM0OWkW8HAwIFN0KUj3wCAAAFNUKTjHkCAAAFNUGTiHQAAAAGND6Ph2wAAAAGMTuLfmAAAAAHLSyDenEAAAAGKiCBcmcAAAAGIx93Z14AAAAGHBtvXkYAAAAWFlRLTQEAAAA='
        );
      }
      if (this.fallbackAudioEl) {
        this.fallbackAudioEl.currentTime = 0;
        this.fallbackAudioEl.play().catch(() => {});
      }
    } catch (_) {}
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public isAudioUnlocked(): boolean {
    return this.audioUnlocked;
  }
}

export const alertSoundManager = new AlertSoundManager();
