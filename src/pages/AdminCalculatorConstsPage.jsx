import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CALCULATOR_CONST_DEFINITIONS,
  getCalculatorDefaults,
} from '../config/calculatorConstDefinitions';
import { isFirebaseConfigured } from '../lib/firebase';
import {
  saveCalculatorConsts,
  watchCalculatorConsts,
} from '../services/calculatorConstsService';

function buildInitialValues() {
  return CALCULATOR_CONST_DEFINITIONS.reduce((acc, calculator) => {
    acc[calculator.id] = getCalculatorDefaults(calculator.id);
    return acc;
  }, {});
}

function normalizeValues(definition, values, fallbackValues) {
  const normalized = { ...fallbackValues };

  definition.fields.forEach((field) => {
    const rawValue = values?.[field.key];
    const numericValue = Number(rawValue);
    normalized[field.key] = Number.isFinite(numericValue)
      ? numericValue
      : fallbackValues[field.key];
  });

  return normalized;
}

function validateFieldValue(field, value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return `${field.label}: must be a valid number.`;
  }
  if (field.integer && !Number.isInteger(numericValue)) {
    return `${field.label}: must be an integer.`;
  }
  if (field.min !== undefined && numericValue < field.min) {
    return `${field.label}: must be greater than or equal to ${field.min}.`;
  }
  if (field.max !== undefined && numericValue > field.max) {
    return `${field.label}: must be less than or equal to ${field.max}.`;
  }
  return '';
}

export default function AdminCalculatorConstsPage() {
  const [activeCalculatorId, setActiveCalculatorId] = useState(
    CALCULATOR_CONST_DEFINITIONS[0]?.id || '',
  );
  const [valuesByCalculator, setValuesByCalculator] = useState(() => buildInitialValues());
  const [savingCalculatorId, setSavingCalculatorId] = useState('');
  const [errorByCalculator, setErrorByCalculator] = useState({});
  const [noticeByCalculator, setNoticeByCalculator] = useState({});
  const [defaultsLoadedByCalculator, setDefaultsLoadedByCalculator] = useState({});
  const defaultsLoadedTimersRef = useRef({});

  const activeDefinition = useMemo(
    () => CALCULATOR_CONST_DEFINITIONS.find((item) => item.id === activeCalculatorId) || null,
    [activeCalculatorId],
  );

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return undefined;
    }

    const unsubscribers = CALCULATOR_CONST_DEFINITIONS.map((definition) => {
      const fallbackValues = getCalculatorDefaults(definition.id);
      return watchCalculatorConsts(
        definition.id,
        (docData) => {
          const nextValues = normalizeValues(definition, docData?.values, fallbackValues);
          setValuesByCalculator((current) => ({
            ...current,
            [definition.id]: nextValues,
          }));
        },
        (error) => {
          setErrorByCalculator((current) => ({
            ...current,
            [definition.id]: error.message || 'Failed to load calculator constants.',
          }));
        },
      );
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(defaultsLoadedTimersRef.current).forEach((timerId) => {
        if (timerId) {
          clearTimeout(timerId);
        }
      });
    };
  }, []);

  const activeValues = valuesByCalculator[activeCalculatorId] || {};

  const handleValueChange = (fieldKey, nextValue) => {
    setValuesByCalculator((current) => ({
      ...current,
      [activeCalculatorId]: {
        ...current[activeCalculatorId],
        [fieldKey]: nextValue,
      },
    }));

    setNoticeByCalculator((current) => ({
      ...current,
      [activeCalculatorId]: '',
    }));
  };

  const handleResetDefaults = () => {
    if (!activeDefinition) {
      return;
    }

    const fallbackValues = getCalculatorDefaults(activeDefinition.id);
    setValuesByCalculator((current) => ({
      ...current,
      [activeDefinition.id]: fallbackValues,
    }));

    setErrorByCalculator((current) => ({ ...current, [activeDefinition.id]: '' }));
    setNoticeByCalculator((current) => ({
      ...current,
      [activeDefinition.id]: 'Defaults loaded locally. Click Save to persist.',
    }));

    setDefaultsLoadedByCalculator((current) => ({
      ...current,
      [activeDefinition.id]: true,
    }));

    if (defaultsLoadedTimersRef.current[activeDefinition.id]) {
      clearTimeout(defaultsLoadedTimersRef.current[activeDefinition.id]);
    }

    defaultsLoadedTimersRef.current[activeDefinition.id] = setTimeout(() => {
      setDefaultsLoadedByCalculator((current) => ({
        ...current,
        [activeDefinition.id]: false,
      }));
      defaultsLoadedTimersRef.current[activeDefinition.id] = null;
    }, 1800);
  };

  const handleSave = async () => {
    if (!activeDefinition) {
      return;
    }

    const currentValues = valuesByCalculator[activeDefinition.id] || {};
    const validationErrors = activeDefinition.fields
      .map((field) => validateFieldValue(field, currentValues[field.key]))
      .filter(Boolean);

    if (validationErrors.length > 0) {
      setErrorByCalculator((current) => ({
        ...current,
        [activeDefinition.id]: validationErrors.join(' '),
      }));
      setNoticeByCalculator((current) => ({ ...current, [activeDefinition.id]: '' }));
      return;
    }

    const payload = activeDefinition.fields.reduce((acc, field) => {
      acc[field.key] = Number(currentValues[field.key]);
      return acc;
    }, {});

    try {
      setSavingCalculatorId(activeDefinition.id);
      setErrorByCalculator((current) => ({ ...current, [activeDefinition.id]: '' }));
      await saveCalculatorConsts(activeDefinition.id, payload);
      setNoticeByCalculator((current) => ({
        ...current,
        [activeDefinition.id]: 'Saved successfully.',
      }));
    } catch (error) {
      setErrorByCalculator((current) => ({
        ...current,
        [activeDefinition.id]: error.message || 'Failed to save calculator constants.',
      }));
    } finally {
      setSavingCalculatorId('');
    }
  };

  if (!activeDefinition) {
    return null;
  }

  return (
    <section className="space-y-4">
      <header className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
        <h2 className="font-headline-sm text-primary">Calculator Consts Manager</h2>
        <p className="font-body-md text-on-surface-variant mt-2">
          Excel workbook tabs detected for built calculators: Bank value calculation, Calculating inflation,
          Market value of tradable shares.
        </p>
      </header>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-2 flex flex-wrap gap-2">
        {CALCULATOR_CONST_DEFINITIONS.map((calculator) => (
          <button
            key={calculator.id}
            type="button"
            onClick={() => setActiveCalculatorId(calculator.id)}
            className={`px-4 py-2 rounded-lg font-label-sm ${
              activeCalculatorId === calculator.id
                ? 'bg-primary text-on-primary'
                : 'bg-white text-on-surface border border-outline-variant'
            }`}
          >
            {calculator.label}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-title-lg text-primary">{activeDefinition.label}</h3>
            <p className="font-label-sm text-on-surface-variant">
              Source workbook tab: {activeDefinition.sourceTab}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className={`border rounded-lg px-4 py-2 font-label-sm transition-colors ${
                defaultsLoadedByCalculator[activeDefinition.id]
                  ? 'border-secondary bg-secondary text-on-secondary'
                  : 'border-outline-variant'
              }`}
            >
              {defaultsLoadedByCalculator[activeDefinition.id]
                ? 'Defaults Loaded'
                : 'Load Defaults'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={savingCalculatorId === activeDefinition.id}
              className="bg-primary text-on-primary rounded-lg px-4 py-2 font-label-sm disabled:opacity-70"
            >
              {savingCalculatorId === activeDefinition.id ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeDefinition.fields.map((field) => (
            <label
              key={field.key}
              className="block rounded-xl border border-outline-variant bg-white p-4 space-y-2"
            >
              <span className="block font-label-sm text-primary">{field.label}</span>
              <span className="block text-xs text-on-surface-variant">{field.description}</span>
              <input
                type="number"
                step={field.step ?? 'any'}
                min={field.min}
                max={field.max}
                value={activeValues[field.key] ?? ''}
                onChange={(event) => handleValueChange(field.key, event.target.value)}
                className="w-full border border-outline-variant rounded-lg px-3 py-2 text-sm"
              />
            </label>
          ))}
        </div>

        {errorByCalculator[activeDefinition.id] && (
          <p className="text-error font-label-sm">{errorByCalculator[activeDefinition.id]}</p>
        )}
        {noticeByCalculator[activeDefinition.id] && (
          <p className="text-secondary font-label-sm">{noticeByCalculator[activeDefinition.id]}</p>
        )}
      </div>
    </section>
  );
}
