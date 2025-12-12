window.addEventListener('DOMContentLoaded', () => {
  // Only the top window gets a floating player
  if (window !== window.top) return;

  // If this is the intro page, do not render a visible player here.
  const modal = document.getElementById('introPlayerModal');
  if (modal) return;

  // Only show the floating player on the home page (index). Bail out elsewhere.
  const path = (window.location.pathname || '').toLowerCase();
  const isHome = path.endsWith('/') || path.endsWith('/index.html') || path === '';
  if (!isHome) return;

  // Inject floating player UI on home
  const playerWrap = document.createElement('div');
  playerWrap.className = 'player-ui';
  playerWrap.setAttribute('aria-hidden', 'false');
  playerWrap.innerHTML = `
    <button id="playerPrev" class="ctrl">&#9194;</button>
    <button id="playerPlay" class="ctrl">&#9654;</button>
    <button id="playerNext" class="ctrl">&#9193;</button>
    <button id="playerMute" class="ctrl">&#128266;</button>
    <span id="playerTrack" style="margin-left:8px; font-weight:600; display:none;"></span>
  `;
  document.body.appendChild(playerWrap);

  const prev = document.getElementById('playerPrev');
  const play = document.getElementById('playerPlay');
  const next = document.getElementById('playerNext');
  const mute = document.getElementById('playerMute');
  const track = document.getElementById('playerTrack');

  // Keep labels in sync with AudioManager
    function refresh() {
    try {
      if (!window.AudioManager) {
        if (play) play.textContent = '\u23F5';
        if (mute) mute.textContent = '\uD83D\uDD0A';
        if (track) track.textContent = '';
        return;
      }
      if (play) play.textContent = AudioManager.isPlaying() ? '\u23F8' : '\u23F5';
      if (mute) mute.textContent = AudioManager.isMuted() ? '\uD83D\uDD07' : '\uD83D\uDD0A';
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

