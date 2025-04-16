// script.js

document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;
    const navToggle = document.querySelector('.js-nav-trigger');
    const navPopup = document.getElementById('nav-popup');
    const popupClose = document.querySelector('.js-popup-close');
    const popupOverlay = document.querySelector('.js-popup-overlay');
    const header = document.querySelector('.site-header');

    // --- Navigation Toggle ---
    let previouslyFocusedElement = null; // To store focus before opening nav

    const toggleNav = () => {
        const isOpen = body.classList.toggle('nav-open');

        if (navPopup) {
            navPopup.setAttribute('aria-hidden', !isOpen);
            if (isOpen) {
                previouslyFocusedElement = document.activeElement; // Store current focus
                // Find first focusable element in nav and focus it
                const firstFocusable = navPopup.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (firstFocusable) {
                    setTimeout(() => firstFocusable.focus(), 50); // Delay slightly for transition
                }
            } else if (previouslyFocusedElement) {
                previouslyFocusedElement.focus(); // Restore focus
                previouslyFocusedElement = null; // Clear stored element
            }
        }

        if (popupOverlay) {
            popupOverlay.setAttribute('aria-hidden', !isOpen);
        }

        // Optional: Disable/enable body scroll when nav is open/closed
        // This can prevent background scrolling but might need a library for robustness
        // body.style.overflow = isOpen ? 'hidden' : '';
    };

    if (navToggle && navPopup && popupClose && popupOverlay) {
        navToggle.addEventListener('click', toggleNav);
        popupClose.addEventListener('click', toggleNav);
        popupOverlay.addEventListener('click', toggleNav); // Close when clicking overlay

        // Close nav when clicking a link inside it
        const navLinks = navPopup.querySelectorAll('.js-nav-link'); // Use specific class for nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (body.classList.contains('nav-open')) {
                    // Close nav regardless of link type for simplicity now
                    // In a real app, check if it's an internal anchor link before closing
                    toggleNav();
                }
            });
        });

        // Trap focus within the open navigation
        navPopup.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && body.classList.contains('nav-open')) {
                const focusableElements = Array.from(navPopup.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(el => el.offsetParent !== null); // Only visible focusable elements
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            } else if (e.key === 'Escape' && body.classList.contains('nav-open')) {
                toggleNav(); // Close nav on Escape key
            }
        });
    }

    // --- Smooth Scrolling for internal links ---
    // Note: Currently no links use js-scroll-section, but the functionality is here
    const scrollLinks = document.querySelectorAll('.js-scroll-section');

    scrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement && header) { // Ensure header exists
                    const headerHeight = header.offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    // Adjust for header height only if header is fixed/sticky when scrolling starts
                    // Check if 'scrolled' class is present or if window.scrollY is > threshold
                    const isHeaderSticky = header.classList.contains('scrolled') || window.scrollY > 50;
                    const offsetPosition = elementPosition + window.pageYOffset - (isHeaderSticky ? headerHeight : 0);

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                } else if (targetElement) { // Fallback if header not found
                     window.scrollTo({
                        top: targetElement.offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });


    // --- Update Copyright Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Add 'scrolled' class to header on scroll ---
    if (header) {
        const scrollThreshold = 50; // Pixels to scroll before adding class
        const handleScroll = () => {
            if (window.scrollY > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        // Initial check in case page loads already scrolled
        handleScroll();
        // Add scroll listener
        window.addEventListener('scroll', handleScroll, { passive: true }); // Use passive listener for performance
    }

    // --- Reveal on Scroll using Intersection Observer ---
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    if (revealElements.length > 0 && 'IntersectionObserver' in window) { // Check browser support
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Use a timeout to slightly delay adding the class, allowing CSS transitions to catch up if needed
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, 100); // Small delay
                    // Optional: Stop observing once revealed to save resources
                    observer.unobserve(entry.target);
                }
                // Optional: If you want elements to hide again when scrolled out
                // else {
                //     // Don't remove if you only want it to reveal once
                //     // entry.target.classList.remove('is-visible');
                // }
            });
        }, {
            threshold: 0.1, // Trigger when 10% of the element is visible
            rootMargin: '0px 0px -50px 0px' // Trigger animation slightly before element fully enters viewport bottom
        });

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    } else {
        // Fallback for browsers without IntersectionObserver: reveal all elements immediately
        revealElements.forEach(el => el.classList.add('is-visible'));
    }

    // --- Adjust Footer Margin Based on Sticky Bar Visibility (Desktop) ---
    // This is a CSS-based approach in the CSS file now (`body:has(.sticky-address)`) which is cleaner
    // Keeping JS approach commented out as an alternative if needed.
    /*
    const stickyAddressBar = document.querySelector('.sticky-address');
    const siteFooter = document.querySelector('.site-footer');

    function adjustFooterMargin() {
        if (siteFooter && stickyAddressBar) {
            const stickyBarHeight = stickyAddressBar.offsetHeight;
            // Check if sticky bar is displayed (relies on CSS display property)
            const isStickyBarVisible = window.getComputedStyle(stickyAddressBar).display !== 'none';

            if (isStickyBarVisible && window.innerWidth >= 992) { // Check breakpoint
                siteFooter.style.marginBottom = `${stickyBarHeight}px`;
            } else {
                siteFooter.style.marginBottom = '0px';
            }
        }
    }

    // Adjust on load and resize
    if (stickyAddressBar && siteFooter) {
        adjustFooterMargin();
        window.addEventListener('resize', adjustFooterMargin);

        // Optional: Use MutationObserver if sticky bar display changes dynamically
        const observer = new MutationObserver(adjustFooterMargin);
        observer.observe(stickyAddressBar, { attributes: true, attributeFilter: ['style', 'class'] });
    }
    */

}); // End DOMContentLoaded