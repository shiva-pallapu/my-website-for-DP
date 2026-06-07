// ===== MUSIC PLAYER =====
// Uses YouTube IFrame Player API to play the song

const YOUTUBE_VIDEO_ID = 'mCVS6KwCei4';
let player = null;
let isMusicPlaying = false;
let musicPlayerReady = false;
let userInteracted = false;

// Load YouTube IFrame API
function loadYouTubeAPI() {
  if (window.YT) {
    onYouTubeReady();
    return;
  }
  
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode.insertBefore(tag, firstScript);
}

window.onYouTubeIframeAPIReady = function() {
  onYouTubeReady();
};

function onYouTubeReady() {
  player = new YT.Player('youtubePlayer', {
    videoId: YOUTUBE_VIDEO_ID,
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      loop: 1,
      playlist: YOUTUBE_VIDEO_ID,
      modestbranding: 1,
      rel: 0,
      showinfo: 0
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

function onPlayerReady() {
  musicPlayerReady = true;
  player.setVolume(50);
  
  // Update button state
  updateMusicButton();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    isMusicPlaying = true;
  } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
    isMusicPlaying = false;
  }
  updateMusicButton();
}

function toggleMusic() {
  if (!musicPlayerReady || !player) return;
  
  if (isMusicPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function updateMusicButton() {
  const btn = document.getElementById('musicToggleBtn');
  if (!btn) return;
  
  if (isMusicPlaying) {
    btn.innerHTML = '<span class="music-icon">🎵</span><span class="music-label">Music On</span>';
    btn.classList.add('playing');
  } else {
    btn.innerHTML = '<span class="music-icon">🎶</span><span class="music-label">Play Music</span>';
    btn.classList.remove('playing');
  }
}

// Start music playback with retry until player is ready (max 30 tries = ~9 seconds)
function startMusic() {
  if (userInteracted) return;
  userInteracted = true;
  
  function tryPlay(attempts) {
    if (attempts > 30) return;
    if (musicPlayerReady && player) {
      player.playVideo();
    } else {
      setTimeout(function() { tryPlay(attempts + 1); }, 300);
    }
  }
  tryPlay(0);
}

// Auto-start music on first user interaction (fallback for standalone pages like gallery.html / cake.html)
function initMusicOnInteraction() {
  if (userInteracted) return;
  
  const onFirstClick = function(e) {
    if (e.target && e.target.closest && e.target.closest('#musicToggleBtn')) return;
    
    // On the main page (index.html) with curtains, the 'Next' button starts music via startMusic().
    // Don't start music here on the OPEN click — wait for the 'Next' click instead.
    if (document.getElementById('curtainOverlay')) {
      // This is the main page — just remove the listener, music starts from goToStep
      document.removeEventListener('click', onFirstClick);
      document.removeEventListener('touchstart', onFirstClick);
      return;
    }
    
    // On standalone pages (gallery.html, cake.html) — start music on first click
    startMusic();
    document.removeEventListener('click', onFirstClick);
    document.removeEventListener('touchstart', onFirstClick);
  };
  
  document.addEventListener('click', onFirstClick);
  document.addEventListener('touchstart', onFirstClick);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  loadYouTubeAPI();
  initMusicOnInteraction();
});
