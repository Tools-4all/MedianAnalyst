import React from 'react';

export default function About() {
  return (
    <section className="w-full max-w-[1000px] px-margin-mobile md:px-margin-desktop py-stack-md mx-auto" id="about">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center border border-outline-variant rounded-xl p-8 shadow-sm bg-surface border-l-4 border-l-secondary">
        <div className="md:col-span-12">
          <span className="text-secondary font-label-sm text-label-sm uppercase tracking-widest mb-2 block font-semibold">
            Meet the Analyst
          </span>
          <h3 className="font-headline-md text-headline-md text-primary mb-4 border-b border-outline-variant/30 pb-2 mb-6">
            About the author of the site
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary shrink-0">check_circle</span>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Graduate of Investment Consulting and Management Studies.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary shrink-0">check_circle</span>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Graduate of Financial Analysis Studies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
