import {
  ATELIER_NAV_MARKER,
  DISSECTION_NAV_MARKER,
  STUDIO_NAV_MARKER,
  WORKSHOP_NAV_MARKER,
  userRequestsAtelierTour,
} from "./museumNavigation";

/** Canned Leonardo replies — works offline with no API. */
export function demoLeonardoReply(question: string): string {
  const q = question.toLowerCase().trim();
  if (!q || q.length < 2) {
    return "Speak, friend — I am here. Ask me of light and shadow, of muscle and bone, of wing and water.";
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
      "or of the bird's wing that whispered the secret of flight."
    );
  }
  if (/\b(fly|flight|machine|flying|aircraft|plane|helicopter|jet|wing|water wheel|ornithopter|engineer)\b/.test(q)) {
    return (
      "Your flying machines astonish me — iron birds heavier than air, yet they rise. " +
      "I studied lift and drag in the wingbeat long before your engines roared. " +
      "Nature solved flight in silence; man solves it in thunder. I wonder whether you have yet learned what the kite and the falcon teach: " +
      "that the air is not empty, but a sea in which we swim. " +
      "Follow me to the Workshop — mechanisms drawn in ink, translucent as breath on vellum. " +
      WORKSHOP_NAV_MARKER
    );
  }
  if (/\b(sfumato|light|paint|colour|color|portrait|chiaroscuro|canvas|studio|easel|pigment)\b/.test(q)) {
    return (
      "You ask of light — the very substance I chase across every panel. " +
      "Sfumato is not mere technique; it is the breath between form and air, the soft dissolution of edges so the soul may enter the image. " +
      "Observe how shadow does not end abruptly but melts into luminosity, as mist melts into morning. " +
      "This, I tell you, is saper vedere — knowing how to see. " +
      "Come stand at my shoulder in the Studio — you shall see the panels as I paint them, translucent upon the glass. " +
      STUDIO_NAV_MARKER
    );
  }
  if (/\b(anatom|body|muscle|bone|eye|dissect|heart|flesh|autopsy|corpse)\b/.test(q)) {
    return (
      "When I opened the body at Santa Maria Nuova, I found God's most perfect machine. " +
      "Ten layers of muscle move the hand; the eye, that marvellous instrument, bends light through humours to paint the world upon the mind. " +
      "The painter who ignores anatomy paints bodies as sacks of flour. " +
      "I dissect that I may make the living appear truly alive upon the wall. " +
      "Walk with me to the Dissection Table — the folios lie like candlelit veils upon the flesh. " +
      DISSECTION_NAV_MARKER
    );
  }
  if (/\b(secret|notebook|codex|journal)\b/.test(q)) {
    return (
      "My notebooks hold what I dare not speak aloud at court — mirrors for burning enemies, diving suits, the geometry of water. " +
      "I write mirror-script that curious eyes cannot read without effort. " +
      "The greatest secret is simpler: observation without hurry. The world reveals itself to the patient eye."
    );
  }
  if (/\b(vitruvian|proportion|man|circle|square)\b/.test(q)) {
    return (
      "The Vitruvian Man stands where circle and square meet, where cosmos and earth agree. " +
      "Four fingers make a palm, four palms a foot: the body carries its own measure. " +
      "I drew him not to decorate a page but to prove that art and number are one language."
    );
  }
  const cleaned = question
    .replace(/^regarding my work\s+[""][^""]+[""]\s*\([^)]*\)\s*:\s*/i, "")
    .replace(/^regarding my work\s+[""][^""]+[""]\s*:\s*/i, "")
    .trim();
  const snippet = cleaned.length > 80 ? cleaned.slice(0, 77).trim() + "…" : cleaned;
  return (
    `You ask: “${snippet || "—"}”. ` +
    "Begin with observation: set the thing before your eye, name its light, its weight, its motion. " +
    "If you tell me what you are making (a portrait, a wing, a machine), I will answer in particulars — not in fog."
  );
}
