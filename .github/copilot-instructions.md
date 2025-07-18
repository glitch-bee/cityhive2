# GitHub Copilot Instructions for NYC Feral Bee Survey

## Architecture Overview

NYC Feral Bee Survey is a collaborative bee sighting mapping platform using **Vanilla JS + Vite** with a **mobile-first, hamburger navigation** approach. The app follows a **module-based architecture** with global state management and custom event-driven communication.

### Key Components
- **`src/main.js`** - Entry point, global `appState` object, initialization orchestration
- **`src/navigation.js`** - Hamburger menu system that controls ALL mobile interactions (form, map controls)
- **`src/map.js`** - MapLibre GL JS integration, marker management, popup system
- **`src/markerform.js`** - Form handling with mobile drawer/desktop panel modes
- **`src/supabase.js`** - Database operations, auth, photo uploads, real-time sync
- **`src/map-controls.js`** - Layer controls accessible via hamburger menu (hidden by default)

### Navigation Pattern
The app uses a **hamburger menu for ALL interactions** on mobile and desktop. Navigation dynamically shows "Add Sighting" and "Map Layers" buttons only on the map page, replacing traditional desktop controls.

## Critical Integration Points

### State Management
```javascript
// Global state in main.js
export const appState = {
  currentUser: null,
  userProfile: null,
  map: null,
  mapControls: null,
  formEnhancements: null,
};
```

### Event-Driven Communication
Components communicate via custom DOM events:
```javascript
// Map controls dispatch events
document.dispatchEvent(new CustomEvent('markerVisibilityChanged', { detail: this.layers.markers }));

// Main.js listens for events
document.addEventListener('markerVisibilityChanged', (e) => updateMarkerVisibility(e.detail));
```

### Form-Map Integration
The marker form and map are tightly coupled:
```javascript
const { handleMapClick, setMap: setMarkerFormMap } = createMarkerForm();
const mapInstance = initMap('map', handleMapClick);
setMarkerFormMap(mapInstance); // Form needs map reference for user location
```

## Development Workflow

### Environment Setup
1. **Required**: Copy `.env.example` to `.env` with API keys
2. **Supabase**: Run SQL scripts in `docs/database/` in order
3. **MapTiler**: Get key from maptiler.com (free tier: 100k loads/month)

### Development Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run deploy       # Build and deploy to gh-pages
```

### Database Integration
- **Supabase setup**: Follow README instructions for table creation
- **Real-time sync**: Automatic marker updates across users
- **Photo storage**: Supabase storage bucket 'bee-photos'
- **Auth triggers**: Auto-create user profiles on signup

## Project-Specific Patterns

### Mobile-First Design
- **Forms**: Mobile drawer (bottom) vs desktop panel (right)
- **Navigation**: Hamburger menu on ALL screen sizes
- **Controls**: Map controls hidden by default, accessible via hamburger

### Authentication Flow
```javascript
// Auth state changes trigger UI updates
onAuthStateChange(async (user) => {
  if (user) {
    appState.currentUser = user;
    appState.userProfile = await getUserProfile();
  }
  initNavigation(appState); // Re-render nav with auth state
  loadMarkers(); // Refresh markers for ownership permissions
});
```

### Marker Management
- **Ownership**: Users can delete their own markers + admins can delete any
- **Status system**: Unverified → Active → Checked → Gone → Removed
- **Real-time updates**: All users see changes immediately

### PWA Scaffolding
Complete PWA infrastructure is **scaffolded but not active**:
- `public/manifest.json` - App metadata
- `public/sw.js` - Service worker placeholder
- `src/pwa-installer.js` - Installation handler
- See `docs/PWA_IMPLEMENTATION.md` for activation steps

## Common Gotchas

### Environment Variables
- All API keys must be prefixed with `VITE_`
- App fails gracefully with warnings if keys missing
- **Never commit actual keys** - use .env.example as template

### Map Initialization
- MapTiler requires valid API key for tiles
- Map bounds restricted to NYC area
- Click handlers must be attached after map initialization

### Form Behavior
- Mobile forms use CSS classes `.expanded` for state
- Desktop forms use `.panel-collapsed` for state
- Both systems coexist but activate based on screen size

### Component Communication
- Use custom DOM events for component communication
- Global window functions for inline onclick handlers (legacy pattern)
- appState modifications trigger re-renders via auth state changes

When working on this codebase, always consider the mobile-first approach and the hamburger navigation pattern that controls all user interactions.
