// Game Configuration
export const GAME_CONFIG = {
  session: { mode: 'campaign', questionsRemaining: 0, combo: 0, correct: 0, answered: 0, hintsUsed: 0, perfectAnswers: 0, maxCombo: 0, playerHP: 100, enemyHP: 100, enemyMaxHP: 100, roundLog: [], questionStartTime: 0 },
  xp: { curve: '100 * Math.pow(level - 1, 1.4)', accuracyBonus: { threshold: 0.6, multiplier: 0.05 }, perfectAnswerBonus: 5, starBonuses: { '3': 1.2, '2': 1.1 }, bossBonus: 100, repeatClearMultiplier: 0.25 },
  stars: { perfect: 1.0, great: 0.8, good: 0.0 },
  difficulty: {
    easy: { diff: 1, enemy: 'bot', questions: 5, reward: { xp: 50, coins: 20 } },
    medium: { diff: 2, enemy: 'bot', questions: 6, reward: { xp: 80, coins: 30 } },
    hard: { diff: 3, enemy: 'ghost', questions: 7, reward: { xp: 120, coins: 45 } },
    boss: { diff: 3, enemy: 'boss', questions: 8, reward: { xp: 200, coins: 100 } }
  },
  profile: { version: 1, xp: 0, playerLevel: 1, coins: 50, unlockedFighters: ['ninja'], equippedFighter: 'ninja', achievements: {}, campaignLevels: {}, currentCampaignLevel: 'p1-easy', questionHistory: {}, patternStats: {}, streak: { current: 0, best: 0, lastPlayedDate: null, freezesLeft: 1 }, upgrades: { maxHP: 0, baseDamage: 0, freeHints: 0, comboShield: false, rerolls: 0 }, settings: { musicVolume: 0.4, sfxVolume: 0.7 } },
  storage: { profile: 'codefighter_profile_v1', schemaVersion: 1 }
};

export const PATTERNS = [
  { id: 'p1', name: 'Converging', volume: 1 }, { id: 'p2', name: 'Read-Write', volume: 1 },
  { id: 'p3', name: 'Backwards Write', volume: 1 }, { id: 'p4', name: 'Sliding Window', volume: 1 },
  { id: 'p5', name: 'Two-Array Merge', volume: 1 }, { id: 'p6', name: 'Prefix Sum', volume: 1 },
  { id: 'p7', name: 'Kadane', volume: 1 }, { id: 'guard', name: 'Guarded Skipping', volume: 1 },
  { id: 'x1', name: 'Three Pointers', volume: 1 }, { id: 'x2', name: 'Outward Expansion', volume: 1 },
  { id: 'x5', name: 'Exactly-K Trick', volume: 1 }, { id: 'x7', name: 'Reversals', volume: 1 },
  { id: 'x8', name: 'Prefix + Hash', volume: 1 }
];

export const TIERS = [
  { suffix: 'easy', diff: 1, enemy: 'bot', questions: 5, reward: { xp: 50, coins: 20 } },
  { suffix: 'medium', diff: 2, enemy: 'bot', questions: 6, reward: { xp: 80, coins: 30 } },
  { suffix: 'hard', diff: 3, enemy: 'ghost', questions: 7, reward: { xp: 120, coins: 45 } },
  { suffix: 'boss', diff: 3, enemy: 'boss', questions: 8, reward: { xp: 200, coins: 100 } }
];

export const PATTERN_VOLUMES = { 1: 'Arrays & Strings', 2: 'Binary Search & Ranges', 3: 'Hash, Stack, Heap', 4: 'Linked Lists, Trees & Tries', 5: 'Graphs & Grids', 6: 'Dynamic Programming', 7: 'Recursion, Greedy, Bits & Math' };
