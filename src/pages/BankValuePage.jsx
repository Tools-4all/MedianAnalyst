import { Link } from 'react-router-dom';
import BankValueCalculator from '../components/BankValueCalculator';
import CalculatorDisclaimer from '../components/CalculatorDisclaimer';

export default function BankValuePage() {
  return (
    <div className="py-stack-lg px-margin-mobile md:px-margin-desktop max-w-[1000px] mx-auto">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-xs font-label-sm text-on-surface-variant">
        <Link to="/" className="hover:text-secondary transition-colors">Home</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <Link to="/#calculators" className="hover:text-secondary transition-colors">Calculators</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-primary font-bold">Bank Value Calculator</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="font-headline-md text-primary mb-2 flex items-center gap-2">
          <span className="w-8 h-1 bg-secondary rounded-full"></span>
          Bank Value Calculator
        </h1>
        <p className="font-body-md text-on-surface-variant max-w-2xl">
          Assess institutional value, dividend returns, real economic growth impact, PCE inflation ratios, and machete-derived interest rate bounds in real-time.
        </p>
      </header>

      {/* Calculator Component */}
      <BankValueCalculator />

      {/* Disclaimer */}
      <CalculatorDisclaimer />
    </div>
  );
}
