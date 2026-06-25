const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be", "been", "to", "of", "in", "on", "at", "by", "for", "with", "from", "as", "this", "that", "it", "you", "i", "my", "your", "how", "what", "why", "when", "where", "who",
]);

function tokenise(text: string): string[] {
  return (text || "").toLowerCase().replace(/[^a-z0-9\s'-]+/g, " ").split(/\s+/).filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

interface Doc {
  id: string;
  text: string;
  meta: { title: string; kind: string; domain: string };
  tokens: string[];
  tf: Map<string, number>;
  len: number;
}

export class BM25 {
  private docs: Doc[] = [];
  private avgLen = 0;
  private df = new Map<string, number>();
  private k1 = 1.5;
  private b = 0.75;

  add(id: string, text: string, meta: Doc["meta"]) {
    const tokens = tokenise(text);
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    this.docs.push({ id, text, meta, tokens, tf, len: tokens.length });
    for (const t of new Set(tokens)) this.df.set(t, (this.df.get(t) ?? 0) + 1);
    this.avgLen = this.docs.reduce((s, d) => s + d.len, 0) / (this.docs.length || 1);
  }

  search(query: string, topK = 5) {
    const qt = tokenise(query);
    if (!qt.length) return [];
    const N = this.docs.length;
    const out: { id: string; text: string; meta: Doc["meta"]; score: number }[] = [];
    for (const d of this.docs) {
      let score = 0;
      for (const t of qt) {
        const df = this.df.get(t) ?? 0;
        if (!df) continue;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        const f = d.tf.get(t) ?? 0;
        if (!f) continue;
        const denom = f + this.k1 * (1 - this.b + this.b * (d.len / (this.avgLen || 1)));
        score += idf * ((f * (this.k1 + 1)) / denom);
      }
      if (score > 0) out.push({ id: d.id, text: d.text, meta: d.meta, score });
    }
    return out.sort((a, b) => b.score - a.score).slice(0, topK);
  }
}
