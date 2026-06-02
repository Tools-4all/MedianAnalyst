import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useScrollSpy
 * 
 * Tracks active section element in the viewport using Intersection Observer.
 * Uses a precise detection strip and polling fallback to handle DOM ready states.
 * 
 * @param {Array<string>} sectionIds - IDs of section elements to track.
 * @param {object} options - Options to pass to the IntersectionObserver constructor.
 */
export default function useScrollSpy(sectionIds, options = {}) {
  const [activeId, setActiveId] = useState('home');
  const location = useLocation();
  const isProgrammaticScrollRef = useRef(false);

  // Stringify the array to prevent array reference changes on re-render
  // from triggering cleanups and recreation of the observer.
  const sectionIdsKey = sectionIds.join(',');

  useEffect(() => {
    if (location.pathname !== '/') return;

    let observer;
    let intervalId;

    const setupObserver = () => {
      const ids = sectionIdsKey.split(',');
      const elements = ids.map(id => document.getElementById(id)).filter(Boolean);

      // Verify that all requested sections are mounted in the DOM
      if (elements.length < ids.length) {
        return false;
      }

      const observerOptions = {
        root: null, // Viewport
        rootMargin: '-20% 0px -60% 0px', // Precise detection strip near the top/middle
        threshold: 0, // Trigger as soon as target enters/exits the strip
        ...options
      };

      observer = new IntersectionObserver((entries) => {
        // Ignore scroll spy triggers during programmatic smooth scrolls (clicks)
        if (isProgrammaticScrollRef.current) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      }, observerOptions);

      elements.forEach(el => observer.observe(el));
      return true;
    };

    // Try setting up observer immediately
    const success = setupObserver();

    // If elements aren't ready in the DOM yet, poll every 50ms until found
    if (!success) {
      intervalId = setInterval(() => {
        if (setupObserver()) {
          clearInterval(intervalId);
        }
      }, 50);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (observer) {
        const ids = sectionIdsKey.split(',');
        const elements = ids.map(id => document.getElementById(id)).filter(Boolean);
        elements.forEach(el => observer.unobserve(el));
      }
    };
  }, [location.pathname, sectionIdsKey]);

  /**
   * Set programmatic scroll flag to lock/unlock scroll spy observer
   */
  const setProgrammaticScroll = (value, duration = 800) => {
    isProgrammaticScrollRef.current = value;
    if (value) {
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, duration);
    }
  };

  return [activeId, setActiveId, setProgrammaticScroll];
}
