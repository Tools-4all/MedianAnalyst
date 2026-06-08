import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MobileHeader({ activeSection = 'home', onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHomeActive = location.pathname === '/' && (activeSection === 'home' || activeSection === 'about' || activeSection === 'contact');
  const isCalculatorsActive = location.pathname.startsWith('/calculators');
  const isNewsletterActive = location.pathname.startsWith('/newsletter');

  const [isHomeExpanded, setIsHomeExpanded] = useState(isHomeActive);
  const [isCalculatorsExpanded, setIsCalculatorsExpanded] = useState(isCalculatorsActive);

  // Synchronize expansion when route/active section changes
  useEffect(() => {
    if (isHomeActive) {
      setIsHomeExpanded(true);
    }
    if (isCalculatorsActive) {
      setIsCalculatorsExpanded(true);
    }
  }, [location.pathname, activeSection, isHomeActive, isCalculatorsActive]);

  const navItems = [
    {
      id: 'home-parent',
      label: 'Home',
      icon: 'home',
      href: '/',
      isRoute: true,
      isActive: isHomeActive,
      hasSubItems: true,
      isExpanded: isHomeExpanded,
      setExpanded: setIsHomeExpanded,
      subItems: [
        { id: 'home', label: 'Main Home', icon: 'home_app_logo', href: '/' },
        { id: 'about', label: 'About', icon: 'info', href: '/#about' },
        { id: 'contact', label: 'Contact', icon: 'contact_support', href: '/#contact' }
      ]
    },
    {
      id: 'calculators-parent',
      label: 'Calculators',
      icon: 'calculate',
      href: '/calculators',
      isRoute: true,
      isActive: isCalculatorsActive,
      hasSubItems: true,
      isExpanded: isCalculatorsExpanded,
      setExpanded: setIsCalculatorsExpanded,
      subItems: [
        { id: 'calc-dashboard', label: 'Calculators Dashboard', icon: 'dashboard', href: '/calculators' },
        { id: 'calc-bank-value', label: 'Bank Value', icon: 'account_balance', href: '/calculators/bank-value' },
        { id: 'calc-inflation', label: 'Financial Inflation', icon: 'trending_up', href: '/calculators/inflation' },
        { id: 'calc-market-shares', label: 'Market Shares', icon: 'bar_chart', href: '/calculators/market-shares' }
      ]
    },
    { 
      id: 'newsletter', 
      label: 'Newsletter', 
      icon: 'mail', 
      href: '/newsletter', 
      isRoute: true,
      isActive: isNewsletterActive
    }
  ];

  const handleLinkClick = (e, item) => {
    e.preventDefault();
    if (item.isRoute) {
      setIsOpen(false);
      navigate(item.href);
      if (item.id === 'home-parent' && onNavigate) {
        onNavigate('home');
      }
    } else if (onNavigate) {
      setIsOpen(false);
      onNavigate(item.id);
    }
  };

  const handleSubLinkClick = (e, sub) => {
    e.preventDefault();
    setIsOpen(false);
    if (sub.href.startsWith('/#')) {
      const sectionId = sub.href.substring(2);
      if (onNavigate) {
        onNavigate(sectionId);
      }
    } else {
      navigate(sub.href);
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <header className="md:hidden bg-surface/90 backdrop-blur-md border-b border-outline-variant fixed top-0 w-full z-50">
        <nav className="flex justify-between items-center px-margin-mobile py-4">
          <div className="font-headline-sm text-headline-sm font-bold text-primary">
            MedianAnalyst
          </div>
          <button 
            onClick={() => setIsOpen(true)}
            className="material-symbols-outlined p-2 text-primary hover:bg-surface-container rounded-full transition-colors"
          >
            menu
          </button>
        </nav>
      </header>

      {/* Drawer Overlay Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-[70] md:hidden transition-opacity duration-300"
        />
      )}

      {/* Slide-out Mobile Menu Drawer */}
      <aside 
        className={`fixed top-0 right-0 h-full w-[280px] bg-white text-on-surface z-[80] border-l border-outline-variant p-6 flex flex-col md:hidden transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="font-headline-sm text-headline-sm font-bold text-primary">Menu</div>
          <button 
            onClick={() => setIsOpen(false)}
            className="material-symbols-outlined p-2 text-primary hover:bg-surface-container rounded-full transition-colors"
          >
            close
          </button>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            if (item.hasSubItems) {
              return (
                <div key={item.id} className="flex flex-col">
                  <button
                    onClick={() => item.setExpanded(!item.isExpanded)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium w-full text-left ${
                      item.isActive
                        ? 'bg-secondary-container/30 text-primary'
                        : 'hover:bg-surface-container text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      {item.icon}
                    </span>
                    <span className="flex-grow">{item.label}</span>
                    <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${item.isExpanded ? 'rotate-180' : ''}`}>
                      keyboard_arrow_down
                    </span>
                  </button>
                  
                  <div 
                    className="grid transition-all duration-300 ease-in-out"
                    style={{
                      gridTemplateRows: item.isExpanded ? '1fr' : '0fr',
                      opacity: item.isExpanded ? 1 : 0
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-6 pl-4 border-l border-outline-variant/60 flex flex-col gap-1.5 mt-1.5 mb-2">
                        {item.subItems.map((sub) => {
                          const isSubActive = sub.href.startsWith('/#')
                            ? (location.pathname === '/' && activeSection === sub.href.substring(2))
                            : (location.pathname === sub.href);
                          
                          return (
                            <a
                              key={sub.id}
                              href={sub.href}
                              onClick={(e) => handleSubLinkClick(e, sub)}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors font-medium text-sm ${
                                isSubActive
                                  ? 'bg-secondary-container text-on-secondary-container font-semibold'
                                  : 'hover:bg-surface-container text-on-surface-variant hover:text-primary'
                              }`}
                            >
                              <span
                                className="material-symbols-outlined text-lg"
                                style={isSubActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                              >
                                {sub.icon}
                              </span>
                              <span>{sub.label}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleLinkClick(e, item)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                  item.isActive
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'hover:bg-surface-container text-on-surface-variant hover:text-primary'
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={item.isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-outline-variant text-center">
          <p className="text-xs text-on-surface-variant/60">
            © 2024 MedianAnalyst
          </p>
        </div>
      </aside>
    </>
  );
}
