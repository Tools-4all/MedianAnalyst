import React, { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import Footer from './Footer';
import useScrollSpy from '../hooks/useScrollSpy';

export default function Layout() {
  const sectionIds = useMemo(() => ['home', 'about', 'contact'], []);
  const [activeSection, setActiveSection, setProgrammaticScroll] = useScrollSpy(sectionIds);
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll to correct section if url hash is present
  useEffect(() => {
    if (location.pathname === '/') {
      if (location.hash) {
        const id = location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          const timer = setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          return () => clearTimeout(timer);
        }
      } else {
        // Scroll to top if path is '/' and no hash
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Scroll to top for other page routes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, location.hash]);

  // Synchronize active navigation item based on path and hash
  useEffect(() => {
    if (location.pathname.startsWith('/calculators')) {
      setActiveSection('calculators');
    } else if (location.pathname.startsWith('/newsletter')) {
      setActiveSection('newsletter');
    } else if (location.pathname === '/') {
      if (location.hash) {
        setActiveSection(location.hash.substring(1));
      } else {
        setActiveSection('home');
      }
    }
  }, [location.pathname, location.hash, setActiveSection]);

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    setProgrammaticScroll(true, 800); // Lock scrollspy updates during programmatic smooth scrolls
    
    if (location.pathname !== '/') {
      // If we are on another route, navigate back to home with hash
      navigate(`/#${sectionId}`);
    } else {
      // If we are on homepage, scroll to the section
      if (sectionId === 'home') {
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate(`/#${sectionId}`);
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Desktop Sidebar Navigation */}
      <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Mobile Top Navigation */}
      <MobileHeader activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Main Content Area (indented on desktop for sidebar layout) */}
      <main className="pt-[64px] md:pt-0 with-sidebar flex flex-col min-h-screen transition-all duration-300">
        <div className="flex-grow">
          <Outlet context={{ handleNavigate }} />
        </div>
        
        {/* Footer Section */}
        <Footer onNavigate={handleNavigate} />
      </main>
    </div>
  );
}
