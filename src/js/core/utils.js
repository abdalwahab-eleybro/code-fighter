// Utility Functions
export function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
export function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
export function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
export function formatTime(ms) { const sec = Math.floor(ms / 1000); const min = Math.floor(sec / 60); return min > 0 ? `${min}:${(sec % 60).toString().padStart(2, '0')}` : `${sec}s`; }
export function createElement(tag, opts = {}) { const el = document.createElement(tag); if (opts.className) el.className = opts.className; if (opts.text) el.textContent = opts.text; if (opts.html) el.innerHTML = opts.html; if (opts.onClick) el.addEventListener('click', opts.onClick); return el; }
