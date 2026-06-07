// ===== MAIN JAVASCRIPT =====

// ===== CONFIGURATION =====
// Set Ra Devi's birth date here (June 9th - update the year if needed)
const BIRTH_DATE = new Date(1999, 5, 9); // June 9, 1999 (month is 0-indexed)
const BIRTH_DAY = 9;
const BIRTH_MONTH = 5; // 0-indexed (5 = June)

// ===== STEP FLOW =====
let ageTrackerInterval = null;
let isTransitioning = false;

// ===== FLOATING PARTICLES =====
function createParticles() {
  const bg = document.getElementById('particlesBg');
  if (!bg) return;

  const colors = ['#e8a0b4', '#c75b7a', '#d4a574', '#d4c4e8', '#f0d080', '#f8d0db'];

  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    const size = Math.random() * 8 + 3;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 15;

    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.background = color;
    particle.style.left = left + '%';
    particle.style.animationDuration = duration + 's';
    particle.style.animationDelay = delay + 's';

    bg.appendChild(particle);
  }
}

// ===== CONFETTI =====
function launchConfetti(count = 100) {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  const colors = ['#e8a0b4', '#c75b7a', '#d4a574', '#d4c4e8', '#f0d080', '#ff6b6b', '#ffd93d', '#ff8a5c'];

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';

    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const duration = Math.random() * 3 + 2;
    const delay = Math.random() * 2;
    const size = Math.random() * 8 + 6;
    const rotation = Math.random() * 360;

    confetti.style.left = left + '%';
    confetti.style.background = color;
    confetti.style.width = size + 'px';
    confetti.style.height = size * 1.4 + 'px';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    confetti.style.animationDuration = duration + 's';
    confetti.style.animationDelay = delay + 's';
    confetti.style.transform = 'rotate(' + rotation + 'deg)';

    container.appendChild(confetti);
  }

  setTimeout(function() {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }, 5000);
}

// ===== SPARKLE & HEART EFFECTS =====
function createSparkle(x, y) {
  for (let i = 0; i < 8; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';

    const angle = (i / 8) * Math.PI * 2;
    const distance = Math.random() * 40 + 20;

    sparkle.style.left = (x + Math.cos(angle) * distance) + 'px';
    sparkle.style.top = (y + Math.sin(angle) * distance) + 'px';
    sparkle.style.background = ['#f0d080', '#ffeb3b', '#ffc0cb', '#ffffff'][Math.floor(Math.random() * 4)];
    sparkle.style.width = sparkle.style.height = (Math.random() * 4 + 2) + 'px';

    document.body.appendChild(sparkle);

    setTimeout(function() {
      if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
    }, 1000);
  }
}

function createFloatingHeart(x, y) {
  const heart = document.createElement('div');
  heart.className = 'heart-float';
  heart.innerHTML = ['💕', '💖', '💗', '🌹', '🌸', '✨'][Math.floor(Math.random() * 6)];
  heart.style.left = x + 'px';
  heart.style.top = y + 'px';
  heart.style.fontSize = (Math.random() * 16 + 18) + 'px';

  document.body.appendChild(heart);

  setTimeout(function() {
    if (heart.parentNode) heart.parentNode.removeChild(heart);
  }, 4000);
}

// ===== STORY STEP TRANSITIONS =====
function showStep(stepId) {
  document.querySelectorAll('.story-step').forEach(function(step) {
    step.classList.remove('active', 'exit');
  });

  const step = document.getElementById(stepId);
  if (step) {
    step.classList.add('active');
  }

  // Scroll to top of the step smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToStep(stepId) {
  if (isTransitioning) return;
  isTransitioning = true;

  const current = document.querySelector('.story-step.active');
  if (current) {
    current.classList.add('exit');
  }

  setTimeout(function() {
    isTransitioning = false;
    // Stop age tracker if leaving the greeting step
    if (ageTrackerInterval && stepId !== 'stepGreeting') {
      clearInterval(ageTrackerInterval);
      ageTrackerInterval = null;
    }

    showStep(stepId);

    // Start age tracker when entering greeting step (this is the first 'Next' click)
    if (stepId === 'stepGreeting') {
      // Start music playback when user clicks 'Next' on the tease page
      if (typeof startMusic === 'function') {
        startMusic();
      }
      setTimeout(function() {
        updateAgeTracker();
        startAgeTracker();
        // Confetti burst for greeting
        launchConfetti(60);
      }, 500);
    }

    // Launch confetti for gallery step
    if (stepId === 'stepGallery') {
      setTimeout(function() {
        launchConfetti(40);
      }, 600);
    }

    // Launch confetti for message step
    if (stepId === 'stepMessage') {
      setTimeout(function() {
        launchConfetti(80);
      }, 600);
    }
  }, 350);
}

// ===== STEP 1: LOADING ANIMATION =====
function startLoadingSequence() {
  const bar = document.getElementById('loadingBarFill');
  const percentEl = document.getElementById('loadingPercent');
  if (!bar) return;

  bar.style.width = '0%';

  let progress = 0;
  const duration = 3000; // 3 seconds
  const interval = 30; // update every 30ms
  const step = 100 / (duration / interval);

  const loadingInterval = setInterval(function() {
    progress += step;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadingInterval);
    }
    bar.style.width = progress + '%';
    if (percentEl) percentEl.textContent = Math.round(progress) + '%';
  }, interval);

  // After loading completes, show tease message
  setTimeout(function() {
    // Confetti burst
    launchConfetti(50);
    // Sparkle burst
    for (let i = 0; i < 15; i++) {
      setTimeout(function() {
        createSparkle(
          window.innerWidth * 0.2 + Math.random() * window.innerWidth * 0.6,
          window.innerHeight * 0.3 + Math.random() * window.innerHeight * 0.4
        );
      }, i * 100);
    }
    showStep('stepTease');
  }, duration + 400);
}

// ===== STEP 3: REAL-TIME AGE TRACKER =====
function startAgeTracker() {
  if (ageTrackerInterval) clearInterval(ageTrackerInterval);
  ageTrackerInterval = setInterval(updateAgeTracker, 1000);
}

function updateAgeTracker() {
  const now = new Date();
  const diff = now - BIRTH_DATE;

  if (diff < 0) return;

  const totalSeconds = Math.floor(diff / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const years = Math.floor(totalDays / 365.25);
  const daysAfterYears = Math.floor(totalDays % 365.25);
  const months = Math.floor(daysAfterYears / 30.44);
  const days = Math.floor(daysAfterYears % 30.44);
  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;

  document.getElementById('ageYears').textContent = years;
  document.getElementById('ageMonths').textContent = months;
  document.getElementById('ageDays').textContent = days;
  document.getElementById('ageHours').textContent = String(hours).padStart(2, '0');
  document.getElementById('ageMins').textContent = String(minutes).padStart(2, '0');
  document.getElementById('ageSecs').textContent = String(seconds).padStart(2, '0');
}

// ===== STEP 4: PHOTO GALLERY =====
function createGalleryCards() {
  const grid = document.getElementById('galleryStepGrid');
  if (!grid) return;

  const photos = [
    { src: '/images/photo-1.jpg', label: 'Beautiful Moments' },
    { src: '/images/photo-2.jpg', label: 'Like a Rose' },
    { src: '/images/photo-3.jpg', label: 'Shining Bright' },
    { src: '/images/photo-4.jpg', label: 'Full of Love' },
    { src: '/images/photo-5.jpg', label: 'You are a Star' },
    { src: '/images/photo-6.jpg', label: 'Grace & Beauty' },
    { src: '/images/photo-7.jpg', label: 'Radiant Smile' },
    { src: '/images/photo-8.jpg', label: 'A True Gem' },
    { src: '/images/photo-9.jpg', label: 'Moonlight Magic' },
    { src: '/images/photo-10.jpg', label: 'Colourful Soul' },
    { src: '/images/photo-11.jpg', label: 'Precious Moments' }
  ];

  photos.forEach(function(photo, index) {
    const card = document.createElement('div');
    card.className = 'gallery-step-card';
    card.style.animation = 'fadeInUp 0.6s ease forwards';
    card.style.opacity = '0';
    card.style.animationDelay = (0.08 * index) + 's';
    card.style.overflow = 'hidden';

    // Create lightbox on click
    card.addEventListener('click', function(e) {
      const lightbox = document.getElementById('lightbox');
      const content = document.getElementById('lightboxContent');
      if (lightbox && content) {
        content.innerHTML = '<img src="' + photo.src + '" alt="' + photo.label + '" style="max-width:90vw;max-height:85vh;object-fit:contain;display:block;border-radius:16px;"><div style="position:absolute;bottom:0;left:0;right:0;padding:20px;background:linear-gradient(transparent,rgba(0,0,0,0.8));color:white;font-family:Montserrat,sans-serif;font-weight:300;text-align:center;border-radius:0 0 16px 16px;">' + photo.label + ' • Photo #' + (index + 1) + '</div>';
        lightbox.style.display = 'flex';
        lightbox.onclick = function() { lightbox.style.display = 'none'; };
      }
      
      const rect = card.getBoundingClientRect();
      createSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
      createFloatingHeart(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });

    card.innerHTML = '<img src="' + photo.src + '" alt="' + photo.label + '" onerror="this.alt=\'Photo ' + (index + 1) + '\'" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;transition:transform 0.5s ease;"><div class="card-label" style="z-index:2;">' + photo.label + '</div>';

    // Hover zoom
    card.addEventListener('mouseenter', function() {
      const img = card.querySelector('img');
      if (img) img.style.transform = 'scale(1.1)';
    });
    card.addEventListener('mouseleave', function() {
      const img = card.querySelector('img');
      if (img) img.style.transform = 'scale(1)';
    });

    grid.appendChild(card);
  });
}

// ===== PREV STEP NAVIGATION =====
var stepOrder = ['stepTease', 'stepGreeting', 'stepGallery', 'stepMessage'];

function goToPrevStep() {
  var currentStep = document.querySelector('.story-step.active');
  if (!currentStep) return;
  var currentId = currentStep.id;
  var idx = stepOrder.indexOf(currentId);
  if (idx > 0) {
    // Stop age tracker if leaving greeting step
    if (ageTrackerInterval && stepOrder[idx - 1] !== 'stepGreeting') {
      clearInterval(ageTrackerInterval);
      ageTrackerInterval = null;
    }
    showStep(stepOrder[idx - 1]);
  }
}

// ===== CURTAIN LOGIC =====
let curtainsOpen = false;

function openCurtains() {
  if (curtainsOpen) return;
  curtainsOpen = true;

  const overlay = document.getElementById('curtainOverlay');
  if (!overlay) return;

  overlay.classList.add('open');

  // Launch confetti celebration as curtains open
  setTimeout(function() {
    launchConfetti(120);

    // Create sparkles across the center
    for (let i = 0; i < 20; i++) {
      setTimeout(function() {
        createSparkle(
          window.innerWidth * 0.2 + Math.random() * window.innerWidth * 0.6,
          window.innerHeight * 0.3 + Math.random() * window.innerHeight * 0.4
        );
      }, i * 80);
    }

    // Floating hearts burst
    for (let i = 0; i < 15; i++) {
      setTimeout(function() {
        createFloatingHeart(
          window.innerWidth * 0.2 + Math.random() * window.innerWidth * 0.6,
          window.innerHeight * 0.5
        );
      }, i * 100);
    }
  }, 600);

  // Start the story sequence after curtains open (with slight delay for reveal)
  setTimeout(function() {
    startLoadingSequence();
  }, 1500);
}

// ===== VIEW SWITCHING (single-page nav) =====
let viewInitialized = {};

function switchView(viewName) {
  // Hide all views
  document.querySelectorAll('.page').forEach(function(v) {
    v.style.display = 'none';
  });
  
  // Show selected view
  // Map 'home' to 'wishPage' since the home section has that ID
  var viewId = viewName === 'home' ? 'wishPage' : 'view' + viewName.charAt(0).toUpperCase() + viewName.slice(1);
  var view = document.getElementById(viewId);
  if (view) {
    view.style.display = 'flex';
    view.classList.add('active');
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Pause/resume gallery animation based on visibility
  if (typeof setGalleryVisible === 'function') {
    setGalleryVisible(viewName === 'gallery');
  }
  
  // Initialize gallery on first visit
  if (viewName === 'gallery' && !viewInitialized.gallery) {
    viewInitialized.gallery = true;
    setTimeout(function() {
      if (typeof initThreeCarousel === 'function') initThreeCarousel();
      if (typeof createGridView === 'function') createGridView();
    }, 300);
  }
  
  // Initialize cake on first visit
  if (viewName === 'cake' && !viewInitialized.cake) {
    viewInitialized.cake = true;
    setTimeout(function() {
      if (typeof initCake === 'function') initCake();
    }, 200);
  }
}

// ===== CLICK HANDLER =====
document.addEventListener('click', function(e) {
  // Curtain opening clicks
  const openBtn = document.getElementById('openButton');
  const center = document.getElementById('curtainCenter');

  if (openBtn && (e.target === openBtn || openBtn.contains(e.target))) {
    openCurtains();
    return;
  }

  if (center && (e.target === center || center.contains(e.target)) && !curtainsOpen) {
    openCurtains();
    return;
  }

  if (e.target.closest('.curtain-panel') && !curtainsOpen) {
    openCurtains();
    return;
  }

  // Don't add effects on buttons
  if (e.target.closest('.back-btn') || e.target.closest('.carousel-btn') ||
      e.target.closest('.toggle-btn') || e.target.closest('.next-btn') ||
      e.target.closest('.final-btn') || e.target.closest('.gallery-step-card')) return;

  // Create random effects on click
  if (curtainsOpen && Math.random() > 0.4) {
    if (Math.random() > 0.5) {
      createSparkle(e.clientX, e.clientY);
    } else {
      createFloatingHeart(e.clientX, e.clientY);
    }
  }
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  createParticles();
  createGalleryCards();

  // Initial state: show nothing behind curtains yet
  // The curtains cover everything; after opening, loading sequence starts
});
