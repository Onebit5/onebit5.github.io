'use strict';

// Portfolio Application Main Module
const Portfolio = {
    // Configuration
    config: {
        typewriterSpeed: 140,
        scrollRevealOffset: 50,
        autoSlideInterval: 5000
    },

    // Initialize all functionality
    init() {
        this.typewriter.init();
        this.scrollReveal.init();
        this.projectFilter.init();
        this.themeToggle.init();
        this.smoothScroll.init();
        this.accessibility.init();
        this.tabNavigation.init();
        this.expandableCards.init();
    },

    // Typewriter effect module
    typewriter: {
        init() {
            const target = document.getElementById('typewriter');
            if (!target) return;

            const text = 'Jose Antonio';
            let i = 0;

            const typeWriter = () => {
                if (i < text.length) {
                    target.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, Portfolio.config.typewriterSpeed);
                }
            };

            typeWriter();
        }
    },

    // Scroll reveal animation module
    scrollReveal: {
        init() {
            const elements = document.querySelectorAll('section, .project-card');

            const revealOnScroll = () => {
                elements.forEach(element => {
                    const elementTop = element.getBoundingClientRect().top;
                    const windowHeight = window.innerHeight;

                    if (elementTop < windowHeight - Portfolio.config.scrollRevealOffset) {
                        element.style.opacity = '1';
                    }
                });
            };

            // Use throttled scroll for better performance
            let ticking = false;
            const scrollHandler = () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        revealOnScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            };

            window.addEventListener('scroll', scrollHandler, { passive: true });
            revealOnScroll(); // Initial call
        }
    },

    // Project filtering module
    projectFilter: {
        init() {
            const filterBtns = document.querySelectorAll('.filter-btn');
            const projectCards = document.querySelectorAll('.project-card');

            if (!filterBtns.length || !projectCards.length) return;

            filterBtns.forEach(btn => {
                btn.addEventListener('click', this.handleFilter.bind(this));
            });
        },

        handleFilter(event) {
            const btn = event.currentTarget;
            const filter = btn.getAttribute('data-filter');

            // Update active button
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Apply filter logic here
            this.filterProjects(filter);
        },

        filterProjects(filter) {
            const projectCards = document.querySelectorAll('.project-card');

            projectCards.forEach(card => {
                const isVisible = filter === 'all' || card.getAttribute('data-category') === filter;
                card.style.display = isVisible ? 'flex' : 'none';
            });
        }
    },

    // Theme toggle module
    themeToggle: {
        init() {
            const themeToggle = document.getElementById('theme-toggle');
            if (!themeToggle) return;

            // Load saved theme
            const currentTheme = localStorage.getItem('theme');
            if (currentTheme === 'dark') {
                document.body.classList.add('dark-mode');
            }

            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        },

        toggleTheme() {
            document.body.classList.toggle('dark-mode');

            const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
        }
    },

    // Smooth scrolling for anchor links
    smoothScroll: {
        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', this.handleClick);
            });
        },

        handleClick(event) {
            event.preventDefault();
            const target = document.querySelector(event.currentTarget.getAttribute('href'));

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    },

    // Accessibility enhancements
    accessibility: {
        init() {
            // Keyboard navigation
            this.enhanceKeyboardNav();
        },

        enhanceKeyboardNav() {
            // Ensure all interactive elements are keyboard accessible
            const interactiveElements = document.querySelectorAll('a, button, [tabindex]');

            interactiveElements.forEach(element => {
                if (!element.hasAttribute('tabindex') && element.tagName !== 'A' && element.tagName !== 'BUTTON') {
                    element.setAttribute('tabindex', '0');
                }
            });
        }
    },

    // Tab navigation for Gameplay/Engine Programmer views
    tabNavigation: {
        init() {
            const tabs = document.querySelectorAll('.profile-tab');
            if (!tabs.length) return;

            tabs.forEach(tab => {
                tab.addEventListener('click', this.handleTabClick.bind(this));
            });

            // Check URL parameter first
            const urlParams = new URLSearchParams(window.location.search);
            const profileParam = urlParams.get('profile');

            let initialProfile = 'gameplay';

            if (profileParam && ['gameplay', 'engine'].includes(profileParam)) {
                initialProfile = profileParam;
            } else {
                // Load saved profile preference if no URL param
                const savedProfile = localStorage.getItem('activeProfile');
                if (savedProfile && ['gameplay', 'engine'].includes(savedProfile)) {
                    initialProfile = savedProfile;
                }
            }

            // Set active tab and switch profile
            const activeTab = document.querySelector(`.profile-tab[data-profile="${initialProfile}"]`);
            if (activeTab) {
                tabs.forEach(t => t.classList.remove('active'));
                activeTab.classList.add('active');
                this.switchProfile(initialProfile);
            }
        },

        handleTabClick(event) {
            const tab = event.currentTarget;
            const profile = tab.getAttribute('data-profile');

            // Update active tab
            document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Switch profile content
            this.switchProfile(profile);

            // Update URL without page reload
            const url = new URL(window.location);
            if (profile === 'gameplay') {
                url.searchParams.delete('profile');
            } else {
                url.searchParams.set('profile', profile);
            }
            window.history.pushState({}, '', url);

            // Save preference
            localStorage.setItem('activeProfile', profile);
        },

        switchProfile(profile) {
            // Filter projects
            const projectCards = document.querySelectorAll('.project-card');
            projectCards.forEach(card => {
                const profiles = card.getAttribute('data-profiles');
                if (profiles && profiles.split(',').includes(profile)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });

            // Filter skills
            const skillCategories = document.querySelectorAll('.skill-category');
            skillCategories.forEach(category => {
                const profiles = category.getAttribute('data-skill-profiles');
                if (profiles && profiles.split(',').includes(profile)) {
                    category.style.display = '';
                } else {
                    category.style.display = 'none';
                }
            });

            // Switch About section
            const aboutSections = document.querySelectorAll('[data-profile-section]');
            aboutSections.forEach(section => {
                const sectionProfile = section.getAttribute('data-profile-section');
                if (sectionProfile === profile) {
                    section.style.display = '';
                } else {
                    section.style.display = 'none';
                }
            });

            // Update header subtitle
            const subtitle = document.querySelector('.header-subtitle');
            if (subtitle) {
                if (profile === 'gameplay') {
                    subtitle.textContent = 'Gameplay Programmer';
                } else if (profile === 'engine') {
                    subtitle.textContent = 'Engine Programmer';
                }
            }
        }
    },

    // Expandable project cards
    expandableCards: {
        init() {
            const readMoreButtons = document.querySelectorAll('.read-more-btn');

            readMoreButtons.forEach(btn => {
                btn.addEventListener('click', this.handleReadMore.bind(this));
            });
        },

        handleReadMore(event) {
            event.preventDefault();
            const btn = event.currentTarget;
            const card = btn.closest('.project-card');
            const shortDesc = card.querySelector('.project-description-short');
            const fullDesc = card.querySelector('.project-description-full');

            if (card.classList.contains('expanded')) {
                // Collapse
                card.classList.remove('expanded');
                shortDesc.style.display = 'block';
                fullDesc.style.display = 'none';
                btn.textContent = 'Read more...';
            } else {
                // Expand
                card.classList.add('expanded');
                shortDesc.style.display = 'none';
                fullDesc.style.display = 'block';
                btn.textContent = 'Show less';
            }
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Portfolio.init());
} else {
    Portfolio.init();
}

// Calculate and display age
const birthYear = 2007;
const birthMonth = 5;
const birthDay = 6;

const today = new Date();
let age = today.getFullYear() - birthYear;

if (today.getMonth() + 1 < birthMonth || (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)) {
    age--;
}

// Set age when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const ageElement = document.getElementById('age');
        if (ageElement) {
            ageElement.textContent = age + " Years";
        }
    });
} else {
    const ageElement = document.getElementById('age');
    if (ageElement) {
        ageElement.textContent = age + " Years";
    }
}
