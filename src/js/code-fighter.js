// Code Fighter Engine
import { GAME_CONFIG } from './config/game.js';
import { FIGHTERS, ENEMY_ARCHETYPES } from './data/fighters.js';
import * as Utils from './core/utils.js';
import State from './core/state.js';

window.CF = window.CF || {};
CF.State = State;
CF.Config = GAME_CONFIG;
CF.Fighters = FIGHTERS;
CF.EnemyArchetypes = ENEMY_ARCHETYPES;
CF.Utils = Utils;

class UIManager {
  constructor() { this.currentScreen = 'menu'; }
  
  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(`${name}-screen`);
    if (screen) screen.classList.add('active');
    this.currentScreen = name;
    if (name === 'menu') this.updateProfileBar();
    else if (name === 'map') CF.Campaign.renderMap();
    else if (name === 'shop') CF.Shop.render();
    else if (name === 'settings') CF.Settings.render();
  }
  
  updateProfileBar() {
    const p = CF.State.profile;
    const f = CF.State.getFighter(p.equippedFighter);
    let html = `<div class="profile-bar">
      <div class="prof-item"><span class="icon">&#128200;</span><span class="val">${p.playerLevel}</span><span class="lbl">Level</span></div>
      <div class="prof-item"><span class="icon">&#128176;</span><span class="val">${p.xp}</span><span class="lbl">XP</span></div>
      <div class="prof-item"><span class="icon">&#128172;</span><span class="val">${p.coins}</span><span class="lbl">Coins</span></div>
      <div class="prof-item prof-fighter">${f.icon || '&#128373;'}</div>
      <div class="prof-spacer"></div>
      <div class="prof-item"><span class="icon">&#128293;</span><span class="val">${p.streak.current}</span><span class="lbl">Streak</span></div>
      <div class="prof-item"><div class="xp-bar"><div class="xp-fill" style="width:${p.xp > 0 ? Math.min((p.xp / CF.State.xpForLevel(p.playerLevel + 1)) * 100, 100) : 0}%"></div></div></div>
    </div>`;
    document.getElementById('profile-bar').innerHTML = html;
  }
  
  showToast(msg, err = false) {
    const t = document.getElementById('shop-toast');
    if (!t) return;
    t.textContent = msg; t.className = 'shop-toast' + (err ? ' error' : '');
    setTimeout(() => t.classList.add('show'), 10);
    setTimeout(() => t.classList.remove('show'), 2000);
  }
  
  startFight(levelId) { CF.Campaign.startLevel(levelId); }
  continueFromRecap() { const next = CF.Campaign.getNextLevel(CF.State.session.campaignLevel); next ? CF.Campaign.startLevel(next.id) : this.showScreen('map'); }
  retryFromRecap() { CF.Campaign.startLevel(CF.State.session.campaignLevel); }
}

class CampaignManager {
  constructor() { this.levels = CF.State.levels; }
  
  renderMap() {
    const list = document.getElementById('level-list');
    if (!list) return;
    list.innerHTML = '';
    const byPattern = {};
    this.levels.forEach(l => { if (!byPattern[l.pattern]) byPattern[l.pattern] = []; byPattern[l.pattern].push(l); });
    Object.entries(byPattern).forEach(([pid, levels]) => {
      const p = CF.State.PATTERNS.find(x => x.id === pid);
      if (!p) return;
      const h = document.createElement('div'); h.className = 'volume-header'; h.innerHTML = `<span>&#128193; ${p.name}</span>`;
      list.appendChild(h);
      levels.forEach(l => list.appendChild(this.createLevelCard(l)));
    });
  }
  
  createLevelCard(level) {
    const card = document.createElement('div');
    card.className = 'level-card' + (level.tier === 'boss' ? ' boss' : '');
    const isUnlocked = CF.State.isLevelUnlocked(level.id);
    const isCleared = CF.State.profile.campaignLevels[level.id]?.cleared;
    const stars = CF.State.profile.campaignLevels[level.id]?.stars || 0;
    if (!isUnlocked) card.classList.add('locked');
    if (isCleared) card.classList.add('cleared');
    const locked = !isUnlocked ? CF.State.lockedReason(level.id) : null;
    const ei = CF.EnemyArchetypes[level.enemy]?.icon || '&#128374;';
    card.innerHTML = `<span class="level-icon">${ei}</span>
      <div class="level-body">
        <div class="level-name">${level.name}</div>
        <div class="level-meta">${level.questions} questions &middot; Diff: ${level.diff}/3</div>
      </div>
      <span class="level-stars">${'&#9733;'.repeat(stars)}${'&#9734;'.repeat(3 - stars)}</span>
      ${locked ? `<div class="level-locked">${locked}</div>` : ''}`;
    if (isUnlocked) card.addEventListener('click', () => this.startLevel(level.id));
    return card;
  }
  
  startLevel(levelId) {
    const level = CF.State.getLevel(levelId);
    if (!level) return;
    CF.State.resetSession({ mode: 'campaign', campaignLevel: levelId, enemyArchetype: level.enemy, questionsRemaining: level.questions, enemyHP: 100, enemyMaxHP: 100 });
    CF.UI.showScreen('fight');
    CF.Fight.startFight(level);
  }
  
  getNextLevel(levelId) { return CF.State.getNextLevel(levelId); }
}

class FightManager {
  constructor() { this.currentQuestion = null; this.timer = null; this.answerStartTime = 0; }
  
  startFight(level) {
    this.updateHUD();
    const bb = document.getElementById('boss-banner');
    if (bb) bb.style.display = level.tier === 'boss' ? 'block' : 'none';
    this.loadNextQuestion();
  }
  
  updateHUD() {
    const s = CF.State.session; const p = CF.State.profile;
    const pn = document.getElementById('fight-player-name');
    const en = document.getElementById('fight-enemy-name');
    if (pn) pn.textContent = CF.State.getFighter(p.equippedFighter).name;
    if (en) en.textContent = CF.EnemyArchetypes[s.enemyArchetype]?.name || s.enemyArchetype;
    this.updateHPBars();
  }
  
  updateHPBars() {
    const s = CF.State.session;
    const pf = document.getElementById('player-hp-fill');
    const ef = document.getElementById('enemy-hp-fill');
    if (pf) pf.style.width = `${s.playerHP}%`;
    if (ef) ef.style.width = `${(s.enemyHP / s.enemyMaxHP) * 100}%`;
  }
  
  loadNextQuestion() {
    const s = CF.State.session;
    if (s.questionsRemaining <= 0 || s.playerHP <= 0) { this.endFight(s.playerHP > 0); return; }
    if (s.enemyHP <= 0) { this.endFight(true); return; }
    s.questionsRemaining--; s.answered++;
    this.currentQuestion = this.generateQuestion();
    this.displayQuestion();
    this.startQuestionTimer();
  }
  
  generateQuestion() {
    const types = ['mcq', 'chips', 'order'];
    const type = types[Utils.randomInt(0, types.length - 1)];
    const qs = {
      mcq: { type: 'mcq', title: 'Time complexity?', prompt: 'For binary search', code: 'int x = 5;', options: [{text:'O(n)',c:false},{text:'O(log n)',c:true},{text:'O(n log n)',c:false},{text:'O(1)',c:false}] },
      chips: { type: 'chips', title: 'Select all', prompt: 'Hashing data structures', code: '', options: [{text:'HashSet',c:true},{text:'HashMap',c:true},{text:'ArrayList',c:false},{text:'HashTable',c:true}] },
      order: { type: 'order', title: 'Sort by complexity', prompt: 'Best to worst', code: '', options: [{text:'Binary Search',v:'b'},{text:'Linear Search',v:'l'},{text:'Bubble Sort',v:'bs'},{text:'Hash',v:'h'}], correctOrder: ['h','b','l','bs'] }
    };
    return qs[type];
  }
  
  displayQuestion() {
    const q = this.currentQuestion; if (!q) return;
    const s = CF.State.session; const level = CF.State.getLevel(s.campaignLevel);
    const ctr = document.getElementById('question-counter');
    if (ctr) ctr.textContent = `Q${level.questions - s.questionsRemaining + 1}/${level.questions}`;
    const title = document.getElementById('question-title');
    const prompt = document.getElementById('question-prompt');
    const code = document.getElementById('question-code');
    if (title) title.textContent = q.title;
    if (prompt) prompt.textContent = q.prompt;
    if (code) code.textContent = q.code;
    ['mcq-options','chip-options','order-options'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
    const numeric = document.getElementById('numeric-options'); if (numeric) numeric.style.display = 'none';
    switch(q.type) {
      case 'mcq': document.getElementById('mcq-options').style.display = 'flex'; this.displayMCQ(q.options); break;
      case 'chips': document.getElementById('chip-options').style.display = 'flex'; this.displayChips(q.options); break;
      case 'order': document.getElementById('order-options').style.display = 'flex'; this.displayOrder(q.options, q.correctOrder); break;
    }
    const fb = document.getElementById('fight-feedback'); if (fb) fb.textContent = '';
    const act = document.getElementById('fight-actions'); if (act) act.innerHTML = '';
  }
  
  displayMCQ(options) {
    const c = document.getElementById('mcq-options'); if (!c) return;
    c.innerHTML = ''; const letters = ['A','B','C','D'];
    options.forEach((o,i) => { const b = document.createElement('button'); b.className = 'mcq-option'; b.textContent = o.text; b.setAttribute('data-letter', letters[i]); b.onclick = () => this.selectAnswer(o.correct); c.appendChild(b); });
  }
  
  displayChips(options) {
    const c = document.getElementById('chip-options'); if (!c) return;
    c.innerHTML = '';
    options.forEach(o => { const b = document.createElement('button'); b.className = 'chip'; b.textContent = o.text; b.setAttribute('data-correct', o.correct); b.onclick = () => b.classList.toggle('selected'); c.appendChild(b); });
    const sub = document.createElement('button'); sub.className = 'btn primary'; sub.textContent = 'Submit';
    sub.onclick = () => {
      const correct = options.every(o => {
        const chip = c.querySelector(`[data-correct="${o.correct}"]`);
        return o.correct ? chip?.classList.contains('selected') : !chip?.classList.contains('selected');
      });
      this.selectAnswer(correct);
    };
    c.appendChild(sub);
  }
  
  displayOrder(options, correctOrder) {
    const c = document.getElementById('order-options'); if (!c) return;
    c.innerHTML = ''; const userOrder = [];
    options.forEach((o,i) => { const item = document.createElement('div'); item.className = 'order-item';
      const slot = document.createElement('div'); slot.className = 'order-slot'; slot.textContent = i + 1;
      const line = document.createElement('div'); line.className = 'order-line'; line.textContent = o.text;
      item.appendChild(slot); item.appendChild(line);
      item.onclick = () => {
        if (item.classList.contains('picked')) { item.classList.remove('picked'); const idx = userOrder.indexOf(o.value); if (idx > -1) userOrder.splice(idx, 1); }
        else if (userOrder.length < correctOrder.length) { item.classList.add('picked'); userOrder.push(o.value); }
        if (userOrder.length === correctOrder.length) this.selectAnswer(userOrder.every((v,i) => v === correctOrder[i]));
      };
      c.appendChild(item);
    });
  }
  
  selectAnswer(isCorrect) {
    const s = CF.State.session; this.clearTimer();
    if (isCorrect) { s.correct++; s.combo++; s.maxCombo = Math.max(s.maxCombo, s.combo); s.enemyHP = Math.max(0, s.enemyHP - (20 + s.combo * 2));
      const fb = document.getElementById('fight-feedback'); if (fb) { fb.textContent = 'Correct!'; fb.className = 'fight-feedback correct'; }
    } else { s.combo = 0; s.playerHP = Math.max(0, s.playerHP - 15);
      const fb = document.getElementById('fight-feedback'); if (fb) { fb.textContent = 'Wrong! -15 HP'; fb.className = 'fight-feedback wrong'; }
    }
    this.updateHPBars();
    const act = document.getElementById('fight-actions'); if (act) {
      act.innerHTML = ''; const b = document.createElement('button'); b.className = 'btn primary'; b.textContent = 'Next'; b.onclick = () => this.loadNextQuestion(); act.appendChild(b);
    }
  }
  
  startQuestionTimer() {
    this.clearTimer(); this.answerStartTime = Date.now();
    const t = document.getElementById('fight-timer'); if (!t) return;
    let left = 30; t.textContent = left;
    this.timer = setInterval(() => { left--; t.textContent = left; if (left <= 0) { this.clearTimer(); this.selectAnswer(false); } }, 1000);
  }
  
  clearTimer() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  
  endFight(won) {
    this.clearTimer(); const s = CF.State.session; const level = CF.State.getLevel(s.campaignLevel);
    const accuracy = s.answered > 0 ? s.correct / s.answered : 0;
    const stars = won && accuracy >= 1 ? 3 : won && accuracy >= 0.8 ? 2 : won ? 1 : 0;
    if (won) CF.State.completeCampaignLevel(s.campaignLevel, stars);
    CF.State.checkAndUpdateStreak();
    CF.UI.showScreen('recap');
    const hl = document.getElementById('recap-headline');
    const st = document.getElementById('recap-stars');
    const sb = document.getElementById('recap-subtitle');
    if (hl) { hl.textContent = won ? 'Victory!' : 'Defeat'; hl.className = 'recap-headline ' + (won ? 'win' : 'loss'); }
    if (st) st.innerHTML = '&#9733;'.repeat(stars) + '&#9734;'.repeat(3 - stars);
    if (sb) sb.textContent = won ? 'You defeated the enemy!' : 'Try again!';
    document.getElementById('recap-correct').textContent = s.correct;
    document.getElementById('recap-accuracy').textContent = `${Math.round(accuracy * 100)}%`;
    document.getElementById('recap-combo').textContent = s.maxCombo;
    document.getElementById('recap-xp-val').textContent = won ? level.reward.xp : 0;
    document.getElementById('recap-coins-val').textContent = won ? level.reward.coins : 0;
  }
}

class ShopManager {
  constructor() { this.items = [{id:'monk',name:'Monk',icon:'\ud83e\uddd8',desc:'Unlock Monk',cost:100},{id:'ronin',name:'Ronin',icon:'\u2694\ufe0f',desc:'Unlock Ronin',cost:200},{id:'mage',name:'Mage',icon:'\ud83e\uddd9',desc:'Unlock Mage',cost:300}]; }
  
  render() {
    const c = document.getElementById('shop-screen');
    if (!c || c.querySelector('.shop-header')) return;
    c.innerHTML = `<div class="shop-header"><button class="back-btn" onclick="CF.UI.showScreen('menu')">&#8592;</button><div class="shop-wallet"><span>&#128172;</span><span id="shop-coins">${CF.State.profile.coins}</span></div></div><div class="shop-grid" id="shop-grid"></div>`;
    this.renderItems();
  }
  
  renderItems() {
    const g = document.getElementById('shop-grid'); if (!g) return; g.innerHTML = '';
    this.items.forEach(i => {
      const owned = CF.State.profile.unlockedFighters.includes(i.id);
      const afford = CF.State.profile.coins >= i.cost;
      const card = document.createElement('div'); card.className = 'shop-card' + (owned ? ' owned' : '') + (!afford ? ' unaffordable' : '');
      card.innerHTML = `<span class="shop-icon">${i.icon}</span><div class="shop-body"><div class="shop-name">${i.name}${owned?'<span class="shop-owned">Owned</span>':''}</div><div class="shop-desc">${i.desc}</div></div><div class="shop-action">${owned?'<span class="owned-text">Owned</span>':`<button class="shop-buy" ${!afford?'disabled':''} onclick="CF.Shop.buy('${i.id}')">&#128172; ${i.cost}</button>`}</div>`;
      g.appendChild(card);
    });
  }
  
  buy(id) {
    const i = this.items.find(x => x.id === id); if (!i) return;
    const p = CF.State.profile; if (p.coins < i.cost) { CF.UI.showToast('Not enough coins!', true); return; }
    p.coins -= i.cost; CF.State.save();
    if (!p.unlockedFighters.includes(i.id)) { p.unlockedFighters.push(i.id); CF.State.save(); }
    CF.UI.showToast(`Purchased ${i.name}!`); this.renderItems(); CF.UI.updateProfileBar();
    document.getElementById('shop-coins').textContent = p.coins;
  }
}

class SettingsManager {
  constructor() { this.settings = CF.State.profile.settings; }
  
  render() {
    const c = document.getElementById('settings-screen');
    if (!c || c.querySelector('.settings-section')) return;
    const p = CF.State.profile;
    c.innerHTML = `<div class="settings-section"><h3 class="settings-title">Settings</h3>
      <div class="settings-row"><label>Music</label><input type="range" id="music-vol" min="0" max="1" step="0.1" value="${this.settings.musicVolume}"><span class="settings-val" id="music-val">${Math.round(this.settings.musicVolume*100)}%</span></div>
      <div class="settings-row"><label>SFX</label><input type="range" id="sfx-vol" min="0" max="1" step="0.1" value="${this.settings.sfxVolume}"><span class="settings-val" id="sfx-val">${Math.round(this.settings.sfxVolume*100)}%</span></div>
    </div><div class="settings-section"><h3 class="settings-title">Stats</h3>
      <div class="settings-stats"><div class="stat-cell"><div class="stat-cell-val">${p.playerLevel}</div><div class="stat-cell-lbl">Level</div></div>
        <div class="stat-cell"><div class="stat-cell-val">${p.xp}</div><div class="stat-cell-lbl">XP</div></div>
        <div class="stat-cell"><div class="stat-cell-val">${p.coins}</div><div class="stat-cell-lbl">Coins</div></div>
        <div class="stat-cell"><div class="stat-cell-val">${p.streak.current}</div><div class="stat-cell-lbl">Streak</div></div></div>
    </div><div class="settings-section"><button class="settings-action" onclick="CF.Settings.reset()">Reset Profile</button>
      <button class="settings-action danger" onclick="CF.Settings.clear()">Clear All Data</button>
    </div>`;
    document.getElementById('music-vol').addEventListener('input', e => { this.settings.musicVolume = parseFloat(e.target.value); document.getElementById('music-val').textContent = `${Math.round(this.settings.musicVolume*100)}%`; CF.State.save(); });
    document.getElementById('sfx-vol').addEventListener('input', e => { this.settings.sfxVolume = parseFloat(e.target.value); document.getElementById('sfx-val').textContent = `${Math.round(this.settings.sfxVolume*100)}%`; CF.State.save(); });
  }
  
  reset() { if (confirm('Reset profile?')) { Object.assign(CF.State.profile, CF.State.defaultProfile()); CF.State.profile.unlockedFighters = CF.State.profile.unlockedFighters; CF.State.save(); CF.UI.updateProfileBar(); CF.UI.showToast('Profile reset!'); } }
  clear() { if (confirm('Clear ALL data?')) { localStorage.removeItem('codefighter_profile_v1'); location.reload(); } }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  CF.UI = new UIManager();
  CF.Campaign = new CampaignManager();
  CF.Fight = new FightManager();
  CF.Shop = new ShopManager();
  CF.Settings = new SettingsManager();
  CF.UI.updateProfileBar();
  CF.State.checkAndUpdateStreak();
  
  // Render screens
  const screens = ['menu','map','fight','recap','shop','settings'];
  screens.forEach(s => { const c = document.getElementById(`${s}-screen`); if (c && !c.innerHTML.trim()) CF.UI.showScreen(s); });
  CF.UI.showScreen('menu');
});
