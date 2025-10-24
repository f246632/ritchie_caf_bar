/**
 * Ritchie Café & Bar - Gallery & Lightbox
 * Interactive image gallery with lightbox functionality
 */

// ============================================================================
// Gallery Lightbox
// ============================================================================

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxClose = document.querySelector('.lightbox-close');
const galleryItems = document.querySelectorAll('.gallery-item');

// Open lightbox
galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        const imageSrc = item.getAttribute('data-image');
        const caption = item.querySelector('.gallery-caption').textContent;

        openLightbox(imageSrc, caption, index);
    });
});

function openLightbox(src, caption, currentIndex) {
    lightbox.classList.add('active');
    lightboxImage.src = src;
    lightboxCaption.textContent = caption;
    lightbox.dataset.currentIndex = currentIndex;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Add keyboard navigation
    document.addEventListener('keydown', handleKeyboard);
}

// Close lightbox
function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleKeyboard);
}

if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
}

// Close on background click
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

// ============================================================================
// Keyboard Navigation
// ============================================================================

function handleKeyboard(e) {
    const currentIndex = parseInt(lightbox.dataset.currentIndex);

    switch(e.key) {
        case 'Escape':
            closeLightbox();
            break;
        case 'ArrowRight':
            navigateGallery(currentIndex + 1);
            break;
        case 'ArrowLeft':
            navigateGallery(currentIndex - 1);
            break;
    }
}

function navigateGallery(newIndex) {
    if (newIndex < 0) newIndex = galleryItems.length - 1;
    if (newIndex >= galleryItems.length) newIndex = 0;

    const item = galleryItems[newIndex];
    const imageSrc = item.getAttribute('data-image');
    const caption = item.querySelector('.gallery-caption').textContent;

    openLightbox(imageSrc, caption, newIndex);
}

// ============================================================================
// Navigation Arrows in Lightbox
// ============================================================================

// Create navigation arrows
const prevArrow = document.createElement('button');
const nextArrow = document.createElement('button');

prevArrow.innerHTML = '‹';
nextArrow.innerHTML = '›';
prevArrow.className = 'lightbox-arrow lightbox-prev';
nextArrow.className = 'lightbox-arrow lightbox-next';

Object.assign(prevArrow.style, {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '60px',
    color: 'white',
    background: 'rgba(0,0,0,0.5)',
    border: 'none',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    zIndex: '2001'
});

Object.assign(nextArrow.style, {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '60px',
    color: 'white',
    background: 'rgba(0,0,0,0.5)',
    border: 'none',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    zIndex: '2001'
});

if (lightbox) {
    lightbox.appendChild(prevArrow);
    lightbox.appendChild(nextArrow);
}

// Arrow click events
prevArrow.addEventListener('click', (e) => {
    e.stopPropagation();
    const currentIndex = parseInt(lightbox.dataset.currentIndex);
    navigateGallery(currentIndex - 1);
});

nextArrow.addEventListener('click', (e) => {
    e.stopPropagation();
    const currentIndex = parseInt(lightbox.dataset.currentIndex);
    navigateGallery(currentIndex + 1);
});

// Arrow hover effects
[prevArrow, nextArrow].forEach(arrow => {
    arrow.addEventListener('mouseenter', () => {
        arrow.style.background = 'rgba(212, 165, 116, 0.9)';
        arrow.style.transform = 'translateY(-50%) scale(1.1)';
    });

    arrow.addEventListener('mouseleave', () => {
        arrow.style.background = 'rgba(0,0,0,0.5)';
        arrow.style.transform = 'translateY(-50%) scale(1)';
    });
});

// ============================================================================
// Touch/Swipe Support for Mobile
// ============================================================================

let touchStartX = 0;
let touchEndX = 0;

if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
}

function handleSwipe() {
    const swipeThreshold = 50;
    const currentIndex = parseInt(lightbox.dataset.currentIndex);

    if (touchEndX < touchStartX - swipeThreshold) {
        // Swipe left - next image
        navigateGallery(currentIndex + 1);
    }

    if (touchEndX > touchStartX + swipeThreshold) {
        // Swipe right - previous image
        navigateGallery(currentIndex - 1);
    }
}

// ============================================================================
// Gallery Image Lazy Loading
// ============================================================================

const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target.querySelector('img');
            if (img && img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
            entry.target.classList.add('loaded');
            galleryObserver.unobserve(entry.target);
        }
    });
}, {
    rootMargin: '50px'
});

galleryItems.forEach(item => {
    galleryObserver.observe(item);
});

// ============================================================================
// Gallery Filter (if categories are added later)
// ============================================================================

function filterGallery(category) {
    galleryItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, 10);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
}

// ============================================================================
// Preload Adjacent Images
// ============================================================================

function preloadAdjacentImages(currentIndex) {
    const preloadIndices = [
        (currentIndex - 1 + galleryItems.length) % galleryItems.length,
        (currentIndex + 1) % galleryItems.length
    ];

    preloadIndices.forEach(index => {
        const item = galleryItems[index];
        const imageSrc = item.getAttribute('data-image');
        const img = new Image();
        img.src = imageSrc;
    });
}

// Preload when opening lightbox
galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        preloadAdjacentImages(index);
    });
});

// ============================================================================
// Image Loading Animation
// ============================================================================

if (lightboxImage) {
    lightboxImage.addEventListener('load', () => {
        lightboxImage.style.animation = 'fadeIn 0.3s ease';
    });
}

// Add fade-in animation
const galleryStyle = document.createElement('style');
galleryStyle.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .gallery-item {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .lightbox-arrow:active {
        transform: translateY(-50%) scale(0.95) !important;
    }
`;
document.head.appendChild(galleryStyle);

console.log('Gallery initialized with', galleryItems.length, 'images');
