import type { LeonardoZone } from "../cortex/types";

export interface FolioPopout {
  objectPosition: string;
  bottom?: string;
  width?: string;
  height?: string;
}

export interface NotebookEntry {
  id: string;
  domain: LeonardoZone;
  title: string;
  codex: string;
  year: string;
  excerpt: string;
  prompts: string[];
  imageKey: string;
}

export interface PaintingEntry {
  id: string;
  domain: LeonardoZone;
  title: string;
  year: string;
  location: string;
  description: string;
  prompts: string[];
  imageKey: string;
  popout?: FolioPopout;
}

export interface WebFolio {
  id: string;
  domain: LeonardoZone;
  kind: "painting" | "codex";
  title: string;
  provenance?: string;
  year?: string;
  body: string;
  presenceLine?: string;
  imageKey: string;
  prompts: string[];
  attribution?: string;
  popout?: FolioPopout;
  soundscape?: "studio" | "dissection" | "workshop" | "water" | "flight";
}

/** Authentic excerpts — Treatise on Painting, Codex Atlanticus, Windsor anatomical sheets. */
export const notebooks: NotebookEntry[] = [
  {
    id: "anatomy-1",
    domain: "anatomy",
    title: "Dissection at Santa Maria Nuova",
    codex: "Royal Collection, Windsor — anatomical manuscript A",
    year: "c. 1508–1510",
    excerpt:
      "I have dissected more than ten human bodies, destroying all the other members and removing the very minutest particles of flesh which surrounded these veins.",
    prompts: ["What did you discover by dissecting cadavers?"],
    imageKey: "anatomy-shoulder",
  },
  {
    id: "anatomy-2",
    domain: "anatomy",
    title: "The Heart and Its Chambers",
    codex: "Royal Collection, Windsor, fol. anatomy of the heart",
    year: "c. 1513",
    excerpt: "The heart is of itself a muscle, and it is the principle that gives warmth to the blood.",
    prompts: ["What did you understand about the heart?"],
    imageKey: "heart-blood",
  },
  {
    id: "anatomy-3",
    domain: "anatomy",
    title: "The Skull Sectioned",
    codex: "Royal Collection, Windsor",
    year: "c. 1489",
    excerpt: "I sawed the skull to count its chambers — structure beneath the face the painter must know.",
    prompts: ["What did the skull teach you?"],
    imageKey: "skull-sections",
  },
  {
    id: "anatomy-4",
    domain: "anatomy",
    title: "Studies of the Eye",
    codex: "Royal Collection, Windsor",
    year: "c. 1508",
    excerpt: "The eye modifies the light that passes through it, and the pupil dilates and contracts.",
    prompts: ["Describe the eye as you understood it."],
    imageKey: "anatomy-eye",
  },
  {
    id: "anatomy-5",
    domain: "anatomy",
    title: "The Fetus in the Womb",
    codex: "Royal Collection, Windsor",
    year: "c. 1511",
    excerpt: "I drew the child curled in its chamber with the placenta and umbilical cord, as nature revealed it.",
    prompts: ["What did you learn from studying the womb?"],
    imageKey: "anatomy-embryo",
  },
  {
    id: "anatomy-6",
    domain: "anatomy",
    title: "The Anatomy of the Thigh",
    codex: "Royal Collection, Windsor, RCIN 912618",
    year: "c. 1485–1488",
    excerpt: "Layer upon layer, muscle sheaths bone; the thigh carries the weight of the standing figure.",
    prompts: ["How did you study the muscles of the leg?"],
    imageKey: "anatomy-thigh",
  },
  {
    id: "anatomy-7",
    domain: "anatomy",
    title: "The Foot and Calf",
    codex: "Royal Collection, Windsor, RCIN 919094",
    year: "c. 1510–1513",
    excerpt: "Every tendon in the foot is a lever; the calf is the engine that moves the body forward.",
    prompts: ["What does the foot reveal about movement?"],
    imageKey: "anatomy-foot-calf",
  },
  {
    id: "anatomy-8",
    domain: "anatomy",
    title: "The Anatomy of a Bear's Foot",
    codex: "Royal Collection, Windsor, RCIN 912372",
    year: "c. 1488–1490",
    excerpt: "I studied the bear's foot to understand claw and pad, then compared it with man's own structure.",
    prompts: ["Why did you dissect a bear's foot?"],
    imageKey: "anatomy-bears-foot",
  },
  {
    id: "eng-1",
    domain: "engineering",
    title: "On Flying Machines",
    codex: "Codex Atlanticus, fol. 812r–813v",
    year: "c. 1485–1490",
    excerpt: "A bird is an instrument working according to mathematical law, which instrument it is within the power of man to reproduce.",
    prompts: ["Did your ornithopter ever fly?"],
    imageKey: "ornithopter",
  },
  {
    id: "eng-2",
    domain: "engineering",
    title: "Armoured War Machine",
    codex: "Codex Atlanticus, fol. 1478",
    year: "c. 1485",
    excerpt: "I have designed machines both for attack and defence — a turtle of wood and metal bristling with guns.",
    prompts: ["Tell me about your tank design."],
    imageKey: "tank",
  },
  {
    id: "eng-3",
    domain: "engineering",
    title: "Water, Earth, and the Arno",
    codex: "Codex Leicester / Atlanticus water studies",
    year: "c. 1508",
    excerpt: "Water is the driver of nature. Its vortices obey laws I sought to write down.",
    prompts: ["What did swirling water teach you about motion?"],
    imageKey: "water-study",
  },
  {
    id: "eng-4",
    domain: "engineering",
    title: "The Archimedes Screw",
    codex: "Codex Atlanticus, water-lifting devices",
    year: "c. 1487",
    excerpt: "A screw turned in a tube can lift water against the pull of the earth — useful for irrigation and draining marshland.",
    prompts: ["How does the water screw work?"],
    imageKey: "water-screw",
  },
  {
    id: "eng-5",
    domain: "engineering",
    title: "The Aerial Screw",
    codex: "Codex Atlanticus, fol. 83v",
    year: "c. 1487–1490",
    excerpt: "If this instrument made of starched linen is turned swiftly, the screw will tighten and rise into the air.",
    prompts: ["Was the aerial screw the ancestor of the helicopter?"],
    imageKey: "flying-machine",
  },
  {
    id: "eng-6",
    domain: "engineering",
    title: "The Giant Crossbow",
    codex: "Codex Atlanticus, fol. 149a",
    year: "c. 1485",
    excerpt: "A great crossbow of six brass spans, designed to hurl stones and strike terror before it fires.",
    prompts: ["What was the purpose of such an enormous crossbow?"],
    imageKey: "crossbow",
  },
  {
    id: "eng-7",
    domain: "engineering",
    title: "The Golden Horn Bridge",
    codex: " notebook on civil engineering, c. 1502",
    year: "c. 1502",
    excerpt: "A single flattened arch of three hundred paces — a bridge strong enough to cross the water without piers.",
    prompts: ["How could a bridge span so far without supports?"],
    imageKey: "bridge",
  },
];

export const paintings: PaintingEntry[] = [
  {
    id: "annunciation",
    domain: "art",
    title: "The Annunciation",
    year: "c. 1472–1475",
    location: "Uffizi Gallery, Florence",
    description: "Gabriel kneels in a garden of light; Mary's hand receives the divine message. An early panel on which I learned how atmosphere carries sacred presence.",
    prompts: ["How did you compose the light in The Annunciation?"],
    imageKey: "annunciation",
    popout: { objectPosition: "30% 25%", bottom: "-22%", width: "65%", height: "50%" },
  },
  {
    id: "last-supper",
    domain: "art",
    title: "The Last Supper",
    year: "c. 1495–1498",
    location: "Santa Maria delle Grazie, Milan",
    description: "Christ at the centre of twelve apostles at the moment Judas reaches for the bread. Light falls from the left as betrayal breaks the communion.",
    prompts: ["How did you plan the light for the Last Supper?"],
    imageKey: "last-supper-hires",
    popout: { objectPosition: "50% 30%", bottom: "-20%", width: "70%", height: "48%" },
  },
  {
    id: "mona-lisa",
    domain: "art",
    title: "Mona Lisa (La Gioconda)",
    year: "c. 1503–1519",
    location: "Musée du Louvre, Paris",
    description: "Sfumato dissolves the corners of the mouth and eyes — her expression shifts as the viewer moves, for shadow and light are never fixed.",
    prompts: ["Why does her expression seem to change?"],
    imageKey: "mona-lisa",
    popout: { objectPosition: "50% 22%", bottom: "-24%", width: "58%", height: "52%" },
  },
  {
    id: "vitruvian-man",
    domain: "art",
    title: "Vitruvian Man",
    year: "c. 1490",
    location: "Gallerie dell'Accademia, Venice",
    description: "Man inscribed in circle and square — proportion as bridge between architecture, anatomy, and the cosmos.",
    prompts: ["Explain the Vitruvian Man."],
    imageKey: "vitruvian-man-hires",
    popout: { objectPosition: "50% 40%", bottom: "-18%", width: "75%", height: "55%" },
  },
  {
    id: "lady-ermine",
    domain: "art",
    title: "Lady with an Ermine",
    year: "c. 1489–1491",
    location: "Czartoryski Museum, Kraków",
    description: "Cecilia Gallerani turns with sudden grace, the ermine alert in her arms — life caught in a moment of interrupted movement.",
    prompts: ["Why did you include the ermine in this portrait?"],
    imageKey: "lady-ermine",
    popout: { objectPosition: "45% 25%", bottom: "-24%", width: "62%", height: "54%" },
  },
  {
    id: "saint-john",
    domain: "art",
    title: "Saint John the Baptist",
    year: "c. 1513–1516",
    location: "Musée du Louvre, Paris",
    description: "The Baptist emerges from darkness, one finger raised toward light. His smile is the same enigma I painted in the Mona Lisa.",
    prompts: ["Why does Saint John point upward?"],
    imageKey: "saint-john",
    popout: { objectPosition: "50% 28%", bottom: "-22%", width: "60%", height: "56%" },
  },
  {
    id: "battle-anghiari",
    domain: "art",
    title: "The Battle of Anghiari",
    year: "c. 1503–1506",
    location: "Palazzo Vecchio, Florence (lost; Rubens copy)",
    description: "Horses and men entangled in rage — a study of fury, muscle, and the geometry of battle. The original fresco is lost, but copies preserve its violence.",
    prompts: ["What were you trying to capture in the battle scene?"],
    imageKey: "battle-anghiari",
    popout: { objectPosition: "50% 35%", bottom: "-20%", width: "72%", height: "50%" },
  },
  {
    id: "virgin-rocks",
    domain: "art",
    title: "The Virgin of the Rocks",
    year: "c. 1483–1486",
    location: "National Gallery, London",
    description: "Mary, the angel, the infant Christ and John gathered in a grotto of impossible light. Rock, water, and flesh dissolve into one another.",
    prompts: ["How did you create the atmosphere in the grotto?"],
    imageKey: "virgin-of-rocks-hires",
    popout: { objectPosition: "50% 30%", bottom: "-22%", width: "66%", height: "52%" },
  },
];

const PRESENCE_BY_DOMAIN: Record<LeonardoZone, string> = {
  art: "I load the brush beside you — watch how the light settles on the panel.",
  anatomy: "The candle gutters; his blade rests on the linen of the dissection table.",
  engineering: "From the notebook, machines you know today begin to rise.",
};

const ATTRIBUTION = "Public domain via Wikimedia Commons / Royal Collection Trust";

function soundscapeForDomain(domain: LeonardoZone, imageKey: string): WebFolio["soundscape"] {
  if (domain === "art") return "studio";
  if (domain === "anatomy") return "dissection";
  if (imageKey === "water-study" || imageKey === "water-screw") return "water";
  if (imageKey === "ornithopter" || imageKey === "flying-machine") return "flight";
  return "workshop";
}

function paintingFolios(): WebFolio[] {
  return paintings.map((p) => ({
    id: `p-${p.id}`,
    domain: p.domain,
    kind: "painting",
    title: p.title,
    provenance: p.location,
    year: p.year,
    body: p.description,
    presenceLine: PRESENCE_BY_DOMAIN[p.domain],
    imageKey: p.imageKey,
    prompts: p.prompts,
    attribution: ATTRIBUTION,
    popout: p.popout,
    soundscape: soundscapeForDomain(p.domain, p.imageKey),
  }));
}

function codexFolios(): WebFolio[] {
  return notebooks.map((e) => ({
    id: `c-${e.id}`,
    domain: e.domain,
    kind: "codex",
    title: e.title,
    provenance: e.codex,
    year: e.year,
    body: e.excerpt,
    presenceLine: PRESENCE_BY_DOMAIN[e.domain],
    imageKey: e.imageKey,
    prompts: e.prompts,
    attribution: ATTRIBUTION,
    popout: {
      objectPosition: "50% 40%",
      bottom: "-20%",
      width: "72%",
      height: "50%",
    },
    soundscape: soundscapeForDomain(e.domain, e.imageKey),
  }));
}

function foliosForDomain(domain: LeonardoZone, p: WebFolio[], c: WebFolio[]): WebFolio[] {
  return [...p.filter((f) => f.domain === domain), ...c.filter((f) => f.domain === domain)];
}

function buildFolios(): WebFolio[] {
  const p = paintingFolios();
  const c = codexFolios();
  return (["art", "anatomy", "engineering"] as LeonardoZone[]).flatMap((d) => foliosForDomain(d, p, c));
}

export const FOLIO_SCROLL = buildFolios();
export const corpus = { notebooks, paintings, FOLIO_SCROLL };
