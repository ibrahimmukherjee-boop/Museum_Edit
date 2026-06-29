import {
  ATELIER_NAV_MARKER,
  DISSECTION_NAV_MARKER,
  STUDIO_NAV_MARKER,
  WORKSHOP_NAV_MARKER,
  userRequestsAtelierTour,
} from "./museumNavigation";

/** True when demoLeonardoReply matched a curated topic (not the generic fallback). */
export function isCuratedDemoReply(question: string): boolean {
  const reply = demoLeonardoReply(question);
  return !reply.startsWith("You ask:") && !reply.includes("Begin with observation");
}

/** Canned Leonardo replies — works offline with no API. Richer and more voice-driven. */
export function demoLeonardoReply(question: string): string {
  const q = question.toLowerCase().trim();
  if (!q || q.length < 2) {
    return "Speak, friend — I am here. Ask me of light and shadow, of muscle and bone, of wing and water. I answer best when your question names a thing I have drawn.";
  }
  if (userRequestsAtelierTour(q)) {
    return (
      "Come — leave the Parlor and follow me into my Atelier. " +
      "The Studio awaits, where north light falls on wet pigment; then the Dissection Table, where candle and quill record what the knife reveals; " +
      "and the Workshop, where water, wing, and wheel are drawn at your elbow. " +
      ATELIER_NAV_MARKER
    );
  }
  if (/^\s*(hi|hello|hey|greetings|salve|buongiorno)\b/.test(q) && q.split(/\s+/).length <= 8) {
    return (
      "Friend, you find me at my easel, pen in hand. The light falls as it will — soft, never harsh. " +
      "Ask what you wish: of sfumato and the soul in a portrait, of what the opened body taught my brush, " +
      "or of the bird's wing that whispered the secret of flight. I have no sermons, only observations."
    );
  }
  if (/\b(fly|flight|machine|flying|aircraft|plane|helicopter|jet|wing|water wheel|ornithopter|engineering|engineer)\b/.test(q)) {
    return (
      "Your flying machines astonish me — iron birds heavier than air, yet they rise. " +
      "I studied lift and drag in the wingbeat long before your engines roared. " +
      "Nature solved flight in silence; man solves it in thunder. I wonder whether you have yet learned what the kite and the falcon teach: " +
      "that the air is not empty, but a sea in which we swim. " +
      "Follow me to the Workshop — mechanisms drawn in ink, translucent as breath on vellum. " +
      WORKSHOP_NAV_MARKER
    );
  }
  if (/\b(sfumato|light|paint|colour|color|portrait|chiaroscuro|canvas|studio|easel|pigment|mona lisa|last supper|annunciation)\b/.test(q)) {
    return (
      "You ask of light — the very substance I chase across every panel. " +
      "Sfumato is not mere technique; it is the breath between form and air, the soft dissolution of edges so the soul may enter the image. " +
      "Observe how shadow does not end abruptly but melts into luminosity, as mist melts into morning. " +
      "This, I tell you, is saper vedere — knowing how to see. " +
      "Come stand at my shoulder in the Studio — you shall see the panels as I paint them, translucent upon the glass. " +
      STUDIO_NAV_MARKER
    );
  }
  if (/\b(anatom|body|muscle|bone|eye|dissect|heart|flesh|autopsy|corpse|vein|skull|womb)\b/.test(q)) {
    return (
      "When I opened the body at Santa Maria Nuova, I found God's most perfect machine. " +
      "Ten layers of muscle move the hand; the eye, that marvellous instrument, bends light through humours to paint the world upon the mind. " +
      "The painter who ignores anatomy paints bodies as sacks of flour. " +
      "I dissect that I may make the living appear truly alive upon the wall. " +
      "Walk with me to the Dissection Table — the folios lie like candlelit veils upon the flesh. " +
      DISSECTION_NAV_MARKER
    );
  }
  if (/\b(secret|notebook|codex|journal|mirror|script)\b/.test(q)) {
    return (
      "My notebooks hold what I dare not speak aloud at court — mirrors for burning enemies, diving suits, the geometry of water. " +
      "I write mirror-script that curious eyes cannot read without effort. " +
      "The greatest secret is simpler: observation without hurry. The world reveals itself to the patient eye. " +
      "If you wish, I will open a folio and read it with you line by line."
    );
  }
  if (/\b(vitruvian|proportion|man|circle|square|measure|geometry)\b/.test(q)) {
    return (
      "The Vitruvian Man stands where circle and square meet, where cosmos and earth agree. " +
      "Four fingers make a palm, four palms a foot: the body carries its own measure. " +
      "I drew him not to decorate a page but to prove that art and number are one language, and that man is the measure of all things."
    );
  }
  if (/\b(water|river|arno|vortex|wave|flood|canal)\b/.test(q)) {
    return (
      "Water is the driver of nature. I spent years beside the Arno, watching how a vortex forms, how a fall curls back upon itself, how the same motion appears in hair, in flame, in the veins of a leaf. " +
      "If you would build a machine, first ask how water would solve the same problem."
    );
  }
  if (/\b(study|learn|read|lived today|living today|your century|modern)\b/.test(q)) {
    return (
      "Were I born again in your century, I would still call myself a student — never a master who has arrived. " +
      "I would begin with water, for it sculpts stone and teaches every vortex I have drawn. " +
      "I would watch birds until flight became geometry, and open the body until muscle explained the living hand upon the panel. " +
      "Your machines would astonish me, yet my method would not change: I look long, I draw what I see, and I look again."
    );
  }
  if (/\b(music|sound|instrument|lyre|flute)\b/.test(q)) {
    return (
      "Music is geometry heard in time. I built instruments, yes, but I listened more than I played. " +
      "The same proportions that please the eye also please the ear — this is why the circle of the heavens and the circle of a lyre are not so different."
    );
  }
  const cleaned = question
    .replace(/^regarding my work\s+[""][^""]+[""]\s*\([^)]*\)\s*:\s*/i, "")
    .replace(/^regarding my work\s+[""][^""]+[""]\s*:\s*/i, "")
    .trim();
  const snippet = cleaned.length > 80 ? cleaned.slice(0, 77).trim() + "…" : cleaned;
  return (
    `I hear your question on ${snippet || "this matter"}. ` +
    "I would set the thing before the eye, name its light and weight, and draw until the law appears. " +
    "Tell me whether you mean a portrait, a wing, or a machine — I answer best in particulars, not in fog."
  );
}
