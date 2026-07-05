/** Shows CORTEX + corpus-tuned SLM provider. */
export function ProviderBadge({ provider }: { provider?: string }) {
  if (!provider) return null;
  const isLlm = provider.includes("+") && !provider.includes("fallback");
  const isFallback = provider.includes("fallback");
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[0.6rem] tracking-wide uppercase ${
        isLlm
          ? "border border-emerald-700/25 bg-emerald-50/90 text-emerald-800"
          : isFallback
            ? "border border-amber-700/25 bg-amber-50/90 text-amber-900"
            : "border border-sky-700/20 bg-sky-50/90 text-sky-900/80"
      }`}
      title={
        isLlm
          ? "CORTEX draft polished by corpus-tuned leonardo-museum on EC2"
          : isFallback
            ? "SLM busy — showing CORTEX draft"
            : "CORTEX draft"
      }
    >
      {provider}
    </span>
  );
}
