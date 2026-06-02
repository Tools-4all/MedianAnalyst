import React from 'react';

export default function Contact() {
  return (
    <section className="w-full max-w-[1000px] px-margin-mobile md:px-margin-desktop py-stack-lg mx-auto mb-12" id="contact">
      <div className="w-full mx-auto">
        <div className="rounded-2xl p-12 text-center relative overflow-hidden text-on-surface bg-secondary-container/20">
          {/* Aesthetic background glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary rounded-full blur-[100px] opacity-20"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-fixed rounded-full blur-[100px] opacity-10"></div>
          
          <h3 className="font-headline-md text-headline-md mb-4 text-primary font-semibold">Contact Us</h3>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-xl mx-auto leading-relaxed">
            For inquiries regarding simulations, professional partnerships, or data methodology, please reach out to our office.
          </p>
          
          <a 
            className="inline-flex items-center gap-4 text-2xl md:text-4xl font-bold hover:text-primary transition-colors group text-primary justify-center" 
            href="mailto:mosheanalyst@gmail.com"
          >
            <img 
              alt="Email" 
              className="w-10 h-10 md:w-16 md:h-16 object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJdC5QPiA3aGj8j1MBfm5ZUUYNJ_RuBHZcvpK6xs1iohXUGf0e3Bj9YTmPnVdvcLIWUfFYbS4KfHJQwdsiUktdsdEUQAVQReecd4eYPuZuSbGnxUBehtdPRRaJ02ThAEMyjFMaeuCVazSBMUT_PzfSxquzLMHlStZ2JEOlBNf2ZP-Ikfn6jmQ3XXnVQjVtTM0G_XGqLr2ZZwLHffqplXFyQvXkx_T71LPVcw-NTs2YYWvZTdzlCIMU880ea0cI4Et_OsikkKPyevs"
            />
            <span>mosheanalyst@gmail.com</span>
            <span className="material-symbols-outlined text-4xl transform group-hover:translate-x-2 transition-transform">
              arrow_forward
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
