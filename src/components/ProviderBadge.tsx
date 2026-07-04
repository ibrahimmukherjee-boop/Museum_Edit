/** Shows whether CORTEX-only (fast) or SLM-polished reply was used. */
export function ProviderBadge({ provider }: { provider?: string }) {
  if (!provider) return null;
  const isLlm = provider.includes("+");
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[0.6rem] tracking-wide uppercase ${
        isLlm
          ? "border border-emerald-700/25 bg-emerald-50/90 text-emerald-800"
          : "border border-sky-700/20 bg-sky-50/90 text-sky-900/80"
      }`}
      title={
        isLlm
          ? "CORTEX draft polished by qwen2.5:3b on EC2"
          : "Instant CORTEX — personality + corpus RAG (sub-second)"
      }
    >
      {isLlm ? provider : `${provider} · fast`}
    </span>
  );
}
