
export default function CalculatorDisclaimer() {
  return (
    <div className="mt-12 p-6 bg-surface-container-low border border-outline-variant rounded-xl border-l-4 border-l-secondary shadow-sm">
      <div className="flex gap-4 items-start">
        <span className="material-symbols-outlined text-secondary text-2xl shrink-0 mt-0.5">
          gavel
        </span>
        <div className="space-y-3">
          <h5 className="font-title-lg text-primary text-sm font-bold uppercase tracking-wider">
            Disclaimer
          </h5>
          <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
            Information provided is for educational and perspective purposes only and does not constitute financial advice. Past performance of the DJIA or any other asset is not indicative of future results.
          </p>
          <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
            Wherever the DJIA index is mentioned, it is for demonstration and perspective only. You can adjust it to any index of your choice.
          </p>
          <div className="h-px bg-outline-variant/50 my-2" />
          <p className="text-xs text-on-surface-variant/60 font-semibold">
            &copy; {new Date().getFullYear()} MedianAnalyst. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
