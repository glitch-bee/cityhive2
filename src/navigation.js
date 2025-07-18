import { showAuthModal, hideAuthModal } from './auth.js';
import { supabase, signOut, onAuthStateChange } from './supabase.js';
import { showCrosshair, hideCrosshair } from './crosshair.js';

export function initNavigation(appState) {
  const pages = [
    { name: 'Survey Map', path: 'index.html' },
    { name: 'Data Analysis', path: 'about.html' },
    { name: 'Research Resources', path: 'resources.html' },
  ];

  const header = document.querySelector('header');
  if (!header) {
    console.error('Header element not found, appending nav to body.');
    // If header doesn't exist, we can create/append to body or another element.
    // For this case, let's assume we want to prepend it to the body.
  }
  if (header) {
    header.innerHTML = ''; // Clear it out
  }

  const nav = document.createElement('nav');
  nav.className = 'main-nav';

  const navContainer = document.createElement('div');
  navContainer.className = 'nav-container';

  // Brand section (Text Only)
  const brandLink = document.createElement('a');
  brandLink.href = 'index.html';
  brandLink.className = 'nav-brand';


  const brandText = document.createElement('span');
  brandText.className = 'brand-text';
  brandText.textContent = 'NYC Feral Bee Survey';
  brandLink.appendChild(brandText);

  navContainer.appendChild(brandLink);

  // Nav links
  const navLinksDiv = document.createElement('div');
  navLinksDiv.className = 'nav-links';

  // Simple header - professional branding
  const sidebarHeader = document.createElement('div');
  sidebarHeader.innerHTML = 'NYC Feral Bee Survey';
  navLinksDiv.appendChild(sidebarHeader);

  // Navigation Links first
  pages.forEach((page) => {
    const a = document.createElement('a');
    a.href = page.path;
    a.textContent = page.name;
    a.className = 'nav-link';
    if (window.location.pathname.endsWith(page.path)) {
      a.classList.add('active');
    }
    navLinksDiv.appendChild(a);
  });

  // Add Sighting Button (only show on map page) - after navigation
  if (
    window.location.pathname === '/' ||
    window.location.pathname.endsWith('index.html') ||
    window.location.pathname === '/cityhive2/' ||
    window.location.pathname === '/cityhive2/index.html'
  ) {
    const addBtn = document.createElement('button');
    addBtn.className = 'nav-add-sighting';
    addBtn.id = 'nav-add-sighting';
    addBtn.innerHTML = '+ Add Survey Point';
    navLinksDiv.appendChild(addBtn);
  }

  // Map Layers Button (only show on map page) - after Add Sighting
  if (
    window.location.pathname === '/' ||
    window.location.pathname.endsWith('index.html') ||
    window.location.pathname === '/cityhive2/' ||
    window.location.pathname === '/cityhive2/index.html'
  ) {
    const mapBtn = document.createElement('button');
    mapBtn.className = 'nav-map-layers';
    mapBtn.id = 'mobile-map-layers';
    mapBtn.innerHTML = 'Layer Controls';
    navLinksDiv.appendChild(mapBtn);
  }

  // Mobile hamburger toggle (will be positioned in right section)
  const navToggle = document.createElement('div');
  navToggle.className = 'nav-toggle';
  navToggle.setAttribute('aria-label', 'Toggle navigation menu');
  navToggle.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  // Mobile menu functionality
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('nav-toggle-active');
    navLinksDiv.classList.toggle('nav-active');

    // Update aria-label for accessibility
    const isActive = navLinksDiv.classList.contains('nav-active');
    navToggle.setAttribute(
      'aria-label',
      isActive ? 'Close navigation menu' : 'Open navigation menu'
    );

    // Prevent body scrolling when menu is open
    document.body.style.overflow = isActive ? 'hidden' : '';

    // Close Add Sighting form if it's open
    const markerForm = document.getElementById('marker-form');
    if (markerForm && markerForm.classList.contains('expanded')) {
      markerForm.classList.remove('expanded');
      markerForm.style.display = 'none';
      // Hide crosshair when form is closed
      hideCrosshair();
    }

    // Close Map Controls if they're open
    const mapControls = document.querySelector('.map-controls');
    if (mapControls && mapControls.style.display === 'block') {
      mapControls.style.display = 'none';
    }
  });

  // Close mobile menu when clicking nav links or auth buttons
  navLinksDiv.addEventListener('click', (e) => {
    // Helper function to close the menu
    const closeMenu = () => {
      navToggle.classList.remove('nav-toggle-active');
      navLinksDiv.classList.remove('nav-active');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
      document.body.style.overflow = '';
    };

    if (
      e.target.classList.contains('nav-link') ||
      e.target.classList.contains('login-btn') ||
      e.target.classList.contains('logout-btn') ||
      e.target.classList.contains('nav-add-sighting') ||
      e.target.classList.contains('nav-map-layers')
    ) {
      // Handle Add Sighting click
      if (e.target.id === 'nav-add-sighting') {
        console.log('Add Sighting clicked, window width:', window.innerWidth);
        closeMenu(); // Close menu first

        setTimeout(() => {
          const markerForm = document.getElementById('marker-form');
          if (markerForm) {
            console.log(
              'Opening marker form, current classes:',
              markerForm.className
            );
            console.log('Current form styles:', {
              display: getComputedStyle(markerForm).display,
              transform: getComputedStyle(markerForm).transform,
              position: getComputedStyle(markerForm).position,
            });

            // Show the mobile form drawer
            markerForm.style.display = 'block';
            markerForm.classList.remove('panel-collapsed');
            markerForm.classList.add('expanded');

            // Show crosshair for location selection
            showCrosshair();

            // For mobile, ensure form is visible and expanded
            if (window.innerWidth <= 768) {
              // Don't set inline styles that conflict with CSS classes
              // The CSS handles the transform based on .expanded class
              console.log('Mobile form should use CSS class-based styling');

              console.log('Mobile form should now be visible with styles:', {
                display: markerForm.style.display,
                transform: markerForm.style.transform,
                classes: markerForm.className,
              });
            }
          } else {
            console.error('Marker form element not found!');
          }
        }, 300); // Wait for menu to close
        return;
      }

      // Handle Map Layers click
      if (e.target.id === 'mobile-map-layers') {
        closeMenu(); // Close menu first

        setTimeout(() => {
          const mapControls = document.querySelector('.map-controls');
          if (mapControls) {
            mapControls.style.display = 'block';
            mapControls.style.position = 'fixed';
            mapControls.style.top = '50%';
            mapControls.style.left = '50%';
            mapControls.style.transform = 'translate(-50%, -50%)';
            mapControls.style.zIndex = '10004';
            mapControls.style.maxWidth = '90vw';
            mapControls.style.maxHeight = '80vh';
          }
        }, 300); // Wait for menu to close
        return;
      }

      // For regular nav links and auth buttons, just close the menu
      closeMenu();
    }
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (
      !nav.contains(e.target) &&
      navLinksDiv.classList.contains('nav-active')
    ) {
      navToggle.classList.remove('nav-toggle-active');
      navLinksDiv.classList.remove('nav-active');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
      document.body.style.overflow = '';
    }
  });

  // Close mobile menu on window resize if switching to desktop
  window.addEventListener('resize', () => {
    if (
      window.innerWidth > 768 &&
      navLinksDiv.classList.contains('nav-active')
    ) {
      navToggle.classList.remove('nav-toggle-active');
      navLinksDiv.classList.remove('nav-active');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
      document.body.style.overflow = '';
    }
  });

  // Panel toggle button (only visible on desktop when not on main map page)
  const panelToggleContainer = document.createElement('div');
  panelToggleContainer.className = 'panel-toggle-container';

  if (
    window.location.pathname === '/' ||
    window.location.pathname.endsWith('index.html') ||
    window.location.pathname === '/cityhive2/' ||
    window.location.pathname === '/cityhive2/index.html'
  ) {
    const panelToggleBtn = document.createElement('button');
    panelToggleBtn.className = 'panel-toggle-btn';
    panelToggleBtn.setAttribute('aria-label', 'Toggle marker form panel');
    panelToggleBtn.innerHTML = '📍 Add Sighting';

    panelToggleBtn.addEventListener('click', () => {
      const markerForm = document.getElementById('marker-form');
      if (markerForm) {
        markerForm.classList.toggle('panel-collapsed');
        const isCollapsed = markerForm.classList.contains('panel-collapsed');
        panelToggleBtn.innerHTML = isCollapsed
          ? '📍 Add Sighting'
          : '✕ Close Panel';
        panelToggleBtn.setAttribute('aria-expanded', !isCollapsed);

        // Show/hide crosshair based on panel state
        if (isCollapsed) {
          hideCrosshair();
        } else {
          showCrosshair();
        }

        // Remember user preference
        localStorage.setItem('panelCollapsed', isCollapsed.toString());
      }
    });

    panelToggleContainer.appendChild(panelToggleBtn);
  }

  // Create auth content helper function
  const createAuthContent = (containerClass) => {
    const authContainer = document.createElement('div');
    authContainer.className = containerClass;

    if (appState.currentUser && appState.userProfile) {
      // User is logged in
      const userNameEl = document.createElement('span');
      userNameEl.className = 'user-name';
      userNameEl.textContent = `Welcome, ${appState.userProfile.display_name || 'User'}`;

      const logoutBtn = document.createElement('button');
      logoutBtn.className = 'logout-btn';
      logoutBtn.textContent = 'Logout';
      logoutBtn.addEventListener('click', async () => {
        try {
          await signOut();
        } catch (error) {
          console.error('Error signing out:', error);
        }
      });

      authContainer.appendChild(userNameEl);
      authContainer.appendChild(logoutBtn);
    } else {
      // User is logged out
      const loginBtn = document.createElement('button');
      loginBtn.className = 'login-btn';
      loginBtn.textContent = 'Login / Sign Up';
      loginBtn.addEventListener('click', showAuthModal);
      authContainer.appendChild(loginBtn);
    }

    return authContainer;
  };

  // Auth Button
  const mobileAuthContainer = createAuthContent('auth-container mobile-auth');
  navLinksDiv.appendChild(mobileAuthContainer);

  // Desktop auth container
  const desktopAuthContainer = createAuthContent('auth-container desktop-auth');

  // Combine nav links and panel toggle for desktop
  const rightSideContainer = document.createElement('div');
  rightSideContainer.style.display = 'flex';
  rightSideContainer.style.alignItems = 'center';
  rightSideContainer.style.gap = '2rem'; // Match gap from .nav-links

  rightSideContainer.appendChild(navLinksDiv);
  rightSideContainer.appendChild(navToggle);

  navContainer.appendChild(rightSideContainer);
  nav.appendChild(navContainer);

  if (header) {
    header.appendChild(nav);
  } else {
    document.body.prepend(nav);
  }
}
