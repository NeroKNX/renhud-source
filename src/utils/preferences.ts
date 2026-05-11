export type FontSize = 'small' | 'medium' | 'large';
export type ThemeMode = 'dark' | 'light';

export interface UserPreferences {
  fontSize: FontSize;
  theme: ThemeMode;
  soundEnabled: boolean;
  skillNewChat: boolean;
  drafts: Record<string, string>;
}

const PREFERENCES_KEY = 'ren_preferences';
const DEFAULT_PREFERENCES: UserPreferences = {
  fontSize: 'medium', theme: 'dark', soundEnabled: false,
  skillNewChat: true, drafts: {},
};

function readPrefs(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch { return { ...DEFAULT_PREFERENCES }; }
}

function writePrefs(prefs: UserPreferences): void {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
}

function syncToServer(prefs: UserPreferences): void {
  try {
    const raw = localStorage.getItem('ren_user');
    if (!raw) return;
    const user = JSON.parse(raw);
    if (!user.user_id || user.isGuest) return;
    fetch('/api/prefs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id, prefs }),
    }).catch(() => {});
  } catch {}
}

export const fontSizes: Record<FontSize, string> = {
  small: '14px', medium: '16px', large: '18px',
};

export class PreferencesManager {
  static get(): UserPreferences { return readPrefs(); }

  static update(partial: Partial<UserPreferences>): void {
    const prefs = { ...readPrefs(), ...partial };
    writePrefs(prefs);
    syncToServer(prefs);
  }

  static async loadFromServer(): Promise<void> {
    try {
      const raw = localStorage.getItem('ren_user');
      if (!raw) return;
      const user = JSON.parse(raw);
      if (!user.user_id || user.isGuest) return;
      const res = await fetch(`/api/prefs?user_id=${user.user_id}`);
      const data = await res.json();
      if (data.prefs && Object.keys(data.prefs).length > 0) localStorage.setItem(PREFERENCES_KEY, JSON.stringify(data.prefs));
    } catch {}
  }

  static setFontSize(size: FontSize): void {
    this.update({ fontSize: size });
    document.documentElement.style.setProperty('--base-font-size', fontSizes[size]);
  }

  static setTheme(theme: ThemeMode): void {
    this.update({ theme });
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  static setSoundEnabled(enabled: boolean): void { this.update({ soundEnabled: enabled }); }
  static setSkillNewChat(enabled: boolean): void { this.update({ skillNewChat: enabled }); }

  static saveDraft(sessionId: string, text: string): void {
    const prefs = readPrefs();
    prefs.drafts[sessionId] = text;
    this.update({ drafts: prefs.drafts });
  }
  static getDraft(sessionId: string): string { return readPrefs().drafts[sessionId] || ''; }
  static clearDraft(sessionId: string): void {
    const prefs = readPrefs();
    delete prefs.drafts[sessionId];
    this.update({ drafts: prefs.drafts });
  }

  static playNotificationSound(): void {
    const prefs = readPrefs();
    if (!prefs.soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 800; osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }
}
