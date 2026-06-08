
export default function Disclaimers() {
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <section className="w-full max-w-[1000px] px-margin-mobile md:px-margin-desktop py-stack-lg mx-auto" id="disclaimers">
      <div className="w-full mx-auto">
        <div className="mb-10 flex flex-col items-center text-center">
          <h3 className="font-headline-md text-headline-md text-primary mb-2">Disclaimers</h3>
          <div className="w-20 h-1 bg-secondary rounded-full mb-6"></div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            MedianAnalyst operates on a foundation of absolute independence and transparency.<br />
            Please review our operating principles below.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Card 1 */}
          <div 
            className="bento-card p-6 bg-white border border-outline-variant rounded-xl shadow-sm border-t-4 border-t-primary"
            onMouseMove={handleMouseMove}
          >
            <span className="material-symbols-outlined text-primary mb-4 text-3xl">security</span>
            <h4 className="font-title-lg text-title-lg text-primary mb-3">Independence &amp; No Affiliation</h4>
            <p className="font-body-md text-body-md text-on-surface-variant">
              This website is completely independent. I am not affiliated, associated, authorized, endorsed by, or in any way officially connected with any financial institution, bank, or brokerage firm.
            </p>
          </div>
          
          {/* Card 2 */}
          <div 
            className="bento-card p-6 bg-white border border-outline-variant rounded-xl shadow-sm border-t-4 border-t-secondary"
            onMouseMove={handleMouseMove}
          >
            <span className="material-symbols-outlined text-secondary mb-4 text-3xl">gavel</span>
            <h4 className="font-title-lg text-title-lg text-primary mb-3">No Investment Advice</h4>
            <p className="font-body-md text-body-md text-on-surface-variant">
              The content provided, including any analysis or references to the DJIA, is for educational and perspective purposes only. Nothing on this site constitutes investment advice of any kind. I am not a licensed financial advisor, and the information here should not be treated as a substitute for professional financial guidance.
            </p>
          </div>
          
          {/* Card 3 */}
          <div 
            className="bento-card p-6 bg-white border border-outline-variant rounded-xl shadow-sm border-t-4 border-t-primary-container"
            onMouseMove={handleMouseMove}
          >
            <span className="material-symbols-outlined text-primary-container mb-4 text-3xl">precision_manufacturing</span>
            <h4 className="font-title-lg text-title-lg text-primary mb-3">Simulations &amp; Tools</h4>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Any simulations, calculators, or projections provided on this site are for illustrative purposes only. Their accuracy is not guaranteed, and they should not be used as the sole basis for any investment decision. The use of these simulations is at the user's own risk and sole responsibility.
            </p>
          </div>
          
          {/* Card 4 */}
          <div 
            className="bento-card p-6 bg-white border border-outline-variant rounded-xl shadow-sm border-t-4 border-t-error"
            onMouseMove={handleMouseMove}
          >
            <span className="material-symbols-outlined text-error mb-4 text-3xl">trending_down</span>
            <h4 className="font-title-lg text-title-lg text-primary mb-3">Market Risk</h4>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Past performance is not indicative of future results. All investments involve risk, and the user is responsible for any financial losses incurred.
            </p>
          </div>
        </div>
        
        {/* General Note */}
        <div className="mt-gutter p-6 bg-surface-container rounded-xl flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-grow">
            <h5 className="font-title-lg text-title-lg text-primary mb-1">Note about the calculators</h5>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Wherever the DJIA index is mentioned, it is for demonstration and perspective only. You can adjust it to any index of your choice. The site is under construction.&nbsp;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
