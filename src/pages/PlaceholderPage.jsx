import { Link, useParams } from 'react-router-dom';
import CalculatorDisclaimer from '../components/CalculatorDisclaimer';

const CALCULATORS_DETAILS = {
  'mortgage': {
    title: 'Mortgage & Housing Calculator',
    icon: 'home_work',
    description: 'Assess housing affordability, mortgage amortization schedules, and the financial trade-offs between renting and owning.'
  },
  'market-indices': {
    title: 'Market Indices Forecast',
    icon: 'bar_chart',
    description: 'Evaluate stock market performance and forecast future index growth relative to inflation and historical risk factors.'
  },
  'capital-gains': {
    title: 'Capital Gains Tax Calculator',
    icon: 'gavel',
    description: 'Calculate tax liabilities on investments, property sales, and capital gains with optimization scenarios.'
  },
  'pension': {
    title: 'Pension Savings Plan',
    icon: 'savings',
    description: 'Forecast retirement savings growth, pension payouts, and determine the optimal contribution rates for target goals.'
  },
  'budget': {
    title: 'Budget Management Tool',
    icon: 'payments',
    description: 'Track income allocation, control spending patterns, and optimize household budgets for financial health.'
  },
  'insurances': {
    title: 'Insurances & Coverage',
    icon: 'security',
    description: 'Evaluate life, health, and property insurance policies to optimize premiums and coverage levels.'
  }
};

export default function PlaceholderPage() {
  const { calculatorId } = useParams();
  const calculator = CALCULATORS_DETAILS[calculatorId] || {
    title: 'Financial Calculator',
    icon: 'calculate',
    description: 'Explore advanced institutional-grade economic analysis tools.'
  };

  return (
    <div className="py-stack-lg px-margin-mobile md:px-margin-desktop max-w-[1000px] mx-auto">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-label-sm text-on-surface-variant">
        <Link to="/" className="hover:text-secondary transition-colors">Home</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link to="/#calculators" className="hover:text-secondary transition-colors">Calculators</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-primary font-bold">{calculator.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="font-headline-md text-primary mb-2 flex items-center gap-2">
          <span className="w-8 h-1 bg-secondary rounded-full"></span>
          {calculator.title}
        </h1>
        <p className="font-body-md text-on-surface-variant max-w-2xl">
          {calculator.description}
        </p>
      </header>

      {/* Placeholder Details */}
      <div className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm flex flex-col justify-center items-center text-center min-h-[350px]">
        <span className="material-symbols-outlined text-6xl text-secondary mb-4">{calculator.icon}</span>
        <h4 className="font-headline-sm text-primary mb-2">{calculator.title}</h4>
        <p className="text-on-surface-variant max-w-md mb-6 leading-relaxed">
          This component will host the advanced {calculator.title.toLowerCase()} mathematical models, interactive inputs, and real-time visualization graphs.
        </p>
        <div className="px-6 py-3 bg-secondary-container/20 border border-secondary/10 rounded-lg text-on-secondary-container font-medium text-sm mb-6">
          Under Development. Full visual analysis and calculation logic coming soon.
        </div>
        <Link to="/" className="px-6 py-3 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-container transition-colors shadow-sm">
          Return to Homepage
        </Link>
      </div>

      {/* Disclaimer */}
      <CalculatorDisclaimer />
    </div>
  );
}
