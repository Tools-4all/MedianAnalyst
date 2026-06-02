import React, { useState, useMemo } from 'react';

/**
 * MarketValueCalculator
 * 
 * Official Title: Market value of tradable shares relative to GDP.
 * 
 * Implements the exact 3-step calculation model from the spreadsheet tab.
 * 
 * Step 1: Calculate the Risk (Capital-to-GDP → Annual Risk/Volatility)
 * Step 2: Calculate the Odds (Marketable Debt → Alternative Interest Rate)
 * Step 3: Calculate the Odds Ratio (Expected Return → Balance Rate)
 * 
 * Color-Code Mapping:
 *   Pink/Grey [Input]     → React useState variables
 *   Light Blue [Constant] → JavaScript const
 *   Light Green [Result]  → Derived dynamically via useMemo
 *   Orange [Operation]    → UI operation indicators
 *   Salmon [Explanation]  → UI labels and tooltips
 */

// ─── Constants from the spreadsheet (Light Blue cells) ───────────────────────
const TIME_ROOT_250_DAYS = 15.81;       // Row 12: √250 trading days
const GOV_ACTIVITY_COEFFICIENT = 2.5;   // Row 26: Government Activity Coefficient
const HUNDRED_PERCENT = 100;            // Row 35: 100%

// ─── Default user-input values (Pink / Grey cells) ──────────────────────────
const DEFAULTS = {
  corporateEquities: 47185,       // Row 6: Corporate Equities (in thousands of billions)
  currentGDP: 31442,              // Row 9/23: Current GDP in the last quarter
  marketableTreasuryDebt: 29299,  // Row 18: Market Value of Marketable Treasury Debt
  federalBudgetDeficit: 1853,     // Row 20: The federal budget deficit
  inflationFromPrime: 1.61,       // Row 29: Inflation derived from the prime
  movingAverageDJIA: 48000,       // Row 43: Moving average of DJIA index (last 3 months)
};

// ─── Pure calculation engine ─────────────────────────────────────────────────
function computeMarketValue({
  corporateEquities,
  currentGDP,
  marketableTreasuryDebt,
  federalBudgetDeficit,
  inflationFromPrime,
  movingAverageDJIA,
}) {
  // Validate & sanitize all inputs
  const ce   = Math.max(0, corporateEquities || 0);
  const gdp  = Math.max(0.0001, currentGDP || 0.0001);   // prevent division by zero
  const mtd  = Math.max(0, marketableTreasuryDebt || 0);
  const fbd  = Math.max(0, federalBudgetDeficit || 0);
  const ifp  = Math.max(0, inflationFromPrime || 0);
  const djia = Math.max(0, movingAverageDJIA || 0);

  // ── Step 1: Calculate the Risk ─────────────────────────────────────────────
  // Row 10: Capital-to-GDP Ratio = Corporate Equities ÷ Current GDP
  const capitalToGDPRatio = ce / gdp;

  // Row 13: Annual Risk = Capital-to-GDP Ratio × √250 trading days (15.81)
  const annualRisk = capitalToGDPRatio * TIME_ROOT_250_DAYS;

  // ── Step 2: Calculate the Odds ─────────────────────────────────────────────
  // Row 21: Total Marketable Debt = Marketable Treasury Debt + Federal Budget Deficit
  const totalMarketableDebt = mtd + fbd;

  // Row 24: Marketable Debt-to-GDP Ratio = (Total Marketable Debt ÷ Current GDP) × 100
  const marketableDebtToGDP = (totalMarketableDebt / gdp) * 100;

  // Row 27: Marketable Debt Ratio = (Marketable Debt-to-GDP Ratio × 2.5) ÷ 100
  const marketableDebtRatio = (marketableDebtToGDP * GOV_ACTIVITY_COEFFICIENT) / 100;

  // Row 30: Alternative Interest Rate = Marketable Debt Ratio × Inflation from Prime
  const alternativeInterestRate = marketableDebtRatio * ifp;

  // ── Step 3: Calculate the Odds Ratio ───────────────────────────────────────
  // Row 38: Expected Return = 100 ÷ Alternative Interest Rate
  const expectedReturn = alternativeInterestRate > 0
    ? HUNDRED_PERCENT / alternativeInterestRate
    : 0;

  // Row 41: Expected Movement = Expected Return ÷ Annual Risk
  const expectedMovement = annualRisk > 0
    ? expectedReturn / annualRisk
    : 0;

  // Row 44: Balance Rate = Expected Movement × Moving Average of DJIA
  const balanceRate = expectedMovement * djia;

  return {
    // Step 1
    capitalToGDPRatio,
    annualRisk,
    // Step 2
    totalMarketableDebt,
    marketableDebtToGDP,
    marketableDebtRatio,
    alternativeInterestRate,
    // Step 3
    expectedReturn,
    expectedMovement,
    balanceRate,
  };
}

// ─── Formatting helpers ──────────────────────────────────────────────────────
const fmt = (v, decimals = 2) => {
  if (v === null || v === undefined || isNaN(v) || !isFinite(v)) return '—';
  return v.toFixed(decimals);
};

const fmtInt = (v) => {
  if (v === null || v === undefined || isNaN(v) || !isFinite(v)) return '—';
  return Math.round(v).toLocaleString('en-US');
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
export default function MarketValueCalculator() {
  const [corporateEquities, setCorporateEquities]       = useState(DEFAULTS.corporateEquities);
  const [currentGDP, setCurrentGDP]                     = useState(DEFAULTS.currentGDP);
  const [marketableTreasuryDebt, setMarketableTreasuryDebt] = useState(DEFAULTS.marketableTreasuryDebt);
  const [federalBudgetDeficit, setFederalBudgetDeficit] = useState(DEFAULTS.federalBudgetDeficit);
  const [inflationFromPrime, setInflationFromPrime]     = useState(DEFAULTS.inflationFromPrime);
  const [movingAverageDJIA, setMovingAverageDJIA]       = useState(DEFAULTS.movingAverageDJIA);

  const results = useMemo(
    () => computeMarketValue({
      corporateEquities, currentGDP, marketableTreasuryDebt,
      federalBudgetDeficit, inflationFromPrime, movingAverageDJIA,
    }),
    [corporateEquities, currentGDP, marketableTreasuryDebt,
     federalBudgetDeficit, inflationFromPrime, movingAverageDJIA]
  );

  const handleReset = () => {
    setCorporateEquities(DEFAULTS.corporateEquities);
    setCurrentGDP(DEFAULTS.currentGDP);
    setMarketableTreasuryDebt(DEFAULTS.marketableTreasuryDebt);
    setFederalBudgetDeficit(DEFAULTS.federalBudgetDeficit);
    setInflationFromPrime(DEFAULTS.inflationFromPrime);
    setMovingAverageDJIA(DEFAULTS.movingAverageDJIA);
  };

  return (
    <div className="space-y-6">
      {/* ── Required Explanation Callout ────────────────────────────────────── */}
      <div className="bg-secondary-container/20 border border-secondary/30 p-5 rounded-xl">
        <h4 className="font-title-lg text-primary mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">bar_chart</span>
          Market Value of Tradable Shares Relative to GDP
        </h4>
        <p className="font-body-md text-on-surface-variant leading-relaxed italic">
          "In capital market courses, the idea called the "Buffet indicator" is taught, which measures the ratio between the value of tradable shares and GDP without explanation or continuation. I developed it in several layers and this is how I calculate. (I rarely use this calculation because it relies on market value rather than macro data)"
        </p>
      </div>

      {/* ── Unit Context Note ──────────────────────────────────────────────── */}
      <div className="px-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg">
        <p className="text-xs text-on-surface-variant font-label-sm">
          <span className="material-symbols-outlined text-xs align-middle mr-1">info</span>
          All monetary values are in <strong>thousands of billions</strong> (as per the source model).
        </p>
      </div>

      {/* ── Step 1: Calculate the Risk ──────────────────────────────────────── */}
      <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <StepHeader label="Step 1 — Calculate the Risk" icon="warning" />
        <ParamRow
          label="Corporate Equities"
          sublabel="Link to L_101 — Row 15 (to update)"
          value={corporateEquities}
          onChange={setCorporateEquities}
        />
        <OperationIndicator op="÷" />
        <ParamRow
          label="Current GDP in the Last Quarter"
          sublabel="To update periodically"
          value={currentGDP}
          onChange={setCurrentGDP}
        />
        <ResultRow
          label="Capital-to-GDP Ratio (Daily Standard Deviation)"
          value={fmt(results.capitalToGDPRatio)}
          highlight
        />
        <OperationIndicator op="×" />
        <ParamRow
          label="Time Root of 250 Trading Days"
          sublabel="√250 ≈ 15.81 (fixed constant)"
          value={TIME_ROOT_250_DAYS}
          onChange={() => {}}
          disabled
        />
        <ResultRow
          label="Annual Risk (Volatility / Standard Deviation)"
          value={fmt(results.annualRisk)}
          highlight
          large
        />
      </div>

      {/* ── Step 2: Calculating the Odds ───────────────────────────────────── */}
      <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <StepHeader label="Step 2 — Calculating the Odds" icon="casino" color="bg-primary-container" />
        <ParamRow
          label="Market Value of Marketable Treasury Debt"
          sublabel="To update periodically"
          value={marketableTreasuryDebt}
          onChange={setMarketableTreasuryDebt}
        />
        <OperationIndicator op="+" />
        <ParamRow
          label="Federal Budget Deficit"
          sublabel="Indicates future bond issuance (Federal Budget Office / Fed)"
          value={federalBudgetDeficit}
          onChange={setFederalBudgetDeficit}
        />
        <ResultRow
          label="Total Marketable Debt"
          value={fmtInt(results.totalMarketableDebt)}
        />
        <OperationIndicator op="÷" />
        <ParamRow
          label="Current GDP in Dollars"
          sublabel="Same GDP value as Step 1 (to update)"
          value={currentGDP}
          onChange={setCurrentGDP}
        />
        <ResultRow
          label="Marketable Debt-to-GDP Ratio"
          value={fmt(results.marketableDebtToGDP)}
          highlight
        />
        <OperationIndicator op="×" />
        <ParamRow
          label="Government Activity Coefficient"
          sublabel="Fixed at 2.5"
          value={GOV_ACTIVITY_COEFFICIENT}
          onChange={() => {}}
          disabled
        />
        <ResultRow
          label="Marketable Debt Ratio"
          value={fmt(results.marketableDebtRatio, 8)}
        />
        <OperationIndicator op="×" />
        <ParamRow
          label="Inflation Derived from the Prime"
          sublabel="See the Inflation calculator"
          value={inflationFromPrime}
          onChange={setInflationFromPrime}
        />
        <ResultRow
          label="The Alternative Interest Rate"
          value={fmt(results.alternativeInterestRate)}
          highlight
          large
        />
      </div>

      {/* ── Step 3: Calculating the Odds Ratio ─────────────────────────────── */}
      <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <StepHeader label="Step 3 — Calculating the Odds Ratio" icon="balance" color="bg-primary" />
        <ParamRow
          label="100 Percent"
          sublabel="Fixed constant"
          value={HUNDRED_PERCENT}
          onChange={() => {}}
          disabled
        />
        <OperationIndicator op="÷" />
        <ResultRow
          label="The Alternative Interest Rate"
          value={fmt(results.alternativeInterestRate)}
        />
        <ResultRow
          label="Expected Return from the Alternative Interest Rate"
          value={fmt(results.expectedReturn)}
          highlight
        />
        <OperationIndicator op="÷" />
        <ResultRow
          label="Annual Risk (Volatility / Standard Deviation)"
          value={fmt(results.annualRisk)}
        />
        <ResultRow
          label="The Expected Movement"
          value={fmt(results.expectedMovement, 3)}
          highlight
        />
        <OperationIndicator op="×" />
        <ParamRow
          label="Moving Average of DJIA Index (Last 3 Months)"
          sublabel="To update periodically"
          value={movingAverageDJIA}
          onChange={setMovingAverageDJIA}
        />
        <ResultRow
          label="The Balance Rate"
          value={fmt(results.balanceRate, 3)}
          highlight
          large
        />
      </div>

      {/* ── Summary Card ──────────────────────────────────────────────────── */}
      <div className="bg-secondary-container/15 border-l-4 border-l-secondary border border-outline-variant p-6 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="font-headline-sm text-primary mb-1">Balance Rate Summary</h3>
            <p className="text-on-surface-variant text-sm">
              The balance between the opportunity from the alternative interest rate and the risk from the value of shares relative to GDP.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display-lg text-primary">{fmtInt(results.balanceRate)}</span>
            </div>
            <div className="text-on-surface-variant font-label-sm">
              DJIA Balance Rate
            </div>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-outline-variant/30 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white/60 rounded-lg">
            <div className="text-xs text-on-surface-variant mb-1 font-label-sm">Annual Risk</div>
            <div className="font-data-tabular font-bold text-primary">{fmt(results.annualRisk)}</div>
          </div>
          <div className="p-3 bg-white/60 rounded-lg border-2 border-secondary/20">
            <div className="text-xs text-secondary mb-1 font-label-sm">Alt. Interest Rate</div>
            <div className="font-data-tabular font-bold text-secondary text-lg">{fmt(results.alternativeInterestRate)}</div>
          </div>
          <div className="p-3 bg-white/60 rounded-lg">
            <div className="text-xs text-on-surface-variant mb-1 font-label-sm">Expected Movement</div>
            <div className="font-data-tabular font-bold text-primary">{fmt(results.expectedMovement, 3)}</div>
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
