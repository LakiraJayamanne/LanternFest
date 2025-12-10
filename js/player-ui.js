window.addEventListener('DOMContentLoaded', () => {
  if (window !== window.top) return;

  // If this is the intro page, do not render a visible player here.
  const modal = document.getElementById('introPlayerModal');
  if (modal) return; // intro page — bail out, player UI removed from intro

  // Only show the floating player on the home page (index). Bail out elsewhere.
  const path = (window.location.pathname || '').toLowerCase();
  const isHome = path.endsWith('/') || path.endsWith('/index.html') || path === '';
  if (!isHome) return;

  // Otherwise, inject a floating player UI into the page (home/other pages)
  const playerWrap = document.createElement('div');
  playerWrap.className = 'player-ui';
  playerWrap.setAttribute('aria-hidden', 'false');
  playerWrap.innerHTML = `
    <button id="playerPrev" class="ctrl">⏮</button>
    <button id="playerPlay" class="ctrl">▶</button>
    <button id="playerNext" class="ctrl">⏭</button>
    <button id="playerMute" class="ctrl">🔊</button>
    <span id="playerTrack" style="margin-left:8px; font-weight:600; display:none;"></span>
  `;
  document.body.appendChild(playerWrap);

  const prev = document.getElementById('playerPrev');
  const play = document.getElementById('playerPlay');
  const next = document.getElementById('playerNext');
  const mute = document.getElementById('playerMute');
  const track = document.getElementById('playerTrack');

  function refresh() {
    try {
      if (!window.AudioManager) {
        if (play) play.textContent = '▶';
        if (mute) mute.textContent = '🔊';
        if (track) track.textContent = '';
        return;
      }
      if (play) play.textContent = AudioManager.isPlaying() ? '⏸' : '▶';
      if (mute) mute.textContent = AudioManager.isMuted() ? '🔇' : '🔊';
      try { if (track) track.textContent = ''; } catch(e) { if (track) track.textContent = ''; }
    } catch (e) {}
  }

  prev && prev.addEventListener('click', () => { try { AudioManager.init(); AudioManager.prev(); refresh(); } catch(e){} });
  next && next.addEventListener('click', () => { try { AudioManager.init(); AudioManager.next(); refresh(); } catch(e){} });
  mute && mute.addEventListener('click', () => { try { if (!AudioManager) return; AudioManager.toggleMute(); refresh(); } catch(e){} });

  play && play.addEventListener('click', async () => {
    try {
      if (!window.AudioManager) return;
      AudioManager.init();
      if (AudioManager.isPlaying && AudioManager.isPlaying()) {
        AudioManager.pause();
      } else {
        await AudioManager.play().catch(err => console.warn('Play failed', err));
      }
      refresh();
    } catch (e) { console.warn(e); }
  });

  refresh();
  setInterval(refresh, 600);
});
