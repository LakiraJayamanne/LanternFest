document.querySelectorAll('.artist-card').forEach(card => {
  const artist = card.dataset.artist;
  const audio = new Audio(`music/${artist}/preview.mp3`);
  audio.volume = 0.5;

  card.addEventListener('mouseenter', () => {
    audio.currentTime = 0;
    audio.play();
  });

  card.addEventListener('mouseleave', () => {
    audio.pause();
    audio.currentTime = 0;
  });

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    card.style.transform = `rotateY(${x / 10}deg) rotateX(${-y / 10}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = `rotateY(0deg) rotateX(0deg)`;
  });
});

// Soft spotlight that follows the cursor on the lineup page
const lineupSpotlight = document.querySelector('.lineup-spotlight');
if (lineupSpotlight) {
  const updateSpotlight = (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    lineupSpotlight.style.setProperty('--spot-x', `${x}%`);
    lineupSpotlight.style.setProperty('--spot-y', `${y}%`);
  };
  window.addEventListener('pointermove', updateSpotlight);
}
