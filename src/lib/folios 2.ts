import { FOLIO_SCROLL, type WebFolio } from "../data/museumCorpus";
import type { LeonardoZone } from "../cortex/types";

export type { WebFolio };

export function foliosForDomain(domain: LeonardoZone): WebFolio[] {
  return FOLIO_SCROLL.filter((f) => f.domain === domain);
}

export function imageUrl(imageKey: string): string {
  const base = import.meta.env.BASE_URL ?? "./";
  return `${base}art/${imageKey}.jpg`;
}

export function imageUrlWithFallback(imageKey: string): string {
  const base = import.meta.env.BASE_URL ?? "./";
  return `${base}art/${imageKey}.png`;
}

export function resolveArtUrl(imageKey: string): string {
  return `${import.meta.env.BASE_URL ?? "./"}art/${imageKey}.jpg`;
}
