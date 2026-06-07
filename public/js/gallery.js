// ===== 3D GALLERY CAROUSEL JAVASCRIPT =====

// Photo data with real image files
const photoData = [
  { src: '/images/photo-1.jpg', label: 'Beautiful Moments' },
  { src: '/images/photo-2.jpg', label: 'Radiant Smile' },
  { src: '/images/photo-3.jpg', label: 'Twinkle Star' },
  { src: '/images/photo-4.jpg', label: 'Sweet Heart' },
  { src: '/images/photo-5.jpg', label: 'Tropical Bloom' },
  { src: '/images/photo-6.jpg', label: 'Butterfly Kiss' },
  { src: '/images/photo-7.jpg', label: 'Moonlit Night' },
  { src: '/images/photo-8.jpg', label: 'Shining Star' },
  { src: '/images/photo-9.jpg', label: 'Flower Garden' },
  { src: '/images/photo-10.jpg', label: 'Queen of Hearts' },
  { src: '/images/photo-11.jpg', label: 'Precious Gem' }
];

let currentIndex = 0;
let scene, camera, renderer, carouselGroup;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationVelocity = 0;
let autoRotate = true;
let autoRotateTimeout;
let carouselReady = false;
let galleryVisible = false;
let animFrameId = null;

// Initialize Three.js carousel
function initThreeCarousel() {
  const container = document.getElementById('threeCarousel');
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene setup
  scene = new THREE.Scene();

  // Camera — moved closer for larger, clearer photos
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 520);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  galleryVisible = true;
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Group for carousel items
  carouselGroup = new THREE.Group();
  scene.add(carouselGroup);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  // Add directional lights
  const light1 = new THREE.DirectionalLight(0xffffff, 0.9);
  light1.position.set(1, 1, 1);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xe8a0b4, 0.5);
  light2.position.set(-1, 0.5, -1);
  scene.add(light2);

  // Add point light for warmth
  const pointLight = new THREE.PointLight(0xf0d080, 0.4, 500);
  pointLight.position.set(0, 50, 0);
  scene.add(pointLight);

  // Add floating decorative particles around carousel
  const particleCount = 60;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  const particleSizes = new Float32Array(particleCount);
  
  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = 350 + Math.random() * 150;
    particlePos[i * 3] = Math.sin(theta) * Math.cos(phi) * r;
    particlePos[i * 3 + 1] = Math.sin(phi) * r * 0.5;
    particlePos[i * 3 + 2] = Math.cos(theta) * Math.cos(phi) * r;
    particleSizes[i] = Math.random() * 4 + 2;
  }
  
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
  
  const particleMat = new THREE.PointsMaterial({
    color: 0xe8a0b4,
    size: 0.5,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });
  
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Load textures and create carousel
  loadTexturesAndCreate();

  // Mouse/touch interaction
  renderer.domElement.addEventListener('mousedown', startDrag);
  renderer.domElement.addEventListener('mousemove', drag);
  renderer.domElement.addEventListener('mouseup', endDrag);
  renderer.domElement.addEventListener('mouseleave', endDrag);
  
  renderer.domElement.addEventListener('touchstart', startDragTouch, { passive: false });
  renderer.domElement.addEventListener('touchmove', dragTouch, { passive: false });
  renderer.domElement.addEventListener('touchend', endDrag, { passive: false });

  // Click handler for items
  renderer.domElement.addEventListener('click', onCarouselClick);

  // Window resize
  window.addEventListener('resize', onResize);

  // Start animation
  animate();
}

function loadTexturesAndCreate() {
  const container = document.getElementById('threeCarousel');
  
  // Show loading state
  const loadingEl = document.createElement('div');
  loadingEl.id = 'carouselLoading';
  loadingEl.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;z-index:10;';
  loadingEl.innerHTML = '<div style="font-size:2rem;animation:pulse 1.5s ease-in-out infinite;">💖</div><p style="color:var(--deep-rose);font-family:Montserrat,sans-serif;font-size:0.9rem;margin-top:10px;">Loading photos...</p>';
  container.appendChild(loadingEl);

  const manager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(manager);
  const textures = [];
  let loadedCount = 0;

  manager.onLoad = function() {
    // Remove loading indicator
    if (loadingEl.parentNode) loadingEl.parentNode.removeChild(loadingEl);
    carouselReady = true;
    createCarouselItems(textures);
  };

  manager.onProgress = function(url, itemsLoaded, itemsTotal) {
    // Update loading text
    const p = loadingEl.querySelector('p');
    if (p) p.textContent = `Loading photos... ${itemsLoaded}/${itemsTotal}`;
  };

  // Load all textures
  photoData.forEach((photo, index) => {
    loader.load(photo.src, function(texture) {
      textures[index] = texture;
    });
  });
}

function createCarouselItems(textures) {
  const radius = 260;
  const totalItems = photoData.length;

  photoData.forEach((photo, index) => {
    const angle = (index / totalItems) * Math.PI * 2;
    const texture = textures[index];
    
    // Create a high-resolution canvas for the polaroid-style card
    const scale = 1.5; // 1.5x resolution — balanced for sharpness & performance
    const canvas = document.createElement('canvas');
    canvas.width = 280 * scale;
    canvas.height = 360 * scale;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // White background (polaroid frame)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 280 * scale, 360 * scale);

    // Shadow border
    ctx.fillStyle = 'rgba(199, 91, 122, 0.08)';
    ctx.fillRect(8 * scale, 8 * scale, 264 * scale, 344 * scale);

    // Photo area with rounded corners clip
    const photoX = 14 * scale;
    const photoY = 14 * scale;
    const photoW = 252 * scale;
    const photoH = 252 * scale;
    const cornerRadius = 8 * scale;
    
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(photoX + cornerRadius, photoY);
    ctx.lineTo(photoX + photoW - cornerRadius, photoY);
    ctx.quadraticCurveTo(photoX + photoW, photoY, photoX + photoW, photoY + cornerRadius);
    ctx.lineTo(photoX + photoW, photoY + photoH - cornerRadius);
    ctx.quadraticCurveTo(photoX + photoW, photoY + photoH, photoX + photoW - cornerRadius, photoY + photoH);
    ctx.lineTo(photoX + cornerRadius, photoY + photoH);
    ctx.quadraticCurveTo(photoX, photoY + photoH, photoX, photoY + photoH - cornerRadius);
    ctx.lineTo(photoX, photoY + cornerRadius);
    ctx.quadraticCurveTo(photoX, photoY, photoX + cornerRadius, photoY);
    ctx.closePath();
    ctx.clip();

    // Draw the photo at high resolution
    ctx.drawImage(texture.image, photoX, photoY, photoW, photoH);
    ctx.restore();

    // Inner border around photo
    ctx.strokeStyle = 'rgba(199, 91, 122, 0.15)';
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    // Decorative hearts
    ctx.font = `${14 * scale}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(199, 91, 122, 0.2)';
    ctx.fillText('💕', 40 * scale, 284 * scale);
    ctx.fillText('💕', 240 * scale, 284 * scale);

    // Label
    ctx.font = `bold ${18 * scale}px "Montserrat", sans-serif`;
    ctx.fillStyle = '#c75b7a';
    ctx.textAlign = 'center';
    ctx.fillText(photo.label, 140 * scale, 310 * scale);

    // Number
    ctx.font = `${13 * scale}px "Montserrat", sans-serif`;
    ctx.fillStyle = '#d4a574';
    ctx.fillText(`✨ #${index + 1} ✨`, 140 * scale, 334 * scale);

    // Decorative dots
    ctx.font = `${10 * scale}px serif`;
    ctx.fillStyle = 'rgba(199, 91, 122, 0.15)';
    ctx.fillText('🌸 • 🌸 • 🌸 • 🌸 • 🌸', 140 * scale, 350 * scale);

    // Create texture from canvas
    const cardTexture = new THREE.CanvasTexture(canvas);
    cardTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    cardTexture.minFilter = THREE.LinearMipmapLinearFilter;
    cardTexture.magFilter = THREE.LinearFilter;
    cardTexture.generateMipmaps = true;
    
    // Create material
    const material = new THREE.MeshPhongMaterial({
      map: cardTexture,
      side: THREE.DoubleSide,
      shininess: 30,
      transparent: true
    });

    // Create larger geometry for more detail
    const geometry = new THREE.PlaneGeometry(160, 210);
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position in a circle
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    mesh.position.set(x, 0, z);
    mesh.rotation.y = -angle + Math.PI;
    
    // Add glow effect with a back plane
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xc75b7a,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide
    });
    const glowGeo = new THREE.PlaneGeometry(164, 214);
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.position.set(x, 0, z);
    glowMesh.rotation.y = -angle + Math.PI;
    
    // Store photo data
    mesh.userData = { index, label: photo.label, src: photo.src };
    glowMesh.userData = { isGlow: true };
    
    carouselGroup.add(mesh);
    carouselGroup.add(glowMesh);
  });

  // Update indicator now that carousel is ready
  updateIndicator();
}

function startDrag(e) {
  isDragging = true;
  autoRotate = false;
  previousMousePosition.x = e.clientX;
  previousMousePosition.y = e.clientY;
  clearTimeout(autoRotateTimeout);
}

function startDragTouch(e) {
  if (e.touches.length === 1) {
    isDragging = true;
    autoRotate = false;
    previousMousePosition.x = e.touches[0].clientX;
    previousMousePosition.y = e.touches[0].clientY;
    clearTimeout(autoRotateTimeout);
  }
}

function drag(e) {
  if (!isDragging) return;
  
  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;
  
  rotationVelocity = deltaX * 0.005;
  
  carouselGroup.rotation.y += deltaX * 0.005;
  carouselGroup.rotation.x += deltaY * 0.002;
  carouselGroup.rotation.x = Math.max(-0.3, Math.min(0.3, carouselGroup.rotation.x));
  
  previousMousePosition.x = e.clientX;
  previousMousePosition.y = e.clientY;
  
  updateIndicator();
}

function dragTouch(e) {
  if (!isDragging || e.touches.length !== 1) return;
  
  const deltaX = e.touches[0].clientX - previousMousePosition.x;
  const deltaY = e.touches[0].clientY - previousMousePosition.y;
  
  rotationVelocity = deltaX * 0.005;
  
  carouselGroup.rotation.y += deltaX * 0.005;
  carouselGroup.rotation.x += deltaY * 0.002;
  carouselGroup.rotation.x = Math.max(-0.3, Math.min(0.3, carouselGroup.rotation.x));
  
  previousMousePosition.x = e.touches[0].clientX;
  previousMousePosition.y = e.touches[0].clientY;
  
  updateIndicator();
}

function endDrag() {
  isDragging = false;
  
  // Auto rotate after 3 seconds of inactivity
  autoRotateTimeout = setTimeout(() => {
    autoRotate = true;
  }, 3000);
}

function onCarouselClick(event) {
  // Find if we clicked on a mesh
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(carouselGroup.children);
  
  for (const intersect of intersects) {
    const obj = intersect.object;
    if (obj.userData && obj.userData.index !== undefined) {
      const photo = photoData[obj.userData.index];
      showLightbox(photo, obj.userData.index);
      break;
    }
  }
}

function showLightbox(photo, index) {
  const lightbox = document.getElementById('lightbox');
  const content = document.getElementById('lightboxContent');
  
  content.innerHTML = `
    <img src="${photo.src}" alt="${photo.label}" 
      style="max-width:90vw;max-height:85vh;object-fit:contain;display:block;border-radius:16px;">
    <div style="position:absolute;bottom:0;left:0;right:0;padding:20px;background:linear-gradient(transparent,rgba(0,0,0,0.8));color:white;font-family:'Montserrat',sans-serif;font-weight:300;text-align:center;border-radius:0 0 16px 16px;">
      ${photo.label} • Photo #${index + 1}
    </div>
  `;
  
  lightbox.style.display = 'flex';
  
  lightbox.onclick = function() {
    lightbox.style.display = 'none';
  };
}

function updateIndicator() {
  if (!carouselReady || !carouselGroup) return;
  
  // Calculate current index based on rotation
  const totalItems = photoData.length;
  const anglePerItem = (Math.PI * 2) / totalItems;
  const rawIndex = (-carouselGroup.rotation.y / anglePerItem) % totalItems;
  currentIndex = Math.round(((rawIndex % totalItems) + totalItems) % totalItems);
  
  const indicator = document.getElementById('carouselIndicator');
  if (indicator) {
    indicator.textContent = `${currentIndex + 1} / ${totalItems}`;
  }
}

function rotateCarousel(direction) {
  if (!carouselReady) return;
  
  const totalItems = photoData.length;
  const anglePerItem = (Math.PI * 2) / totalItems;
  const targetAngle = carouselGroup.rotation.y + (direction * anglePerItem);
  
  // Smooth rotation
  let startAngle = carouselGroup.rotation.y;
  const duration = 500;
  const startTime = Date.now();
  
  function animateRotation() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function
    const ease = 1 - Math.pow(1 - progress, 3);
    
    carouselGroup.rotation.y = startAngle + (targetAngle - startAngle) * ease;
    
    if (progress < 1) {
      requestAnimationFrame(animateRotation);
    } else {
      updateIndicator();
    }
  }
  
  animateRotation();
  updateIndicator();
}

function onResize() {
  const container = document.getElementById('threeCarousel');
  if (!container || !renderer) return;
  
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// Control visibility for performance (pause animation when gallery is hidden)
function setGalleryVisible(visible) {
  galleryVisible = visible;
  if (visible) {
    // Resume animation loop
    animate();
  }
}

// Animation loop
function animate() {
  if (!galleryVisible) {
    animFrameId = null;
    return;
  }
  
  animFrameId = requestAnimationFrame(animate);
  
  if (!carouselReady) return;
  
  if (autoRotate && !isDragging) {
    carouselGroup.rotation.y += 0.003;
    updateIndicator();
  } else if (!isDragging && Math.abs(rotationVelocity) > 0.001) {
    carouselGroup.rotation.y += rotationVelocity;
    rotationVelocity *= 0.98;
    updateIndicator();
  }
  
  // Gentle floating animation for carousel items
  const time = Date.now() * 0.001;
  carouselGroup.children.forEach((child, i) => {
    if (!child.userData.isGlow) {
      const offset = Math.sin(time * 0.5 + i * 0.5) * 3;
      child.position.y = offset;
    }
  });
  
  renderer.render(scene, camera);
}

// Grid view creation
function createGridView() {
  const grid = document.getElementById('photoGrid');
  if (!grid) return;

  photoData.forEach((photo, index) => {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.style.animationDelay = `${index * 0.1}s`;
    card.style.overflow = 'hidden';
    card.onclick = function() {
      showLightbox(photo, index);
    };
    
    card.innerHTML = `
      <img src="${photo.src}" alt="${photo.label}" 
        onerror="this.alt='Photo ${index + 1}'"
        style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;transition:transform 0.5s ease;">
      <div class="photo-num" style="position:absolute;top:10px;right:12px;font-family:'Great Vibes',cursive;font-size:1.3rem;color:var(--warm-gold);z-index:2;text-shadow:0 1px 4px rgba(0,0,0,0.5);">#${index + 1}</div>
      <div style="position:absolute;bottom:0;left:0;right:0;padding:14px;background:linear-gradient(transparent,rgba(0,0,0,0.75));color:white;font-family:'Montserrat',sans-serif;font-size:0.85rem;text-align:center;font-weight:300;z-index:2;letter-spacing:0.5px;">${photo.label}</div>
    `;
    
    // Add hover zoom effect
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

// View toggle
function showView(view) {
  const carouselView = document.getElementById('carouselView');
  const gridView = document.getElementById('gridView');
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  
  if (view === 'carousel') {
    carouselView.style.display = 'block';
    gridView.style.display = 'none';
    toggleBtns[0].classList.add('active');
    toggleBtns[1].classList.remove('active');
    
    // Re-render Three.js on next frame
    setTimeout(() => {
      if (renderer) onResize();
    }, 100);
  } else {
    carouselView.style.display = 'none';
    gridView.style.display = 'block';
    toggleBtns[0].classList.remove('active');
    toggleBtns[1].classList.add('active');
  }
}

// Auto-init on DOMContentLoaded for standalone page (gallery.html)
document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('threeCarousel');
  if (container && container.offsetParent !== null) {
    initThreeCarousel();
    createGridView();
  }
});
