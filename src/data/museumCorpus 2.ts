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
}

/** Authentic excerpts — Treatise on Painting, Codex Atlanticus, Windsor anatomical sheets, Codex Leicester (V&A / Royal Collection). */
export const notebooks: NotebookEntry[] = [
  {
    id: "art-1",
    domain: "art",
    title: "On the Motion of the Soul in Painting",
    codex: "Codex Urbinas (Treatise on Painting), Biblioteca Vaticana",
    year: "c. 1490–1515",
    excerpt:
      "The painter must be universal — he must understand the nature of all things he wishes to represent. The eye, which is called the window of the soul, is the principal means by which the soul can most fully appreciate the infinite works of nature.",
    prompts: ["How do you capture the soul of a sitter in a portrait?", "What did you mean by saper vedere — knowing how to see?"],
    imageKey: "codex-art-1",
  },
  {
    id: "art-2",
    domain: "art",
    title: "Light and Shadow",
    codex: "Codex Atlanticus, fol. 393r, Biblioteca Ambrosiana, Milan",
    year: "c. 1495",
    excerpt:
      "Shadow is the diminution or absence of light. The shadows cast by bodies are of the same nature as the bodies that produce them.",
    prompts: ["How did you plan the light for the Last Supper?", "Why is sfumato essential to your portraits?"],
    imageKey: "codex-art-2",
  },
  {
    id: "art-3",
    domain: "art",
    title: "The Proportions of Man",
    codex: "Vitruvian Man, Accademia Gallery, Venice",
    year: "c. 1490",
    excerpt:
      "If you open your legs so much as to decrease your height by one-fourteenth, and raise your hands till your extended fingers touch the line of the top of your head, know that the centre of the extended limbs will be at the navel.",
    prompts: ["Explain the Vitruvian Man drawing.", "How do art and mathematics unite in your work?"],
    imageKey: "codex-art-3",
  },
  {
    id: "art-4",
    domain: "art",
    title: "On Sfumato",
    codex: "Treatise on Painting (Codex Urbinas)",
    year: "c. 1490–1515",
    excerpt: "Sfumato is without lines or borders, in the manner of smoke or beyond the focus of the eye.",
    prompts: ["How do you achieve sfumato in a portrait?"],
    imageKey: "codex-art-4",
  },
  {
    id: "art-5",
    domain: "art",
    title: "The Mirror of the Painter",
    codex: "Codex Atlanticus, fol. 207r",
    year: "c. 1492",
    excerpt: "The mirror is the master of painters. I say that the mirror is the true master of painters.",
    prompts: ["Why did you write backwards in your notebooks?"],
    imageKey: "codex-art-5",
  },
  {
    id: "art-6",
    domain: "art",
    title: "The Battle of Anghiari",
    codex: "Lost cartoon, Palazzo Vecchio (known through copies)",
    year: "c. 1503–1506",
    excerpt: "In the fury of battle I sought to show horses and men interlocked, none repeating the same action.",
    prompts: ["Tell me of the Battle of Anghiari."],
    imageKey: "codex-art-6",
  },
  {
    id: "anatomy-1",
    domain: "anatomy",
    title: "Dissection at Santa Maria Nuova",
    codex: "Royal Collection, Windsor — anatomical manuscript A",
    year: "c. 1508–1510",
    excerpt:
      "I have dissected more than ten human bodies, destroying all the other members and removing the very minutest particles of flesh which surrounded these veins.",
    prompts: ["What did you discover by dissecting cadavers?"],
    imageKey: "codex-anatomy-1",
  },
  {
    id: "anatomy-2",
    domain: "anatomy",
    title: "The Heart and Its Chambers",
    codex: "Royal Collection, Windsor, fol. anatomy of the heart",
    year: "c. 1513",
    excerpt: "The heart is of itself a muscle, and it is the principle that gives warmth to the blood.",
    prompts: ["What did you understand about the heart?"],
    imageKey: "codex-anatomy-2",
  },
  {
    id: "anatomy-3",
    domain: "anatomy",
    title: "Muscles of the Shoulder",
    codex: "Codex Windsor, layered dissection studies",
    year: "c. 1510",
    excerpt: "The shoulder is the joint of greatest liberty in the human frame.",
    prompts: ["Why did you draw muscles in layers?"],
    imageKey: "codex-anatomy-3",
  },
  {
    id: "anatomy-4",
    domain: "anatomy",
    title: "Studies of the Eye",
    codex: "Royal Collection, Windsor",
    year: "c. 1508",
    excerpt: "The eye modifies the light that passes through it, and the pupil dilates and contracts.",
    prompts: ["Describe the eye as you understood it."],
    imageKey: "codex-anatomy-4",
  },
  {
    id: "anatomy-5",
    domain: "anatomy",
    title: "The Fetus in the Womb",
    codex: "Royal Collection, Windsor",
    year: "c. 1511",
    excerpt: "I drew the child curled in its chamber with the placenta and umbilical cord, as nature revealed it.",
    prompts: ["What did you learn from studying the womb?"],
    imageKey: "codex-anatomy-5",
  },
  {
    id: "anatomy-6",
    domain: "anatomy",
    title: "The Spine",
    codex: "Codex Windsor",
    year: "c. 1510",
    excerpt: "The spine is a column of bones separated by cartilage, bending with grace when the figure moves.",
    prompts: ["How did you study the spine?"],
    imageKey: "codex-anatomy-6",
  },
  {
    id: "eng-1",
    domain: "engineering",
    title: "On Flying Machines",
    codex: "Codex Atlanticus, fol. 812r–813v",
    year: "c. 1485–1490",
    excerpt: "A bird is an instrument working according to mathematical law, which instrument it is within the power of man to reproduce.",
    prompts: ["Did your ornithopter ever fly?"],
    imageKey: "codex-eng-1",
  },
  {
    id: "eng-2",
    domain: "engineering",
    title: "Water, Earth, and the Arno",
    codex: "Codex Leicester (Bill Gates Collection)",
    year: "c. 1508",
    excerpt: "Water is the driver of nature. Its vortices obey laws I sought to write down.",
    prompts: ["What did you learn from studying the Arno river?"],
    imageKey: "codex-eng-2",
  },
  {
    id: "eng-3",
    domain: "engineering",
    title: "Armoured War Machine",
    codex: "Codex Atlanticus, fol. 1478",
    year: "c. 1485",
    excerpt: "I have designed machines both for attack and defence — a turtle of wood and metal bristling with guns.",
    prompts: ["Tell me about your tank design."],
    imageKey: "codex-eng-3",
  },
  {
    id: "eng-4",
    domain: "engineering",
    title: "Parachute and Aerial Screw",
    codex: "Codex Atlanticus",
    year: "c. 1485",
    excerpt:
      "If a man have a tent of linen twelve braccia wide, he may throw himself from any height without injury to himself.",
    prompts: ["Did you invent the parachute?"],
    imageKey: "codex-eng-4",
  },
  {
    id: "eng-5",
    domain: "engineering",
    title: "Canals and Locks for Milan",
    codex: "Codex Atlanticus, Milan canal studies",
    year: "c. 1487",
    excerpt: "To bring prosperity to Milan I proposed canals with locks, that boats might rise as water falls.",
    prompts: ["Tell me of your canal designs."],
    imageKey: "codex-eng-5",
  },
  {
    id: "eng-6",
    domain: "engineering",
    title: "Geology and Fossils",
    codex: "Codex Leicester",
    year: "c. 1508",
    excerpt: "Shells found upon mountain peaks were once creatures of the sea — the mountains were made before the valleys.",
    prompts: ["What did fossils teach you?"],
    imageKey: "codex-eng-6",
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
    imageKey: "last-supper",
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
    imageKey: "vitruvian-man",
    popout: { objectPosition: "50% 40%", bottom: "-18%", width: "75%", height: "55%" },
  },
  {
    id: "lady-ermine",
    domain: "art",
    title: "Lady with an Ermine",
    year: "c. 1489–1491",
    location: "Czartoryski Museum, Kraków",
    description: "Cecilia Gallerani turns with the ermine — gesture and animal alike reveal the sitter's intelligence.",
    prompts: ["Who was Cecilia Gallerani?"],
    imageKey: "lady-ermine",
    popout: { objectPosition: "55% 35%", bottom: "-20%", width: "62%", height: "50%" },
  },
  {
    id: "saint-john",
    domain: "art",
    title: "Saint John the Baptist",
    year: "c. 1513–1516",
    location: "Musée du Louvre, Paris",
    description: "The Baptist emerges from darkness, finger pointing heavenward — flesh modelled in smoky chiaroscuro.",
    prompts: ["What does the pointing finger mean?"],
    imageKey: "saint-john",
    popout: { objectPosition: "48% 28%", bottom: "-22%", width: "60%", height: "54%" },
  },
  {
    id: "battle-anghiari",
    domain: "art",
    title: "The Battle of Anghiari (copy after lost mural)",
    year: "c. 1503–1506",
    location: "Lost mural — known via Rubens copy, Louvre",
    description: "Horses and warriors locked in fury; the lost mural survives only in copies, yet the violence of motion remains.",
    prompts: ["How do you paint motion and violence?"],
    imageKey: "battle-anghiari",
    popout: { objectPosition: "40% 45%", bottom: "-16%", width: "80%", height: "45%" },
  },
  {
    id: "anatomy-shoulder",
    domain: "anatomy",
    title: "Muscles of the Shoulder and Arm",
    year: "c. 1510",
    location: "Royal Collection, Windsor",
    description: "Layered dissections revealing how muscle wraps bone — the shoulder's liberty of movement governs every gesture I paint.",
    prompts: ["Why study the shoulder?"],
    imageKey: "anatomy-shoulder",
    popout: { objectPosition: "50% 40%", bottom: "-20%", width: "72%", height: "50%" },
  },
  {
    id: "skull-sections",
    domain: "anatomy",
    title: "The Skull Sectioned",
    year: "c. 1489",
    location: "Royal Collection, Windsor",
    description: "I sawed the skull to count its chambers — structure beneath the face the painter must know.",
    prompts: ["What did the skull teach you?"],
    imageKey: "skull-sections",
    popout: { objectPosition: "50% 50%", bottom: "-18%", width: "68%", height: "48%" },
  },
  {
    id: "heart-blood",
    domain: "anatomy",
    title: "The Heart and Lungs",
    year: "c. 1513",
    location: "Royal Collection, Windsor",
    description: "Four chambers, vortices of blood — the heart as furnace of the living body.",
    prompts: ["What did you understand about the heart?"],
    imageKey: "heart-blood",
    popout: { objectPosition: "45% 45%", bottom: "-19%", width: "70%", height: "50%" },
  },
  {
    id: "anatomy-eye",
    domain: "anatomy",
    title: "Studies of the Eye",
    year: "c. 1508",
    location: "Royal Collection, Windsor",
    description: "The eye bends light through humours — window of the soul and instrument of the painter alike.",
    prompts: ["How does the eye relate to painting?"],
    imageKey: "anatomy-eye",
    popout: { objectPosition: "50% 35%", bottom: "-21%", width: "64%", height: "52%" },
  },
  {
    id: "anatomy-embryo",
    domain: "anatomy",
    title: "The Fetus in the Womb",
    year: "c. 1511",
    location: "Royal Collection, Windsor",
    description: "Life before birth, curled with placenta — wonder at the machine nature builds in secret.",
    prompts: ["Why draw the fetus?"],
    imageKey: "anatomy-embryo",
    popout: { objectPosition: "50% 55%", bottom: "-17%", width: "66%", height: "46%" },
  },
];

const PRESENCE_BY_DOMAIN: Record<LeonardoZone, string> = {
  art: "I load the brush beside you — watch how the light settles on the panel.",
  anatomy: "The candle gutters; his blade rests on the linen of the dissection table.",
  engineering: "From the notebook, machines you know today begin to rise.",
};

const ATTRIBUTION = "Public domain via Wikimedia Commons / Royal Collection Trust / V&A";

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
  }));
}

function interleaveDomain(domain: LeonardoZone, p: WebFolio[], c: WebFolio[]): WebFolio[] {
  const pd = p.filter((f) => f.domain === domain);
  const cd = c.filter((f) => f.domain === domain);
  if (domain === "engineering") return cd;
  const folios: WebFolio[] = [];
  const max = Math.max(pd.length, cd.length);
  for (let i = 0; i < max; i++) {
    if (pd[i]) folios.push(pd[i]);
    if (cd[i]) folios.push(cd[i]);
  }
  return folios;
}

function interleaveFolios(): WebFolio[] {
  const p = paintingFolios();
  const c = codexFolios();
  return (["art", "anatomy", "engineering"] as LeonardoZone[]).flatMap((d) => interleaveDomain(d, p, c));
}

export const FOLIO_SCROLL = interleaveFolios();
export const corpus = { notebooks, paintings, folios: FOLIO_SCROLL };
