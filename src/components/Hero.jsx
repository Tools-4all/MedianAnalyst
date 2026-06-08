import { useNavigate } from 'react-router-dom';

export default function Hero({ onNavigate }) {
  const navigate = useNavigate();

  const handleCalculatorsClick = (e) => {
    e.preventDefault();
    navigate('/calculators');
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('about');
    }
  };

  return (
    <section className="w-full max-w-[1000px] px-margin-mobile md:px-margin-desktop py-stack-lg mt-12 mx-auto" id="home">
      <div className="relative overflow-hidden rounded-xl p-12 md:p-20 text-center flex flex-col items-center shadow-2xl bg-surface-container-low text-on-surface">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #051125 1px, transparent 0)', backgroundSize: '40px 40px', opacity: 0.05 }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #ffffff 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        <h2 className="font-display-lg text-display-lg mb-6 leading-tight max-w-3xl text-primary">
          MedianAnalyst
        </h2>
        <p className="font-headline-sm text-headline-sm mb-6 text-secondary font-semibold">
          How do I calculate?
        </p>
        <p className="font-body-lg text-body-lg mb-10 max-w-2xl leading-relaxed text-on-surface-variant">
          The site is intended for the median person and aims to provide an independent analysis tool through simulations of various models. The models are modular and at each stage you can make adjustments independently according to your decision. The site is completely independent and is not affiliated with any entity or financial institution.
        </p>
        
        <div className="flex gap-4">
          <a 
            href="/calculators"
            onClick={handleCalculatorsClick}
            className="px-8 py-4 bg-secondary text-on-secondary font-bold rounded-lg hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
          >
            <span className="material-symbols-outlined">calculate</span>
            View Calculators
          </a>
          <a 
            href="#about"
            onClick={handleAboutClick}
            className="px-8 py-4 border font-bold rounded-lg hover:bg-white/10 transition-all text-primary border-primary inline-block"
          >
            Learn Methodology
          </a>
        </div>
      </div>
    </section>
  );
}
