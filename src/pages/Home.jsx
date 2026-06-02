import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Hero from '../components/Hero';
import About from '../components/About';
import Contact from '../components/Contact';
import Disclaimers from '../components/Disclaimers';

export default function Home() {
  const { handleNavigate } = useOutletContext();

  return (
    <div className="flex flex-col gap-6 md:gap-10 pb-12">
      {/* 1. Hero Section */}
      <Hero onNavigate={handleNavigate} />
      
      {/* 2. About Section */}
      <About />
      
      {/* 3. Disclaimers Section */}
      <Disclaimers />
      
      {/* 4. Contact Section */}
      <Contact />
      
      {/* 5. Accessibility Section */}
      <section className="w-full max-w-[1000px] px-margin-mobile md:px-margin-desktop py-stack-md mx-auto" id="accessibility">
        <div className="p-6 bg-surface-container-low border border-outline-variant rounded-xl flex items-center gap-4">
          <span className="material-symbols-outlined text-secondary">accessibility_new</span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            The site is still in progress - every effort is being made to adapt it to people with disabilities.
          </p>
        </div>
      </section>
    </div>
  );
}
