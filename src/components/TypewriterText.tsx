import { useEffect, useState } from "react";

interface Props {
  text: string;
  speedMs?: number;
  onComplete?: () => void;
  className?: string;
  isStreaming?: boolean;
}

export function TypewriterText({
  text,
  speedMs = 35,
  onComplete,
  className = "font-serif text-lg leading-relaxed text-[#2a2218]",
  isStreaming = true,
}: Props) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (!isStreaming) {
      setShown(text);
      return;
    }
    setShown("");
    if (!text) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        onComplete?.();
      }
    }, speedMs);
    return () => window.clearInterval(id);
  }, [text, speedMs, onComplete, isStreaming]);

  return <p className={className}>{shown}</p>;
}
