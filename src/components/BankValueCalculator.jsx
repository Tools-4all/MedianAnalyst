import { useMemo, useState } from 'react';
import useCalculatorConsts from '../hooks/useCalculatorConsts';

/**
 * BankValueCalculator
 * 
 * Implements the exact formulas from the "bank value calculation" Excel tab.
 * 
 * Step A: Dividend Return
 * Step B: Economic Activity Value  
 * Step C: Volatility (Machete-derived)
 * Step D: Range Measurement
 */

const BANK_CONST_DEFAULTS = {
  baseEquity: 100,
  financialMultiplier: 2.71,
  defaultDividendPct: 4,
  defaultRealGrowth: 1.9,
  defaultPceIndex: 2.9,
  defaultInterestRate: 4.93,
};

// ─── Pure calculation engine ─────────────────────────────────────────────────
function computeBankValue(
  { dividendPct, realGrowth, pceIndex, interestRate },
  { baseEquity, financialMultiplier },
) {
  // Validate & sanitize
  const dPct = Math.max(0, dividendPct || 0) / 100;   // convert 4 → 0.04
  const rg   = Math.max(0, realGrowth || 0);
  const pce  = Math.max(0, pceIndex || 0);
  const ir   = Math.max(0, interestRate || 0);

  // ── Step A ─────────────────────────────────────────────────────────────────
  const equityWithDividend = (1 + dPct) * baseEquity;

  // ── Step B ─────────────────────────────────────────────────────────────────
  const nominalGrowth = rg * pce;
  const assetValue    = nominalGrowth * financialMultiplier;
  const economicValueEOY = equityWithDividend * ((assetValue / 100) + 1);
  const marketToEconomicRatio = economicValueEOY / 100;

  // ── Step C ─────────────────────────────────────────────────────────────────
  const rangeOfRisk  = Math.pow(ir, 3) - Math.pow(ir, 2);
  const potentialRisk = rangeOfRisk > 0 ? Math.sqrt(rangeOfRisk) : 0;

  // ── Step D ─────────────────────────────────────────────────────────────────
  const upperCoeff = (potentialRisk / 100) + 1;
  const lowerCoeff = 1 - (potentialRisk / 100);
  const upperRange = marketToEconomicRatio * upperCoeff;
  const lowerRange = marketToEconomicRatio * lowerCoeff;

  return {
    // Step A
    equityWithDividend,
    // Step B
    nominalGrowth,
    assetValue,
    economicValueEOY,
    marketToEconomicRatio,
    // Step C
    rangeOfRisk,
    potentialRisk,
    // Step D
    upperCoeff,
    lowerCoeff,
    upperRange,
    lowerRange,
  };
}

// ─── Formatting helpers ──────────────────────────────────────────────────────
const fmt = (v, decimals = 2) => {
  if (v === null || v === undefined || isNaN(v)) return '—';
  return v.toFixed(decimals);
};

// ─── Reusable sub-components ─────────────────────────────────────────────────
function StepHeader({ label, icon, color = 'bg-secondary' }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${color} text-on-secondary rounded-t-lg`}>
      <span className="material-symbols-outlined text-xl">{icon}</span>
      <h3 className="font-title-lg">{label}</h3>
    </div>
  );
}

function ParamRow({ label, sublabel, value, onChange, disabled = false, suffix = '' }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3 items-center py-3 px-4 border-b border-outline-variant/30 last:border-b-0">
      <div>
        <div className="font-bold text-primary text-sm">{label}</div>
        {sublabel && (
          <div className="text-xs text-on-surface-variant mt-0.5">{sublabel}</div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          disabled={disabled}
          className={`w-full border border-outline-variant rounded-lg p-2.5 text-center font-bold font-data-tabular text-primary transition-all focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 ${
            disabled ? 'bg-surface-container-high cursor-not-allowed opacity-60' : 'bg-white hover:border-primary/40'
          }`}
        />
        {suffix && <span className="text-on-surface-variant font-label-sm shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}

function ResultRow({ label, value, highlight = false, large = false }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3 items-center py-3 px-4 border-b border-outline-variant/20 last:border-b-0 ${
      highlight ? 'bg-secondary-container/15' : ''
    }`}>
      <div className={`font-medium ${highlight ? 'text-primary' : 'text-on-surface-variant'} ${large ? 'text-base' : 'text-sm'}`}>
        {label}
      </div>
      <div className={`text-center font-data-tabular font-bold ${
        highlight ? 'text-secondary text-lg' : 'text-primary'
      }`}>
        {value}
      </div>
    </div>
  );
}

function OperationIndicator({ op }) {
  return (
    <div className="flex justify-center py-1 px-4">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-container text-on-surface-variant font-bold text-sm">
        {op}
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BankValueCalculator() {
  const { config } = useCalculatorConsts('bank-value', BANK_CONST_DEFAULTS);
  const [dividendPct, setDividendPct] = useState(config.defaultDividendPct);
  const [realGrowth, setRealGrowth] = useState(config.defaultRealGrowth);
  const [pceIndex, setPceIndex] = useState(config.defaultPceIndex);
  const [interestRate, setInterestRate] = useState(config.defaultInterestRate);

  const results = useMemo(
    () =>
      computeBankValue(
        { dividendPct, realGrowth, pceIndex, interestRate },
        {
          baseEquity: config.baseEquity,
          financialMultiplier: config.financialMultiplier,
        },
      ),
    [
      config.baseEquity,
      config.financialMultiplier,
      dividendPct,
      interestRate,
      pceIndex,
      realGrowth,
    ],
  );

  const handleReset = () => {
    setDividendPct(config.defaultDividendPct);
    setRealGrowth(config.defaultRealGrowth);
    setPceIndex(config.defaultPceIndex);
    setInterestRate(config.defaultInterestRate);
  };

  // Determine valuation signal
  const ratio = results.marketToEconomicRatio;
  const signal =
    ratio >= 1.05 ? { text: 'Undervalued', color: 'text-secondary', icon: 'trending_up' } :
    ratio >= 0.95 ? { text: 'Fair Value',  color: 'text-on-surface-variant', icon: 'trending_flat' } :
                    { text: 'Overvalued',  color: 'text-error', icon: 'trending_down' };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-secondary-container/20 border border-secondary/30 p-5 rounded-xl">
        <h4 className="font-title-lg text-primary mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">account_balance</span>
          Bank Value Calculation
        </h4>
        <p className="font-body-md text-on-surface-variant leading-relaxed">
          Banks are measured by the ratio of market value to equity, which includes dividend payout. This calculator derives the economic equity value from growth, inflation, and a financial multiplier, then computes valuation ranges using Machete-derived volatility.
        </p>
      </div>

      {/* ── Step A: Dividend Return ──────────────────────────────────────── */}
      <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <StepHeader label="Step A — Dividend Return" icon="percent" />
        <ParamRow
          label="Base Equity (Previous Year End)"
          sublabel="Fixed at 100%"
          value={config.baseEquity}
          onChange={() => {}}
          disabled
        />
        <OperationIndicator op="×" />
        <ParamRow
          label="Average Dividend Percentage"
          sublabel="Dividend relative to bank's equity"
          value={dividendPct}
          onChange={setDividendPct}
          suffix="%"
        />
        <ResultRow
          label="Equity Including Dividend Return"
          value={fmt(results.equityWithDividend)}
          highlight
        />
      </div>

      {/* ── Step B: Economic Activity Value ───────────────────────────────── */}
      <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <StepHeader label="Step B — Economic Activity Value" icon="show_chart" />
        <ParamRow
          label="Real Growth (FOMC)"
          sublabel="Long-term Fed real growth estimate"
          value={realGrowth}
          onChange={setRealGrowth}
        />
        <OperationIndicator op="×" />
        <ParamRow
          label="Average Quarterly PCE Index"
          sublabel="Last four quarters average"
          value={pceIndex}
          onChange={setPceIndex}
        />
        <ResultRow label="Nominal Growth" value={fmt(results.nominalGrowth)} />

        <OperationIndicator op="×" />
        <ParamRow
          label="Financial Multiplier"
          sublabel="Every dollar of growth generates 2.71 financial assets"
          value={config.financialMultiplier}
          onChange={() => {}}
          disabled
        />
        <ResultRow label="Asset Value (Nominal × Multiplier)" value={fmt(results.assetValue)} />
        <ResultRow
          label={`Economic Value at End of Year`}
          value={fmt(results.economicValueEOY)}
          highlight
        />
        <ResultRow
          label="Market Value to Economic Equity Ratio"
          value={fmt(results.marketToEconomicRatio, 4)}
          highlight
          large
        />
      </div>

      {/* ── Step C: Volatility (Machete) ──────────────────────────────────── */}
      <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <StepHeader label="Step C — Volatility (Machete)" icon="swap_vert" color="bg-primary-container" />
        <div className="px-4 py-2 bg-surface-container-low border-b border-outline-variant/30">
          <p className="text-xs text-on-surface-variant italic">
            The interest rate is derived from the Machete calculator using debt-to-GDP ratio and inflation from the prime rate. See the Machete calculator for full details.
          </p>
        </div>
        <ParamRow
          label="Interest Rate (from Machete)"
          sublabel="Derived from debt-to-GDP and prime inflation"
          value={interestRate}
          onChange={setInterestRate}
        />
        <div className="px-4 py-1">
          <span className="text-xs text-on-surface-variant font-label-sm">
            Operation: interest³ − interest²
          </span>
        </div>
        <ResultRow label="Range of Risk" value={fmt(results.rangeOfRisk)} />
        <div className="px-4 py-1">
          <span className="text-xs text-on-surface-variant font-label-sm">
            Operation: √(Range of Risk)
          </span>
        </div>
        <ResultRow
          label="Potential Risk (Movement)"
          value={fmt(results.potentialRisk, 4)}
          highlight
        />
      </div>

      {/* ── Step D: Range Measurement ─────────────────────────────────────── */}
      <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <StepHeader label="Step D — Range Measurement" icon="expand" color="bg-primary" />
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-outline-variant">
          {/* Upper Range */}
          <div>
            <div className="px-4 py-2 bg-secondary-container/10 border-b border-outline-variant/20">
              <span className="font-label-sm text-secondary font-bold uppercase tracking-wider">Upper Range</span>
            </div>
            <ResultRow label="Economic Ratio" value={fmt(results.marketToEconomicRatio, 4)} />
            <OperationIndicator op="×" />
            <ResultRow label="Upper Coefficient" value={fmt(results.upperCoeff, 4)} />
            <ResultRow
              label="Upper Range Ratio"
              value={fmt(results.upperRange, 4)}
              highlight
              large
            />
          </div>
          {/* Lower Range */}
          <div>
            <div className="px-4 py-2 bg-error-container/20 border-b border-outline-variant/20">
              <span className="font-label-sm text-error font-bold uppercase tracking-wider">Lower Range</span>
            </div>
            <ResultRow label="Economic Ratio" value={fmt(results.marketToEconomicRatio, 4)} />
            <OperationIndicator op="×" />
            <ResultRow label="Lower Coefficient" value={fmt(results.lowerCoeff, 4)} />
            <ResultRow
              label="Lower Range Ratio"
              value={fmt(results.lowerRange, 4)}
              highlight
              large
            />
          </div>
        </div>
      </div>

      {/* ── Summary Card ──────────────────────────────────────────────────── */}
      <div className="bg-secondary-container/15 border-l-4 border-l-secondary border border-outline-variant p-6 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="font-headline-sm text-primary mb-1">Valuation Summary</h3>
            <p className="text-on-surface-variant text-sm">
              Market value to economic equity assessment based on your parameters.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display-lg text-primary">{fmt(ratio, 4)}</span>
            </div>
            <div className={`flex items-center gap-1 ${signal.color} font-medium text-sm`}>
              <span className="material-symbols-outlined text-base">{signal.icon}</span>
              <span>{signal.text}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-outline-variant/30 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white/60 rounded-lg">
            <div className="text-xs text-on-surface-variant mb-1 font-label-sm">Lower Bound</div>
            <div className="font-data-tabular font-bold text-primary">{fmt(results.lowerRange, 4)}</div>
          </div>
          <div className="p-3 bg-white/60 rounded-lg border-2 border-secondary/20">
            <div className="text-xs text-secondary mb-1 font-label-sm">Base Ratio</div>
            <div className="font-data-tabular font-bold text-secondary text-lg">{fmt(ratio, 4)}</div>
          </div>
          <div className="p-3 bg-white/60 rounded-lg">
            <div className="text-xs text-on-surface-variant mb-1 font-label-sm">Upper Bound</div>
            <div className="font-data-tabular font-bold text-primary">{fmt(results.upperRange, 4)}</div>
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReset}
            className="flex-1 border border-primary text-primary py-3 px-4 font-bold flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors rounded-lg"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
