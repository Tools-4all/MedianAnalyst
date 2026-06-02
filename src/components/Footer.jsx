import React from 'react';

export default function Footer({ onNavigate }) {
  const handleLinkClick = (e, targetId) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(targetId);
    }
  };

  return (
    <footer className="bg-primary text-on-primary py-stack-lg px-margin-mobile md:px-margin-desktop snap-start">
      <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row justify-between items-center gap-gutter">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="font-title-lg text-title-lg font-bold text-secondary-fixed">
            MedianAnalyst
          </div>
          <p className="font-body-md text-body-md opacity-60">
            Professional Economic Research &amp; Analysis.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-6">
          <a 
            className="text-sm opacity-80 hover:text-secondary-fixed transition-colors" 
            href="/"
            onClick={(e) => handleLinkClick(e, 'home')}
          >
            Methodology
          </a>
          <a 
            className="text-sm opacity-80 hover:text-secondary-fixed transition-colors" 
            href="/"
            onClick={(e) => handleLinkClick(e, 'home')}
          >
            Legal
          </a>
          <a 
            className="text-sm opacity-80 hover:text-secondary-fixed transition-colors" 
            href="/"
            onClick={(e) => handleLinkClick(e, 'home')}
          >
            Privacy
          </a>
          <a 
            className="text-sm opacity-80 hover:text-secondary-fixed transition-colors" 
            href="/#contact"
            onClick={(e) => handleLinkClick(e, 'contact')}
          >
            Contact
          </a>
        </div>
      </div>
      
      <div className="max-w-[1000px] mx-auto mt-8 pt-8 border-t border-white/10 text-center text-xs opacity-40">
        © 2024 MedianAnalyst. All rights reserved.
      </div>
    </footer>
  );
}
