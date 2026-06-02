import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardShell() {
  const calculators = [
    {
      id: 'bank-value',
      title: 'Bank Value Calculator',
      icon: 'account_balance',
      summary: 'Banks are measured by the ratio of market value to equity, which includes dividend payout.',
      path: '/calculators/bank-value',
      active: true
    },
    {
      id: 'inflation',
      title: 'Financial Inflation Calculator',
      icon: 'trending_up',
      summary: 'In the United States, there are three types of inflation and a fourth that is a weighting of the previous three. PCE serves as an inflationary basis for calculating models based on the real economy, while Financial Inflation (derived from the Prime rate) is used for foreign currency government bonds and models that do not measure the real economy.',
      path: '/calculators/inflation',
      active: true
    },
    {
      id: 'mortgage',
      title: 'Mortgage & Housing',
      icon: 'home_work',
      summary: 'Assess housing affordability, mortgage amortization schedules, and the financial trade-offs between renting and owning.',
      path: '/calculators/mortgage',
      active: false
    },
    {
      id: 'market-shares',
      title: 'Market Value of Tradable Shares',
      icon: 'bar_chart',
      summary: 'In capital market courses, the Buffet indicator measures the ratio between the value of tradable shares and GDP. This model develops it in several layers. (Note: I rarely use this calculation because it relies on market value rather than macro data).',
      path: '/calculators/market-shares',
      active: true
    },
    {
      id: 'capital-gains',
      title: 'Capital Gains Tax',
      icon: 'gavel',
      summary: 'Calculate tax liabilities on investments, property sales, and capital gains with optimization scenarios.',
      path: '/calculators/capital-gains',
      active: false
    },
    {
      id: 'pension',
      title: 'Pension Savings Plan',
      icon: 'savings',
      summary: 'Forecast retirement savings growth, pension payouts, and determine the optimal contribution rates for target goals.',
      path: '/calculators/pension',
      active: false
    },
    {
      id: 'budget',
      title: 'Budget Management',
      icon: 'payments',
      summary: 'Track income allocation, control spending patterns, and optimize household budgets for financial health.',
      path: '/calculators/budget',
      active: false
    },
    {
      id: 'insurances',
      title: 'Insurances & Coverage',
      icon: 'security',
      summary: 'Evaluate life, health, and property insurance policies to optimize premiums and coverage levels.',
      path: '/calculators/insurances',
      active: false
    }
  ];

  return (
    <section className="min-h-screen flex items-center justify-center py-stack-lg px-margin-mobile md:px-margin-desktop" id="calculators">
      <div className="max-w-[1000px] w-full mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h2 className="font-headline-md text-headline-md text-primary mb-4 flex items-center justify-center md:justify-start gap-2">
            <span className="w-8 h-1 bg-secondary rounded-full"></span>
            Calculators Dashboard
          </h2>
          <p className="font-body-lg text-on-surface-variant max-w-2xl">
            Explore specialized calculators designed to analyze market trends, housing costs, tax loads, and retirement savings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.filter(calc => calc.active).map((calc) => (
            <div 
              key={calc.id} 
              className="group flex flex-col bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm hover:border-secondary hover:shadow-md transition-all duration-300"
            >
              {/* Header / Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary-container/20 text-secondary rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">{calc.icon}</span>
                </div>
                {!calc.active && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/50">
                    Coming Soon
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-title-lg text-primary mb-2 group-hover:text-secondary transition-colors duration-300">
                {calc.title}
              </h3>

              {/* Summary */}
              <p className="font-body-md text-on-surface-variant text-sm flex-1 leading-relaxed mb-6">
                {calc.summary}
              </p>

              {/* CTA */}
              <div className="pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                <Link 
                  to={calc.path} 
                  className={`inline-flex items-center gap-1 text-sm font-bold transition-all duration-300 ${
                    calc.active 
                      ? 'text-secondary group-hover:text-primary' 
                      : 'text-on-surface-variant/70 group-hover:text-secondary'
                  }`}
                >
                  <span>Launch Calculator</span>
                  <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
