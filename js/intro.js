window.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.play-btn');

  btn.addEventListener('click', async (e) => {
    e.preventDefault();

    // Do NOT initialize or start audio here. The music must be controlled only
    // by the visible player UI. This click only transitions to the main content.

    // Replace intro content with a persistent content iframe (shell) so audio keeps playing.
    const introContent = document.querySelector('.intro-content');
    if (introContent) introContent.style.display = 'none';
    const spotlight = document.querySelector('.spotlight-overlay');
    if (spotlight) spotlight.style.display = 'none';

    const content = document.createElement('iframe');
    content.id = 'contentFrame';
    content.name = 'contentFrame';
    content.src = 'index.html';
    content.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;border:0;';
    document.body.appendChild(content);
    // Inject a persistent floating player UI into the parent (this document)
    // so controls are available while the content iframe is visible.
    try {
      const existing = document.getElementById('persistentPlayer');
      if (!existing) {
        const playerWrap = document.createElement('div');
        playerWrap.id = 'persistentPlayer';
        playerWrap.className = 'player-ui';
        playerWrap.innerHTML = `
          <button id="playerPrev" class="ctrl">⏮</button>
          <button id="playerPlay" class="ctrl">▶</button>
          <button id="playerNext" class="ctrl">⏭</button>
          <button id="playerMute" class="ctrl">🔊</button>
          <span id="playerTrack" style="margin-left:8px; font-weight:600"></span>
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
            try { if (track && AudioManager.getCurrentTitle) track.textContent = AudioManager.getCurrentTitle(); } catch(e) { if (track) track.textContent = ''; }
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
      }
    } catch(e) { console.warn('Player injection failed', e); }

    // After the content is loaded/visible, clear the muffling so the main site plays normally.
    setTimeout(() => {
      try { if (window.AudioManager) AudioManager.unmute(); } catch (e) {}
    }, 400);
  });
});

document.addEventListener('mousemove', (e) => {
  document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
  document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
});
