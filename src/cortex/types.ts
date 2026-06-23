export type LeonardoZone = "art" | "anatomy" | "engineering" | "general";

export interface CortexFact {
  subject: string;
  predicate: string;
  object: string;
  source: string;
  confidence: number;
}

export interface CortexMemory {
  sessionId: string;
  visitorName: string;
  workingMemory: string[];
  folioId?: string;
  folioTitle?: string;
}

export interface CortexInput {
  question: string;
  history: { role: "user" | "assistant"; content: string }[];
  memory: CortexMemory;
  folioContext?: { title: string; body: string; domain?: LeonardoZone };
  hotspotLabel?: string;
}

export interface ReasoningTrace {
  zone: LeonardoZone;
  plan: string[];
  facts: CortexFact[];
  insights: string[];
  risks: string[];
  criticNotes: string[];
  verification: { reasoning: number; evidence: number; contradiction: number };
  recommendation: string;
}

export interface CortexOutput {
  reply: string;
  trace: ReasoningTrace;
  provider: "cortex" | "cortex+llm" | "demo";
}
