import React, { useState, useMemo } from 'react';

/**
 * InflationCalculator
 * 
 * Official Title: Calculating inflation (Financial Inflation Calculator).
 * 
 * Implements the exact formulas and color-coded rules from the spreadsheet tab:
 *   Pink/Grey [Input]     → React useState variables
 *   Light Blue [Constant] → JavaScript const
 *   Light Green [Result]  → Computed dynamically via useMemo
 *   Orange [Operation]    → UI operation indicators
 *   Salmon [Explanation]  → Card summaries, labels, and text callouts
 */

// ─── Constants (Light Blue cells) ────────────────────────────────────────────
const FIXED_RISK_PREMIUM = 1.5;         // Step 1: Fixed risk premium
const BIAS_ELEMENT_1 = 0.15;            // Step 2: Biases known from research (lower limit)
const BIAS_ELEMENT_2 = 0.40;            // Step 2: Biases known from research (upper limit)
const BIAS_ELEMENT_3 = 0.00;            // Step 2: My calculation (no bias element)
const NUMBER_OF_ELEMENTS = 3;           // Step 2: Three elements of bias
const PROBABILITY_BIAS_UP_DOWN = 0.5;   // Step 2: The probability that the bias will be up or down is 0.5

// ─── Default Input Values (Pink / Grey cells) ─────────────────────────────────
const DEFAULTS = {
  primeRate: 6.75,                      // Prime Rate
  fedFundsRate: 3.64,                   // Fed Funds Rate
};

// ─── Pure Calculation Engine ─────────────────────────────────────────────────
function computeInflation({ primeRate, fedFundsRate }) {
  const pr = Math.max(0, primeRate || 0);
  const ffr = Math.max(0, fedFundsRate || 0);

  // Step 1: Financial Inflation Engine
  const internalMiddleCalculation = pr - ffr;
  const financialInflation = internalMiddleCalculation - FIXED_RISK_PREMIUM;

  // Step 2: Calculation Bias Model
  const totalBias = BIAS_ELEMENT_1 + BIAS_ELEMENT_2 + BIAS_ELEMENT_3;
  const averageBias = totalBias / NUMBER_OF_ELEMENTS;
  const finalAppliedBias = averageBias * PROBABILITY_BIAS_UP_DOWN;

  return {
    internalMiddleCalculation,
    financialInflation,
    totalBias,
    averageBias,
    finalAppliedBias,
  };
}

// ─── Formatting Helper ───────────────────────────────────────────────────────
const fmt = (v, decimals = 4) => {
  if (v === null || v === undefined || isNaN(v) || !isFinite(v)) return '—';
  return v.toFixed(decimals);
};

// ─── Reusable UI Sub-components ──────────────────────────────────────────────
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
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-3 items-center py-3 px-4 border-b border-outline-variant/30 last:border-b-0">
      <div>
        <div className="font-bold text-primary text-sm">{label}</div>
        {sublabel && (
          <div className="text-xs text-on-surface-variant mt-0.5">{sublabel}</div>
        )}
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step="any"
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
    <div className={`grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-3 items-center py-3 px-4 border-b border-outline-variant/20 last:border-b-0 ${
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
export default function InflationCalculator() {
  const [primeRate, setPrimeRate] = useState(DEFAULTS.primeRate);
  const [fedFundsRate, setFedFundsRate] = useState(DEFAULTS.fedFundsRate);

  const results = useMemo(
    () => computeInflation({ primeRate, fedFundsRate }),
    [primeRate, fedFundsRate]
  );

  const handleReset = () => {
    setPrimeRate(DEFAULTS.primeRate);
    setFedFundsRate(DEFAULTS.fedFundsRate);
  };

  return (
    <div className="space-y-6">
      {/* ── Salmon Card 1: Contextual Explanation of US Inflations ──────────────── */}
      <div className="bg-secondary-container/20 border border-secondary/30 p-5 rounded-xl space-y-4">
        <h4 className="font-title-lg text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary font-bold">info</span>
          Inflation Types in the United States
        </h4>
        <p className="font-body-md text-on-surface-variant leading-relaxed">
          In the United States, there are three types of inflation and a fourth that is a weighting of the previous three.
        </p>
        <div className="space-y-3 pl-2 border-l-2 border-secondary/30">
          <div>
            <span className="font-bold text-primary text-sm">1. Consumer Price Index (CPI):</span>
            <p className="text-xs text-on-surface-variant mt-0.5">
              The first inflation is the Consumer Price Index (CPI) and is not relevant to the capital market.
            </p>
          </div>
          <div>
            <span className="font-bold text-primary text-sm">2. Personal Consumption Expenditures (PCE):</span>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Excluding Food and Energy (Chain-Type Price Index). It is used to measure the real economy, represents quarterly inflation in percentage terms, and is measured as an average of the four current quarters. It serves as an inflationary basis for calculating models based on the real economy (growth, money supply M1, quantitative easing QE, or M0).
              <br />
              <em className="text-secondary/80 font-medium">Example (March 2026): Average PCE for the last 4 quarters is 2.9%</em>
            </p>
          </div>
          <div>
            <span className="font-bold text-primary text-sm">3. Financial Inflation:</span>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Derived from the prime interest rate. It is used to calculate interest rates on foreign currency government bonds and computational models that do not measure the real economy.
            </p>
          </div>
        </div>
      </div>

      {/* ── Step 1: Financial Inflation Engine ────────────────────────────────── */}
      <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <StepHeader label="Step 1 — Financial Inflation Engine" icon="calculate" />
        
        <ParamRow
          label="Prime Rate"
          sublabel="Current prime interest rate (to update)"
          value={primeRate}
          onChange={setPrimeRate}
          suffix="%"
        />
        
        <OperationIndicator op="-" />
        
        <ParamRow
          label="Fed Funds Rate"
          sublabel="Current Federal Funds rate (to update)"
          value={fedFundsRate}
          onChange={setFedFundsRate}
          suffix="%"
        />
        
        <ResultRow
          label="Internal Middle Calculation (Prime - Fed Funds)"
          value={fmt(results.internalMiddleCalculation, 2) + '%'}
          highlight
        />
        
        <OperationIndicator op="-" />
        
        <ParamRow
          label="Fixed Risk Premium"
          sublabel="Constant risk premium coefficient"
          value={FIXED_RISK_PREMIUM}
          onChange={() => {}}
          disabled
          suffix="%"
        />
        
        <ResultRow
          label="Financial Inflation (Result - Fixed Risk Premium)"
          value={fmt(results.financialInflation, 2) + '%'}
          highlight
          large
        />
      </div>

      {/* ── Salmon Card 2: Explanation of Bias Research ─────────────────────── */}
      <div className="bg-secondary-container/20 border border-secondary/30 p-5 rounded-xl space-y-3">
        <h4 className="font-title-lg text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary font-bold">library_books</span>
          Explanation of the Calculation Bias
        </h4>
        <blockquote className="font-body-md text-on-surface-variant italic leading-relaxed border-l-4 border-secondary/50 pl-4 py-1">
          "Measuring Inflation: A Guide to the Issues" by John Williams, a senior economist at the Fed (Federal Bank of St. Louis). In this paper, he discusses biases in measuring inflation, including standard deviations ranging from 0.15% to 0.4%, and explains how measurement methods and price valuation affect the results.
        </blockquote>
        <p className="font-body-md text-on-surface-variant leading-relaxed">
          It is accepted that the inflation bias is in the range of 0.15 to 0.4 percent. The model calculates the bias index below using a standard probability weighting:
        </p>
      </div>

      {/* ── Step 2: Calculation Bias Model ──────────────────────────────────── */}
      <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <StepHeader label="Step 2 — Calculation Bias Model" icon="analytics" color="bg-primary-container" />
        
        <ParamRow
          label="Bias Element 1"
          sublabel="Lower limit of known research bias"
          value={BIAS_ELEMENT_1}
          onChange={() => {}}
          disabled
          suffix="%"
        />
        
        <OperationIndicator op="+" />
        
        <ParamRow
          label="Bias Element 2"
          sublabel="Upper limit of known research bias"
          value={BIAS_ELEMENT_2}
          onChange={() => {}}
          disabled
          suffix="%"
        />
        
        <OperationIndicator op="+" />
        
        <ParamRow
          label="Bias Element 3 (My Calculation)"
          sublabel="Assumption of zero bias scenario"
          value={BIAS_ELEMENT_3}
          onChange={() => {}}
          disabled
          suffix="%"
        />
        
        <ResultRow
          label="Total Bias"
          value={fmt(results.totalBias, 2) + '%'}
        />
        
        <OperationIndicator op="÷" />
        
        <ParamRow
          label="Number of Elements"
          sublabel="Three elements of bias"
          value={NUMBER_OF_ELEMENTS}
          onChange={() => {}}
          disabled
        />
        
        <ResultRow
          label="Average Bias"
          value={fmt(results.averageBias, 10) + '%'}
          highlight
        />
        
        <OperationIndicator op="×" />
        
        <ParamRow
          label="Probability of Bias Up/Down"
          sublabel="Fixed probability (0.5)"
          value={PROBABILITY_BIAS_UP_DOWN}
          onChange={() => {}}
          disabled
        />
        
        <ResultRow
          label="This is the bias I use for financial inflation (Final Applied Bias)"
          value={fmt(results.finalAppliedBias, 10) + '%'}
          highlight
          large
        />
        
        <div className="px-4 py-3 bg-surface-container-low text-xs text-on-surface-variant font-label-sm border-t border-outline-variant/20">
          * Circled/rounded to 0.1% in standard calculations: <strong>{fmt(results.finalAppliedBias * 1.0, 1)}%</strong>
        </div>
      </div>

      {/* ── Salmon Card 3: Disclaimer & Continuity ───────────────────────────── */}
      <div className="bg-secondary-container/10 border border-outline-variant p-5 rounded-xl space-y-3">
        <p className="text-xs text-on-surface-variant italic">
          "I will raise the fourth inflation, which is the weighting of all inflations, later."
        </p>
        <div className="pt-3 border-t border-outline-variant/30 text-xs text-on-surface-variant/80">
          Disclaimer: Information provided is for educational and perspective purposes only and does not constitute financial advice. Past performance of the DJIA or any other asset is not indicative of future results. c All rights reserved.
        </div>
      </div>

      {/* ── Reset Controls ─────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="flex-1 border border-primary text-primary py-3 px-4 font-bold flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors rounded-lg"
        >
          <span className="material-symbols-outlined text-[20px]">refresh</span>
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
