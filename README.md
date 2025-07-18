# NYC Feral Bee Survey

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** June 23 2025

A **production-ready** collaborative mapping platform for tracking bee sightings in New York City. Built for beekeepers, researchers, and citizen scientists to document and verify bee activity across the five boroughs.

## Features

- **Interactive Map** - Real-time collaborative bee sighting map with NYC boundaries
- **User Authentication** - Secure login/registration system with user profiles
- **Location Tracking** - GPS-powered location detection and manual pin placement  
- **Community Comments** - Add comments and observations to any sighting
- **Photo Uploads** - Document sightings with cloud-stored photos
- **Status System** - Track verification status (Unverified, Active, Checked, Gone, Removed)
- **NYC-Focused** - Optimized boundaries for the five boroughs
- **Mobile-First** - Touch-optimized responsive design for field use
- **Real-time Updates** - Instant synchronization across all users and devices
- **User Ownership** - Users can manage their own markers with admin oversight

## Tech Stack

- **Frontend:** Vite + Vanilla JavaScript + MapLibre GL JS
- **Map:** MapTiler Streets v2 (vector tiles)
- **Backend:** Supabase (PostgreSQL + Realtime + Storage + Auth)
- **Styling:** Modern CSS with Inter font
- **Mobile:** Responsive design optimized for touch interfaces

## Quick Start

### Option 1: Use with Default Keys (Demo)
```bash
git clone https://github.com/yourusername/cityhive2.git
cd cityhive2
npm install
npm run dev
```

### Option 2: Use Your Own API Keys (Recommended)
```bash
git clone https://github.com/yourusername/cityhive2.git
cd cityhive2
npm install

# Copy example environment file
cp .env.example .env

# Edit .env with your own API keys:
# VITE_SUPABASE_URL=your_supabase_project_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key  
# VITE_MAPTILER_KEY=your_maptiler_api_key

npm run dev
```

## Setting Up Your Own Instance

### 1. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL scripts in `docs/database/` in order:
   - `database_setup_comments.sql` - Comments system
   - `database_setup_photos.sql` - Photo storage
   - `database_setup_status.sql` - Status tracking
3. Enable Authentication in the Supabase dashboard
4. Get your project URL and anon key from Settings > API

### 2. MapTiler Setup  
1. Sign up at [maptiler.com](https://maptiler.com)
2. Get your API key from the dashboard
3. Free tier includes 100,000 map loads/month

### 3. Environment Configuration
Create a `.env` file with your keys:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPTILER_KEY=your_maptiler_api_key
```

## Mobile Experience

NYC Feral Bee Survey is **optimized for mobile field use** with:
- **Touch-friendly interface** with modal-based marker details
- **GPS integration** for easy location capture
- **Photo uploads** directly from mobile cameras
- **Instant updates** without page reloads
- **Responsive design** that works on all screen sizes

## Marker Types

- **Hive** - Established bee colonies
- **Swarm** - Mobile bee clusters  
- **Structure** - Bees in buildings/man-made structures
- **Tree** - Natural tree cavities with bees

## Status Tracking

- **Unverified** - New sighting, needs verification
- **Active** - Confirmed active colony
- **Checked** - Recently inspected
- **Gone** - Colony has moved or died
- **Removed** - Professionally removed

## Deployment

### GitHub Pages
```bash
npm run build
npm run deploy
```

### Other Platforms
```bash
npm run build
# Upload dist/ folder to your hosting platform
```

## Development

```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── main.js          # Application entry point & state management
├── supabase.js      # Database & authentication functions
├── map.js           # Map and marker logic with mobile optimization
├── markerform.js    # Form handling & photo uploads
├── auth.js          # Authentication modal & user management
├── navigation.js    # Site navigation & user interface
├── welcome.js       # Welcome guide for new users
├── style.css        # Main styles
├── map.css          # Map-specific styles
├── auth.css         # Authentication modal styles
└── pages.css        # Static page styles

docs/
├── README.md        # Documentation structure overview
├── database/        # Database setup scripts and documentation
└── internal/        # Private development notes (not tracked in git)

public/
├── cityhive-logo.svg # Logo file
└── *.png            # Branding images
```

## Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and recent changes.

## Contributing

This project is focused on the NYC bee community. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contact

For questions about the NYC bee community or this project, please open an issue.

---

**Made with for NYC beekeepers and citizen scientists**

*Built by Usher Gay for the New York Bee Club*
