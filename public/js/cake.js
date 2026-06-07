// ===== CAKE CUTTING JAVASCRIPT =====

let cakeInitialized = false;
let cakeCut = false;

// Add cake celebration keyframe
(function() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cakeCelebrate {
      0% { transform: scale(1); }
      30% { transform: scale(1.05) rotate(-1deg); }
      60% { transform: scale(1.08) rotate(1deg); }
      100% { transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);
})();

function initCake() {
  if (cakeInitialized) return;
  cakeInitialized = true;

  const cakeScene = document.getElementById('cakeScene');
  const cakeInstruction = document.getElementById('cakeInstruction');
  const cakeMessage = document.getElementById('cakeMessage');
  const galleryBtn = document.getElementById('galleryBtn');

  if (!cakeScene) return;

  cakeScene.addEventListener('click', function(e) {
    if (cakeCut) return;

    // Cut the cake!
    cakeCut = true;
    cakeScene.classList.add('cut');
    cakeInstruction.textContent = '🎉 The cake is cut! Make a wish! ✨';
    cakeInstruction.style.animation = 'none';
    cakeInstruction.style.opacity = '1';

    // Show the birthday message
    cakeMessage.style.display = 'block';

    // Show the gallery button
    if (galleryBtn) {
      galleryBtn.style.display = 'inline-block';
      setTimeout(() => {
        galleryBtn.style.opacity = '1';
        galleryBtn.style.transform = 'translateY(0)';
      }, 300);
    }

    // Launch confetti!
    if (typeof launchConfetti === 'function') {
      launchConfetti(150);
      
      // Confetti burst from the cake position
      const rect = cakeScene.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          if (typeof createSparkle === 'function') {
            createSparkle(
              cx + (Math.random() - 0.5) * 200,
              cy + (Math.random() - 0.5) * 100
            );
          }
          if (typeof createFloatingHeart === 'function') {
            createFloatingHeart(
              cx + (Math.random() - 0.5) * 300,
              cy - 50
            );
          }
        }, i * 500);
      }
    }

    // Play a small celebration animation
    cakeScene.style.animation = 'cakeCelebrate 0.6s ease';
    setTimeout(() => {
      cakeScene.style.animation = '';
    }, 600);
  });

  // Auto-cut animation hint
  setTimeout(() => {
    if (!cakeCut) {
      cakeInstruction.style.animation = 'pulse 2s ease-in-out infinite';
    }
  }, 1000);
}

// Auto-init on DOMContentLoaded for standalone page
document.addEventListener('DOMContentLoaded', function() {
  const cakeScene = document.getElementById('cakeScene');
  if (cakeScene && cakeScene.offsetParent !== null) {
    initCake();
  }
});
