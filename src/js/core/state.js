// State Management
import { GAME_CONFIG, PATTERNS, TIERS } from '../config/game.js';
import { FIGHTERS } from '../data/fighters.js';

const STORAGE_KEY = 'codefighter_profile_v1';
const SCHEMA_VERSION = 1;

function defaultProfile() { return { version: SCHEMA_VERSION, xp: 0, playerLevel: 1, coins: 50, unlockedFighters: ['ninja'], equippedFighter: 'ninja', achievements: {}, campaignLevels: {}, currentCampaignLevel: 'p1-easy', questionHistory: {}, patternStats: {}, streak: { current: 0, best: 0, lastPlayedDate: null, freezesLeft: 1 }, upgrades: { maxHP: 0, baseDamage: 0, freeHints: 0, comboShield: false, rerolls: 0 }, settings: { musicVolume: 0.4, sfxVolume: 0.7 } }; }

function load() { try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return null; const parsed = JSON.parse(raw); if (parsed.version !== SCHEMA_VERSION) return migrate(parsed); return parsed; } catch { return null; } }

function migrate(old) { return { ...defaultProfile(), ...old, version: SCHEMA_VERSION }; }

function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch (e) { console.warn('Save failed:', e); } }

const profile = load() || defaultProfile();
const session = { mode: 'campaign', campaignLevel: null, enemyArchetype: 'bot', questionsRemaining: 0, combo: 0, correct: 0, answered: 0, hintsUsed: 0, perfectAnswers: 0, maxCombo: 0, playerHP: 100, enemyHP: 100, enemyMaxHP: 100, roundLog: [], questionStartTime: 0 };

function resetSession(overrides = {}) { Object.assign(session, { mode: 'campaign', campaignLevel: null, enemyArchetype: 'bot', questionsRemaining: 0, combo: 0, correct: 0, answered: 0, hintsUsed: 0, perfectAnswers: 0, maxCombo: 0, playerHP: 100, enemyHP: 100, enemyMaxHP: 100, roundLog: [], questionStartTime: 0 }, overrides); }

function resetProfile() { Object.assign(profile, defaultProfile()); save(); }

function xpForLevel(level) { if (level <= 1) return 0; return Math.round(100 * Math.pow(level - 1, 1.4)); }

function addXP(amount) { profile.xp += amount; let leveledUp = false; while (profile.xp >= xpForLevel(profile.playerLevel + 1)) { profile.playerLevel++; leveledUp = true; FIGHTERS.forEach(f => { if (f.unlockLevel === profile.playerLevel && !profile.unlockedFighters.includes(f.id)) profile.unlockedFighters.push(f.id); }); } save(); return leveledUp; }

function addCoins(amount) { profile.coins += amount; save(); }

function getFighter(id) { return FIGHTERS.find(f => f.id === id) || FIGHTERS[0]; }

function equipFighter(id) { if (!profile.unlockedFighters.includes(id)) return false; profile.equippedFighter = id; save(); return true; }

const levels = PATTERNS.flatMap((p, i) => TIERS.map((t, j) => ({ id: `${p.id}-${t.suffix}`, pattern: p.id, patternName: p.name, volume: p.volume, name: `${p.name} \u00b7 ${t.suffix.charAt(0).toUpperCase() + t.suffix.slice(1)}`, tier: t.suffix, diff: t.diff, enemy: t.enemy, questions: t.questions, reward: t.reward, order: i * 4 + j })));

function isLevelUnlocked(levelId) { const idx = levels.findIndex(l => l.id === levelId); if (idx <= 0) return true; const prev = levels[idx - 1]; return !!(profile.campaignLevels[prev.id]?.cleared); }

function completeCampaignLevel(levelId, stars) { const prev = profile.campaignLevels[levelId] || { stars: 0 }; profile.campaignLevels[levelId] = { cleared: true, stars: Math.max(prev.stars || 0, stars), bestTime: prev.bestTime || 0 }; save(); }

function getLevel(levelId) { return levels.find(l => l.id === levelId); }
function getLevelIndex(levelId) { return levels.findIndex(l => l.id === levelId); }
function getNextLevel(levelId) { const idx = getLevelIndex(levelId); if (idx < 0 || idx >= levels.length - 1) return null; return levels[idx + 1]; }
function getPrevLevel(levelId) { const idx = getLevelIndex(levelId); if (idx <= 0) return null; return levels[idx - 1]; }
function lockedReason(levelId) { if (isLevelUnlocked(levelId)) return null; const prev = getPrevLevel(levelId); if (!prev) return null; return `Clear "${prev.name}" first`; }

function todayISO() { return new Date().toISOString().slice(0, 10); }

function checkAndUpdateStreak() { const today = todayISO(); const last = profile.streak.lastPlayedDate; if (last === today) return false; const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10); if (last === yesterday) profile.streak.current++; else if (profile.streak.freezesLeft > 0 && last) { profile.streak.freezesLeft--; profile.streak.current++; } else profile.streak.current = 1; if (profile.streak.current > profile.streak.best) profile.streak.best = profile.streak.current; profile.streak.lastPlayedDate = today; save(); return true; }

export default { profile, session, levels, load, save, resetProfile, resetSession, xpForLevel, addXP, addCoins, getFighter, equipFighter, isLevelUnlocked, completeCampaignLevel, getLevel, getLevelIndex, getNextLevel, getPrevLevel, lockedReason, todayISO, checkAndUpdateStreak, GAME_CONFIG, FIGHTERS, PATTERNS, TIERS };
