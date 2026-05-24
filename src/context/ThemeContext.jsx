import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const DEFAULT_THEME = {
  brandName: 'NEXUS',
  brandTagline: '/ software.lab',
  bg0: '#04070f',
  bg1: '#080d1a',
  bg2: '#0d142a',
  accentCyan: '#00f0ff',
  accentBlue: '#3a8dff',
  accentViolet: '#b537ff',
  accentMagenta: '#ff2bd1',
  accentGreen: '#39ff14',
  accentAmber: '#ffb627',
  text0: '#eaf2ff',
  text1: '#b6c4dd',
  text2: '#6b7a9b',
  gradPrimaryFrom: '#00f0ff',
  gradPrimaryTo: '#b537ff',
  showScanLines: true,
  showGridOverlay: true,
  showOrbs: true,
  showGlow: true,
  fontDisplay: 'Space Grotesk',
  fontMono: 'JetBrains Mono',
};

function hexToRgba(hex, alpha) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return `rgba(0,240,255,${alpha})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export function applyTheme(t) {
  if (typeof document === 'undefined' || !t) return;
  const r = document.documentElement;
  // Background levels
  r.style.setProperty('--bg-0', t.bg0);
  r.style.setProperty('--bg-1', t.bg1);
  r.style.setProperty('--bg-2', t.bg2);
  // Accents
  r.style.setProperty('--neon-cyan', t.accentCyan);
  r.style.setProperty('--neon-blue', t.accentBlue);
  r.style.setProperty('--neon-violet', t.accentViolet);
  r.style.setProperty('--neon-magenta', t.accentMagenta);
  r.style.setProperty('--neon-green', t.accentGreen);
  r.style.setProperty('--neon-amber', t.accentAmber);
  // Text
  r.style.setProperty('--text-0', t.text0);
  r.style.setProperty('--text-1', t.text1);
  r.style.setProperty('--text-2', t.text2);
  // Gradients
  r.style.setProperty('--grad-primary', `linear-gradient(135deg, ${t.gradPrimaryFrom} 0%, ${t.gradPrimaryTo} 100%)`);
  r.style.setProperty('--grad-cool', `linear-gradient(135deg, ${t.accentBlue} 0%, ${t.accentCyan} 100%)`);
  r.style.setProperty('--grad-warm', `linear-gradient(135deg, ${t.accentMagenta} 0%, ${t.accentAmber} 100%)`);
  r.style.setProperty('--grad-text', `linear-gradient(135deg, ${t.text0} 0%, ${t.accentCyan} 50%, ${t.accentViolet} 100%)`);
  // Glows derived from accents
  r.style.setProperty('--glow-cyan', `0 0 18px ${hexToRgba(t.accentCyan, 0.55)}, 0 0 60px ${hexToRgba(t.accentCyan, 0.18)}`);
  r.style.setProperty('--glow-violet', `0 0 18px ${hexToRgba(t.accentViolet, 0.55)}, 0 0 60px ${hexToRgba(t.accentViolet, 0.18)}`);
  // Fonts
  r.style.setProperty('--font-display', `'${t.fontDisplay}', 'Inter', system-ui, sans-serif`);
  r.style.setProperty('--font-mono', `'${t.fontMono}', ui-monospace, monospace`);
  // Effect toggles via body classes
  const body = document.body;
  body.classList.toggle('theme-no-scan', !t.showScanLines);
  body.classList.toggle('theme-no-grid', !t.showGridOverlay);
  body.classList.toggle('theme-no-orbs', !t.showOrbs);
  body.classList.toggle('theme-no-glow', !t.showGlow);
}

const Ctx = createContext({ theme: DEFAULT_THEME, loading: true, refresh: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const { data } = await api.get('/api/theme');
      const merged = { ...DEFAULT_THEME, ...data };
      setTheme(merged);
      applyTheme(merged);
    } catch {
      applyTheme(DEFAULT_THEME);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyTheme(DEFAULT_THEME);
    refresh();
  }, []);

  return <Ctx.Provider value={{ theme, loading, refresh }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}

export { DEFAULT_THEME };
