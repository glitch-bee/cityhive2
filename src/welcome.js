// Welcome guide component for NYC Feral Bee Survey
export function createWelcomeGuide() {
    const isMobile = window.innerWidth <= 768;
    
    // Welcome content based on device type
    const welcomeContent = isMobile ? `
        <div class="welcome-content mobile">
            <button class="close-welcome" aria-label="Close welcome guide">×</button>
            <h1>Welcome to NYC Feral Bee Survey 🐝</h1>
            
            <section class="quick-start">
                <h2>Quick Start</h2>
                <h3>Found a Bee Colony? 📱</h3>
                <ol>
                    <li>Open NYC Feral Bee Survey on your phone</li>
                    <li>Enable location services</li>
                    <li>Tap the map where you saw the bees</li>
                    <li>Choose the type:
                        <ul>
                            <li>🟡 Hive (established colony)</li>
                            <li>🔴 Swarm (mobile cluster)</li>
                            <li>⚫ Structure (building/roof)</li>
                            <li>🟢 Tree (natural cavity)</li>
                        </ul>
                    </li>
                    <li>Add a photo (optional)</li>
                    <li>Submit!</li>
                </ol>
            </section>

            <section class="what-is">
                <h2>What is NYC Feral Bee Survey?</h2>
                <p>A community map for tracking wild honey bees in NYC. We help document feral colonies that live in tree cavities, walls, and other urban spaces.</p>
            </section>

            <section class="why-map">
                <h2>Why Map Wild Bees?</h2>
                <ul>
                    <li>They're crucial pollinators</li>
                    <li>Help us understand urban bee health</li>
                    <li>Support conservation efforts</li>
                    <li>Guide swarm management</li>
                </ul>
            </section>

            <section class="mobile-tips">
                <h2>Mobile Tips 💡</h2>
                <h3>Best Practices</h3>
                <ul>
                    <li>Take clear, well-lit photos</li>
                    <li>Note any bee activity</li>
                    <li>Add helpful details in comments</li>
                    <li>Update status if you check back</li>
                </ul>

                <h3>Current Features</h3>
                <ul>
                    <li>📍 GPS location tracking</li>
                    <li>📸 Photo uploads</li>
                    <li>💬 Community comments</li>
                    <li>🔄 Real-time updates</li>
                    <li>📱 Touch-friendly interface</li>
                </ul>
            </section>

            <section class="help">
                <h2>Need Help?</h2>
                <ul>
                    <li>Tap the "?" icon for help</li>
                    <li>Visit our Resources page</li>
                    <li>Contact New York Bee Club</li>
                </ul>
            </section>

            <footer>
                <p>Built by Usher Gay (<a href="https://github.com/glitch-bee" target="_blank" rel="noopener noreferrer">glitch-bee</a>) for the New York Bee Club</p>
            </footer>

            <button class="got-it-button">Got It!</button>
        </div>
    ` : `
        <div class="welcome-content desktop">
            <button class="close-welcome" aria-label="Close welcome guide">×</button>
            <h1>Welcome to NYC Feral Bee Survey 🐝</h1>
            
            <section class="what-is">
                <h2>What is NYC Feral Bee Survey?</h2>
                <p>NYC Feral Bee Survey is a community-powered mapping tool that helps track feral honey bee colonies—wild hives that live in tree cavities, walls, and other hidden spots across our urban landscape. These aren't the managed hives you might see in a beekeeper's apiary. Feral colonies form on their own, often after a swarm splits off from an existing hive. They represent a critical but largely undocumented part of the urban ecosystem.</p>
                <p>NYC Feral Bee Survey is designed to make this hidden world visible.</p>
            </section>

            <section class="why-matters">
                <h2>Why This Matters</h2>
                <ul>
                    <li>Feral hives may be more genetically diverse or more adapted to local environments than managed colonies</li>
                    <li>They play a crucial role in pollination, often in places where managed hives aren't present</li>
                    <li>Understanding where and how they survive helps support bee conservation, swarm management, and even public safety</li>
                </ul>
            </section>

            <section class="getting-started">
                <h2>Getting Started</h2>
                <h3>How to Use NYC Feral Bee Survey</h3>
                <p>Using just a smartphone, anyone can add a sighting to our live map—tagging locations of wild hives, active swarms, or structures where bees are living. Each marker supports photos, detailed notes, and collaborative comments, making it easy to share what you see and learn from others. All updates appear in real time, so the tool is equally useful for fieldwork, research, or even casual urban exploration.</p>
            </section>

            <section class="features">
                <h2>Current Features</h2>
                <p>NYC Feral Bee Survey is already live and in use. You can:</p>
                <ul>
                    <li>View and add sightings</li>
                    <li>Upload photos</li>
                    <li>Track colony activity over time</li>
                    <li>Use our mobile-friendly interface</li>
                    <li>Get instant updates across all users</li>
                    <li>Make detailed observations through our touch-friendly interface</li>
                </ul>
            </section>

            <section class="future">
                <h2>Looking Ahead</h2>
                <p>We're working on:</p>
                <ul>
                    <li>Real-time swarm alerts for emergency response and community coordination</li>
                    <li>Research tools to link colonies with local flora and environmental data</li>
                    <li>Educational outreach and partnerships with schools, parks, and conservation groups</li>
                    <li>Long-term data collection to better understand bee health and urban biodiversity</li>
                </ul>
            </section>

            <section class="community">
                <h2>Join Our Community</h2>
                <p>NYC Feral Bee Survey is a tool for beekeepers—but also for researchers, naturalists, city planners, and anyone who cares about the health of urban ecosystems. By helping map and monitor wild bees in New York and beyond, we're building a clearer picture of pollinator life in the city—and a stronger foundation for protecting it.</p>
            </section>

            <footer>
                <p>Built by Usher Gay (<a href="https://github.com/glitch-bee" target="_blank" rel="noopener noreferrer">glitch-bee</a>) for the New York Bee Club</p>
            </footer>

            <button class="got-it-button">Got It!</button>
        </div>
    `;
    
    return {
        show: () => {
            // Remove any existing welcome modal
            const existingModal = document.querySelector('.welcome-modal');
            if (existingModal) {
                existingModal.remove();
            }

            // Hide marker form on mobile when welcome is shown
            if (isMobile) {
                const markerForm = document.getElementById('marker-form');
                if (markerForm) {
                    markerForm.style.display = 'none';
                }
            }

            const modal = document.createElement('div');
            modal.className = 'welcome-modal';
            modal.innerHTML = welcomeContent;
            
            // Add to DOM
            document.body.appendChild(modal);
            document.body.classList.add('welcome-open');
            
            // Add event listeners for both close button and Got It button
            const closeBtn = modal.querySelector('.close-welcome');
            const gotItBtn = modal.querySelector('.got-it-button');
            
            const closeModal = () => {
                modal.remove();
                document.body.classList.remove('welcome-open');
                localStorage.setItem('welcomeSeen', 'true');

                // Show marker form again on mobile after welcome is dismissed
                if (isMobile) {
                    const markerForm = document.getElementById('marker-form');
                    if (markerForm) {
                        markerForm.style.display = 'block';
                    }
                }
            };

            if (closeBtn) {
                closeBtn.addEventListener('click', closeModal);
            }
            if (gotItBtn) {
                gotItBtn.addEventListener('click', closeModal);
            }
        },
        
        shouldShow: () => {
            return !localStorage.getItem('welcomeSeen');
        }
    };
}

export function initWelcomePopup() {
    const welcomeGuide = createWelcomeGuide();
    if (welcomeGuide.shouldShow()) {
        welcomeGuide.show();
    }
} 