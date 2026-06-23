import { useState } from "react";
import { hotspotsForFolio, type Hotspot } from "../lib/hotspots";

interface Props {
  folioId: string;
  imageKey: string;
  onHotspot: (prompt: string, label: string) => void;
}

export function HotspotOverlay({ folioId, imageKey, onHotspot }: Props) {
  const hotspots = hotspotsForFolio(folioId);
  const src = `${import.meta.env.BASE_URL}art/${imageKey}.jpg`;
  const srcPng = `${import.meta.env.BASE_URL}art/${imageKey}.png`;

  return (
    <div className="hotspot-frame">
      <img
        className="hotspot-image"
        src={src}
        alt=""
        onError={(e) => {
          const el = e.currentTarget;
          if (!el.dataset.fallback) {
            el.dataset.fallback = "1";
            el.src = srcPng;
          }
        }}
      />
      <div className="hotspot-layer">
        {hotspots.map((h: Hotspot) => (
          <button
            key={h.id}
            type="button"
            className="hotspot-btn"
            style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}
            onClick={() => onHotspot(h.prompt, h.label)}
            aria-label={h.label}
          >
            <span className="hotspot-ring" />
            <span className="hotspot-label">{h.label}</span>
          </button>
        ))}
      </div>
      <p className="hotspot-hint">Tap a glowing point to ask Leonardo</p>
    </div>
  );
}
