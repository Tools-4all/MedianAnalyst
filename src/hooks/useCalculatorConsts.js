import { useEffect, useMemo, useState } from 'react';
import { isFirebaseConfigured } from '../lib/firebase';
import { watchCalculatorConsts } from '../services/calculatorConstsService';

function normalizeNumericValues(values, fallbackValues) {
  if (!values || typeof values !== 'object') {
    return fallbackValues;
  }

  const normalized = { ...fallbackValues };

  Object.keys(fallbackValues).forEach((key) => {
    const nextValue = Number(values[key]);
    normalized[key] = Number.isFinite(nextValue) ? nextValue : fallbackValues[key];
  });

  return normalized;
}

function useCalculatorConsts(calculatorId, defaultValues) {
  const stableDefaults = useMemo(() => ({ ...defaultValues }), [defaultValues]);
  const [config, setConfig] = useState(stableDefaults);
  const [isLoading, setIsLoading] = useState(Boolean(isFirebaseConfigured));

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return undefined;
    }

    const unsubscribe = watchCalculatorConsts(
      calculatorId,
      (docData) => {
        const merged = normalizeNumericValues(docData?.values, stableDefaults);
        setConfig(merged);
        setIsLoading(false);
      },
      () => {
        setConfig(stableDefaults);
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [calculatorId, stableDefaults]);

  return { config, isLoading };
}

export default useCalculatorConsts;