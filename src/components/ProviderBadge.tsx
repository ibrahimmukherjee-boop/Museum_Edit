/** Shows whether CORTEX-only or LLM-polished reply was used. */
export function ProviderBadge({ provider }: { provider?: string }) {
  if (!provider) return null;
  const isLlm = provider.includes("+");
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[0.6rem] tracking-wide uppercase ${
        isLlm
          ? "border border-emerald-700/25 bg-emerald-50/90 text-emerald-800"
          : "border border-amber-800/20 bg-amber-50/80 text-amber-900/70"
      }`}
      title={isLlm ? "CORTEX draft polished by local Qwen" : "CORTEX draft only — LLM polish did not run"}
    >
      {provider}
    </span>
  );
}
