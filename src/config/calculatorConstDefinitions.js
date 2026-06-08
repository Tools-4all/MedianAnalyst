const CALCULATOR_CONST_DEFINITIONS = [
  {
    id: 'bank-value',
    label: 'Bank Value Calculation',
    sourceTab: 'Bank value calculation',
    fields: [
      {
        key: 'baseEquity',
        label: 'Base Equity',
        description: 'Fixed baseline equity used in step A.',
        defaultValue: 100,
        min: 0,
        step: 0.01,
      },
      {
        key: 'financialMultiplier',
        label: 'Financial Multiplier',
        description: 'Multiplier that converts nominal growth into asset value.',
        defaultValue: 2.71,
        min: 0,
        step: 0.01,
      },
      {
        key: 'defaultDividendPct',
        label: 'Default Dividend %',
        description: 'Default starting value for average dividend percentage input.',
        defaultValue: 4,
        min: 0,
        step: 0.01,
      },
      {
        key: 'defaultRealGrowth',
        label: 'Default Real Growth',
        description: 'Default FOMC long-term real growth input.',
        defaultValue: 1.9,
        min: 0,
        step: 0.01,
      },
      {
        key: 'defaultPceIndex',
        label: 'Default PCE Index',
        description: 'Default average quarterly PCE index input.',
        defaultValue: 2.9,
        min: 0,
        step: 0.01,
      },
      {
        key: 'defaultInterestRate',
        label: 'Default Interest Rate',
        description: 'Default Machete-derived interest input.',
        defaultValue: 4.93,
        min: 0,
        step: 0.01,
      },
    ],
  },
  {
    id: 'inflation',
    label: 'Calculating Inflation',
    sourceTab: 'Calculating inflation',
    fields: [
      {
        key: 'fixedRiskPremium',
        label: 'Fixed Risk Premium',
        description: 'Step 1 fixed risk premium value.',
        defaultValue: 1.5,
        min: 0,
        step: 0.01,
      },
      {
        key: 'biasElement1',
        label: 'Bias Element 1',
        description: 'Lower limit of known bias from research.',
        defaultValue: 0.15,
        min: 0,
        step: 0.01,
      },
      {
        key: 'biasElement2',
        label: 'Bias Element 2',
        description: 'Upper limit of known bias from research.',
        defaultValue: 0.4,
        min: 0,
        step: 0.01,
      },
      {
        key: 'biasElement3',
        label: 'Bias Element 3',
        description: 'Custom model bias component.',
        defaultValue: 0,
        min: 0,
        step: 0.01,
      },
      {
        key: 'numberOfElements',
        label: 'Number Of Elements',
        description: 'Element count used in average bias formula.',
        defaultValue: 3,
        min: 1,
        step: 1,
        integer: true,
      },
      {
        key: 'probabilityBiasUpDown',
        label: 'Probability Bias Up/Down',
        description: 'Probability multiplier applied to average bias.',
        defaultValue: 0.5,
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        key: 'defaultPrimeRate',
        label: 'Default Prime Rate',
        description: 'Default Prime Rate input value.',
        defaultValue: 6.75,
        min: 0,
        step: 0.01,
      },
      {
        key: 'defaultFedFundsRate',
        label: 'Default Fed Funds Rate',
        description: 'Default Fed Funds Rate input value.',
        defaultValue: 3.64,
        min: 0,
        step: 0.01,
      },
    ],
  },
  {
    id: 'market-value',
    label: 'Market Value Of Tradable Shares',
    sourceTab: 'Market value of tradable shares',
    fields: [
      {
        key: 'timeRoot250Days',
        label: 'Time Root (250 Days)',
        description: 'Square root of 250 trading days.',
        defaultValue: 15.81,
        min: 0,
        step: 0.01,
      },
      {
        key: 'govActivityCoefficient',
        label: 'Government Activity Coefficient',
        description: 'Multiplier used in debt-to-GDP transformation.',
        defaultValue: 2.5,
        min: 0,
        step: 0.01,
      },
      {
        key: 'hundredPercent',
        label: '100 Percent Constant',
        description: 'Base percent constant used in expected return formula.',
        defaultValue: 100,
        min: 1,
        step: 1,
      },
      {
        key: 'defaultCorporateEquities',
        label: 'Default Corporate Equities',
        description: 'Default Corporate Equities input value.',
        defaultValue: 47185,
        min: 0,
        step: 1,
      },
      {
        key: 'defaultCurrentGDP',
        label: 'Default Current GDP',
        description: 'Default Current GDP input value.',
        defaultValue: 31442,
        min: 0.0001,
        step: 1,
      },
      {
        key: 'defaultMarketableTreasuryDebt',
        label: 'Default Marketable Treasury Debt',
        description: 'Default Marketable Treasury Debt input value.',
        defaultValue: 29299,
        min: 0,
        step: 1,
      },
      {
        key: 'defaultFederalBudgetDeficit',
        label: 'Default Federal Budget Deficit',
        description: 'Default Federal Budget Deficit input value.',
        defaultValue: 1853,
        min: 0,
        step: 1,
      },
      {
        key: 'defaultInflationFromPrime',
        label: 'Default Inflation From Prime',
        description: 'Default inflation-from-prime input value.',
        defaultValue: 1.61,
        min: 0,
        step: 0.01,
      },
      {
        key: 'defaultMovingAverageDJIA',
        label: 'Default Moving Average DJIA',
        description: 'Default moving average DJIA input value.',
        defaultValue: 48000,
        min: 0,
        step: 1,
      },
    ],
  },
];

function getCalculatorDefinitionById(calculatorId) {
  return CALCULATOR_CONST_DEFINITIONS.find((item) => item.id === calculatorId) || null;
}

function getCalculatorDefaults(calculatorId) {
  const definition = getCalculatorDefinitionById(calculatorId);
  if (!definition) {
    return {};
  }

  return definition.fields.reduce((acc, field) => {
    acc[field.key] = field.defaultValue;
    return acc;
  }, {});
}

export {
  CALCULATOR_CONST_DEFINITIONS,
  getCalculatorDefaults,
  getCalculatorDefinitionById,
};