// Helper function to get item type from boolean flags
function getItemType(item) {
    if (item.isVegan) {
        return 'Vegan';
    } else if (item.isVeg) {
        return 'Vegetarian';
    } else if (item.isNonVeg) {
        return 'Non-Vegetarian';
    }
    return 'Vegetarian'; // Default
}

// Helper function to capitalize spice level
function capitalizeSpiceLevel(spiceLevel) {
    if (!spiceLevel) return 'Mild';
    return spiceLevel.charAt(0).toUpperCase() + spiceLevel.slice(1);
}

// Render menu from diningMenu data
function renderMenu() {
    const menuContainer = document.getElementById('menuCategories');
    if (!menuContainer || !diningMenu) return;
    
    menuContainer.innerHTML = '';
    
    diningMenu.forEach(category => {
        // Skip category if hideCategory is true
        if (category.hideCategory === true) return;
        
        // Filter items that should be displayed
        const displayedItems = category.menuItems.filter(item => item.isDisplayed);
        
        if (displayedItems.length === 0) return;
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'menu-category';
        
        // Create category title
        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = category.categoryTitle;
        
        // Add special note for Thali category
        if (category.categoryTitle === 'Thali') {
            const note = document.createElement('span');
            note.style.cssText = 'font-size: 0.9rem; font-weight: normal; opacity: 0.8;';
            note.textContent = ' (Ask refill for Rassa & Breads)';
            categoryTitle.appendChild(note);
        }
        
        categoryDiv.appendChild(categoryTitle);
        
        // Create menu items
        displayedItems.forEach(menuItem => {
            const menuItemDiv = document.createElement('div');
            menuItemDiv.className = 'menu-item';
            
            // Store menu item data for modal
            menuItemDiv.dataset.menuItem = JSON.stringify(menuItem);
            
            const headerDiv = document.createElement('div');
            headerDiv.className = 'menu-item-header';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'item-name';
            nameSpan.textContent = menuItem.title;
            
            const priceSpan = document.createElement('span');
            priceSpan.className = 'item-price';
            priceSpan.textContent = `$${menuItem.cost.toFixed(2)}`;
            
            headerDiv.appendChild(nameSpan);
            headerDiv.appendChild(priceSpan);
            
            const descDiv = document.createElement('div');
            descDiv.className = 'item-description';
            descDiv.textContent = menuItem.description;
            
            menuItemDiv.appendChild(headerDiv);
            // menuItemDiv.appendChild(descDiv);
            
            // Add click handler only if hasModal is true
            if (menuItem.hasModal) {
                menuItemDiv.style.cursor = 'pointer';
                menuItemDiv.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const itemData = JSON.parse(this.dataset.menuItem);
                    openModal(itemData);
                });
            }
            
            categoryDiv.appendChild(menuItemDiv);
        });
        
        menuContainer.appendChild(categoryDiv);
    });
}


// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Specialty dish modal functionality
const modal = document.getElementById('dishModal');
const scrollContainer = document.getElementById('scrollContainer');
const specialityScroll = document.querySelector('.speciality-scroll');

// Auto-scroll pause/resume on user interaction
let pauseTimeout;
let isUserInteracting = false;

function pauseAutoScroll() {
    if (!isUserInteracting) {
        scrollContainer.classList.add('paused');
        isUserInteracting = true;
    }
    clearTimeout(pauseTimeout);
}

function resumeAutoScroll() {
    pauseTimeout = setTimeout(() => {
        scrollContainer.classList.remove('paused');
        isUserInteracting = false;
    }, 2000); // Resume after 2 seconds of no interaction
}

// Pause on hover
if (specialityScroll) {
    specialityScroll.addEventListener('mouseenter', pauseAutoScroll);
    specialityScroll.addEventListener('mouseleave', resumeAutoScroll);
    
    // Pause on scroll (wheel, touch, drag)
    specialityScroll.addEventListener('wheel', () => {
        pauseAutoScroll();
        resumeAutoScroll();
    });
    
    specialityScroll.addEventListener('touchstart', pauseAutoScroll);
    specialityScroll.addEventListener('touchmove', pauseAutoScroll);
    specialityScroll.addEventListener('touchend', resumeAutoScroll);
    
    // Pause on manual scroll
    let scrollTimeout;
    specialityScroll.addEventListener('scroll', () => {
        pauseAutoScroll();
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(resumeAutoScroll, 2000);
    });
}

// Helper function to get emoji based on item type/category
function getItemEmoji(menuItem) {
    // If there's an image or video, return empty (will be handled separately)
    if (menuItem.imageLink || menuItem.videoLink) return '';
    
    // Default emojis based on category or item type
    const titleLower = menuItem.title.toLowerCase();
    if (titleLower.includes('chicken')) return '🍛';
    if (titleLower.includes('mutton')) return '🍖';
    if (titleLower.includes('prawn')) return '🦐';
    if (titleLower.includes('thali')) return '🍽️';
    if (titleLower.includes('pav') || titleLower.includes('vada')) return '🥘';
    if (titleLower.includes('poli') || titleLower.includes('bread')) return '🫓';
    if (titleLower.includes('rice') || titleLower.includes('pulav')) return '🍚';
    if (titleLower.includes('lassi') || titleLower.includes('sarbat')) return '🥤';
    if (titleLower.includes('solkadhi')) return '🥤';
    if (menuItem.isVeg && !menuItem.isNonVeg) return '🥗';
    return '🍽️'; // Default emoji
}

// Open modal with dish details
function openModal(dishData) {
    document.getElementById('modalTitle').textContent = dishData.title;
    document.getElementById('modalPrice').textContent = `$${dishData.cost.toFixed(2)}`;
    document.getElementById('modalDescription').textContent = dishData.description;
    document.getElementById('modalSpice').textContent = capitalizeSpiceLevel(dishData.spiceLevel);
    document.getElementById('modalType').textContent = getItemType(dishData);
    document.getElementById('modalRegion').textContent = dishData.region;
    
    // Handle image/video or emoji
    const videoContainer = document.getElementById('modalVideo');
    if (dishData.videoLink) {
        videoContainer.innerHTML = `<video width="100%" height="100%" controls style="object-fit: contain;"><source src="${dishData.videoLink}" type="video/mp4"></video>`;
    } else if (dishData.imageLink) {
        videoContainer.innerHTML = `<img src="${dishData.imageLink}" alt="${dishData.title}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 20px; display: block;">`;
    } else {
        const emoji = getItemEmoji(dishData);
        videoContainer.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 4rem; color: rgba(255,255,255,0.7);">${emoji}</div>`;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Render speciality section from diningMenu
function renderSpeciality() {
    const scrollContainer = document.getElementById('scrollContainer');
    if (!scrollContainer || !diningMenu) return;
    
    // Collect all speciality items
    const specialityItems = [];
    diningMenu.forEach(category => {
        category.menuItems.forEach(item => {
            if (item.isSpeciality && item.isDisplayed) {
                specialityItems.push(item);
            }
        });
    });
    
    if (specialityItems.length === 0) {
        scrollContainer.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--deep-brown);">No speciality items available.</div>';
        return;
    }
    
    scrollContainer.innerHTML = '';
    
    // Create dish cards (duplicate for infinite scroll effect)
    const createDishCard = (item) => {
        const card = document.createElement('div');
        card.className = 'dish-card';
        card.dataset.menuItem = JSON.stringify(item);
        
        const emoji = getItemEmoji(item);
        
        const imageDiv = document.createElement('div');
        imageDiv.className = 'dish-image';
        if (item.imageLink) {
            imageDiv.innerHTML = `<img src="${item.imageLink}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else if (item.videoLink) {
            imageDiv.innerHTML = `<video width="100%" height="100%" style="object-fit: cover;" muted><source src="${item.videoLink}" type="video/mp4"></video>`;
        } else {
            imageDiv.textContent = emoji;
        }
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'dish-info';
        
        const nameH3 = document.createElement('h3');
        nameH3.className = 'dish-name';
        nameH3.textContent = item.title;
        
        const descP = document.createElement('p');
        descP.className = 'dish-description';
        descP.textContent = item.description;
        
        infoDiv.appendChild(nameH3);
        infoDiv.appendChild(descP);
        
        card.appendChild(imageDiv);
        card.appendChild(infoDiv);
        
        // Add click handler
        card.addEventListener('click', function() {
            const itemData = JSON.parse(this.dataset.menuItem);
            openModal(itemData);
        });
        
        return card;
    };
    
    // Add original cards
    specialityItems.forEach(item => {
        scrollContainer.appendChild(createDishCard(item));
    });
    
    // Duplicate cards for seamless infinite scroll
    specialityItems.forEach(item => {
        scrollContainer.appendChild(createDishCard(item));
    });
    
    // Update scroll animation based on number of items
    const itemCount = specialityItems.length;
    if (itemCount > 0) {
        const cardWidth = 300; // Match CSS width
        const gap = 24; // Match CSS gap (1.5rem)
        const style = document.createElement('style');
        style.textContent = `
            @keyframes scroll {
                0% {
                    transform: translateX(0);
                }
                100% {
                    transform: translateX(calc(-${cardWidth}px * ${itemCount} - ${gap}px * ${itemCount}));
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Close modal when clicking outside
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Google Reviews Widget - Dynamic Star Rating
function initializeGoogleReviewsWidget() {
    const widget = document.querySelector('.google-reviews-widget');
    if (!widget || !GoogleReviewWidget) return;

    // Use data from social.js
    const rating = parseFloat(GoogleReviewWidget.rating) || 0;
    const reviews = parseInt(GoogleReviewWidget.reviews) || 0;
    const url = GoogleReviewWidget.url || '';
    
    const starsContainer = widget.querySelector('#starsContainer');
    const ratingText = widget.querySelector('#ratingText');
    
    if (!starsContainer || !ratingText) return;

    // Clear existing stars
    starsContainer.innerHTML = '';

    // Generate stars based on rating
    const fullStars = Math.floor(rating);
    const decimalPart = rating % 1;
    const hasPartialStar = decimalPart > 0;
    
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        if (i < fullStars) {
            star.classList.add('filled');
        } else if (i === fullStars && hasPartialStar) {
            star.classList.add('partial-filled');
            const starPartial = document.createElement('div');
            starPartial.className = 'star-partial';
            // Calculate pixel width based on decimal part (e.g., 0.6 = 60% of 21px = 12.6px)
            const starWidth = 21; // Match the star width from CSS
            const pixelWidth = starWidth * decimalPart;
            starPartial.style.width = `${pixelWidth}px`;
            starPartial.style.height = '21px';
            star.appendChild(starPartial);
        }
        
        starsContainer.appendChild(star);
    }

    // Set rating text
    const reviewsText = reviews === 1 ? 'review' : 'reviews';
    ratingText.textContent = `${rating.toFixed(1)} Stars, ${reviews} ${reviewsText}`;

    // Add click handler to navigate to Google Reviews URL
    if (url) {
        widget.addEventListener('click', function() {
            window.open(url, '_blank');
        });
    }
}

// Instagram Widget - Click Handler
function initializeInstagramWidget() {
    const widget = document.querySelector('.instagram-widget');
    if (!widget || !InstagramWidget) return;

    // Use data from social.js
    const url = InstagramWidget.url || '';
    const followers = InstagramWidget.followers || 0;
    
    // Update followers count
    const followersText = widget.querySelector('.instagram-text');
    if (followersText) {
        const followersLabel = followers === 1 ? 'Follower' : 'Followers';
        followersText.textContent = `${followers} ${followersLabel}`;
    }
    
    // Add click handler to navigate to Instagram URL
    if (url) {
        widget.addEventListener('click', function() {
            window.open(url, '_blank');
        });
    }
}

// Clickable Info Cards - Click Handler
function initializeClickableInfoCards() {
    const clickableCards = document.querySelectorAll('.info-card.clickable');
    clickableCards.forEach(card => {
        const url = card.getAttribute('data-url');
        if (url) {
            card.addEventListener('click', function() {
                window.open(url, '_blank');
            });
        }
    });
}

// Initialize widgets on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeGoogleReviewsWidget();
    initializeInstagramWidget();
    initializeClickableInfoCards();
    renderMenu(); // Render menu from menu-dining.js
    renderSpeciality(); // Render speciality section from menu-dining.js
});

// Back to Top Button
const backToTopButton = document.createElement('a');
backToTopButton.href = '#';
backToTopButton.className = 'back-to-top';
backToTopButton.innerHTML = '↑';
backToTopButton.setAttribute('aria-label', 'Back to top');
document.body.appendChild(backToTopButton);

// Show/hide button based on scroll position
window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

// Smooth scroll to top when clicked
backToTopButton.addEventListener('click', function(e) {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
