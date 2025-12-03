// visualizer.js
// Creates a mirrored bar visualizer that attaches to the audio element
// exposed by AudioManager (AudioManager.getAudioElement()).
(function(){
  let canvas, ctx, analyser, source, audioCtx, rafId;
  const dpr = window.devicePixelRatio || 1;
  let statusBadge = null;

  function createCanvas(){
    canvas = document.createElement('canvas');
    canvas.className = 'visualizer-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    createStatusBadge();
  }

  function createStatusBadge(){
    try{
      statusBadge = document.createElement('div');
      statusBadge.style.position = 'fixed';
      statusBadge.style.right = '12px';
      statusBadge.style.bottom = '12px';
      statusBadge.style.padding = '6px 10px';
      statusBadge.style.background = 'rgba(0,0,0,0.6)';
      statusBadge.style.color = '#fff';
      statusBadge.style.fontSize = '12px';
      statusBadge.style.borderRadius = '8px';
      statusBadge.style.zIndex = 9999;
      statusBadge.style.pointerEvents = 'none';
      statusBadge.textContent = 'Visualizer: initializing';
      document.body.appendChild(statusBadge);
    }catch(e){ console.warn('Status badge failed', e); }
  }

  function setStatus(msg){ if(statusBadge) statusBadge.textContent = 'Visualizer: '+msg; console.info('Visualizer status:', msg); }

  function resize(){
    if(!canvas) return;
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  // visualizer relies on AudioManager to provide a shared analyser node.
  function setupFromAudioManager(){
    try{
      setStatus('searching for AudioManager');
      // prefer local AudioManager, fall back to parent (useful when site content is loaded in an iframe)
      let manager = null;
      try { if(typeof window.AudioManager !== 'undefined') manager = window.AudioManager; } catch(e){}
      if(!manager){ try { if(window.parent && window.parent !== window && window.parent.AudioManager) manager = window.parent.AudioManager; } catch(e){}
      }
      if(!manager){ setStatus('no AudioManager found'); return false; }
      setStatus('found AudioManager, requesting analyser');
      if(typeof manager.getAnalyser !== 'function'){ setStatus('AudioManager has no analyser'); return false; }
      analyser = manager.getAnalyser();
      // if AudioManager has no analyser yet, wait
      if(!analyser){ setStatus('waiting for analyser'); return false; }
      // get audio context to resume if needed
      try { audioCtx = (typeof manager.getAudioContext === 'function') ? manager.getAudioContext() : null; } catch(e){ audioCtx = null; }
      setStatus('connected (' + (manager === window.AudioManager ? 'window' : 'parent') + ')');
      console.info('Visualizer: connected to AudioManager analyser (via', manager === window.AudioManager ? 'window' : 'parent', ')');
      // attempt to resume context if manager provides resume helper
      try { if(typeof manager.resumeContext === 'function') manager.resumeContext(); } catch(e){}
      return true;
    }catch(e){
      console.warn('Visualizer setup failed (manager)', e);
      setStatus('setup error');
      return false;
    }
  }

  function draw(){
    if(!analyser) return;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0,0,w,h);

    // do not draw an opaque background (keep canvas transparent)
    // visual elements only — so underlying page remains visible

    const bufferLength = analyser.frequencyBinCount;
    const data = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(data);

    const barCount = Math.min(128, Math.floor(w / 6));
    const step = Math.floor(bufferLength / barCount);
    const centerY = h/2;
    const barWidth = Math.max(2, w / (barCount*1.5));

    // color (allow alpha for subtlety)
    const color = (getComputedStyle(document.documentElement).getPropertyValue('--visualizer-color') || '#4bd08e').trim();
    for(let i=0;i<barCount;i++){
      const value = data[i*step] / 255;
      const barH = value * (h * 0.36);
      const x = (i * (barWidth + 2)) + 30;
      // softer gradient with alpha so bars are translucent
      const grad = ctx.createLinearGradient(0, centerY - barH, 0, centerY + barH);
      grad.addColorStop(0, hexToRgba(color, 0.9));
      grad.addColorStop(1, 'rgba(255,255,255,0.06)');
      ctx.fillStyle = grad;
      // draw top half
      ctx.fillRect(x, centerY - barH, barWidth, barH);
      // draw bottom mirrored
      ctx.fillRect(x, centerY, barWidth, barH);
    }

    rafId = requestAnimationFrame(draw);
  }

  function start(){
    if(!canvas) createCanvas();

    // Wait for AudioManager and its audio element
    const attempt = () => {
      if(setupFromAudioManager()){
        // try to resume audio context if suspended
        try { if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{}); } catch(e){}
        cancelPoll();
        draw();
        return;
      }
      // keep polling until analyser exists
      pollTimer = setTimeout(attempt, 300);
    };
    attempt();
  }

  let pollTimer = null;
  function cancelPoll(){ if(pollTimer) { clearTimeout(pollTimer); pollTimer = null; } }

  function stop(){
    if(rafId) cancelAnimationFrame(rafId);
    if(audioCtx) try{ audioCtx.close(); }catch(e){}
    if(canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    window.removeEventListener('resize', resize);
  }

  if(document.readyState === 'complete' || document.readyState === 'interactive') start();
  else window.addEventListener('DOMContentLoaded', start);

  // expose for debugging
  window.__MusicFest25Visualizer = { start, stop };
})();

// helper to convert hex to rgba string
function hexToRgba(hex, a){
  if(!hex) return `rgba(75,208,142,${a})`;
  hex = hex.replace('#','');
  if(hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
  const r = parseInt(hex.substring(0,2),16);
  const g = parseInt(hex.substring(2,4),16);
  const b = parseInt(hex.substring(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}
