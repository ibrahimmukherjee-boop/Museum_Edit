/** Optional: regenerate folios.json + corpus.json snapshots (app uses museumCorpus.ts directly). */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "src/data");
mkdirSync(dataDir, { recursive: true });

const notebooks = [
  { id: "art-1", domain: "art", title: "On the Motion of the Soul in Painting", codex: "Codex Urbinas / Treatise on Painting", year: "c. 1490–1515", excerpt: "The painter must be universal — he must understand the nature of all things he wishes to represent. The eye, which is called the window of the soul, is the principal means by which the soul can most fully and abundantly appreciate the infinite works of nature.", prompts: ["How do you capture the soul of a sitter in a portrait?", "Why must a painter understand anatomy?", "What did you mean by saper vedere — knowing how to see?"] },
  { id: "art-2", domain: "art", title: "Light and Shadow in the Last Supper", codex: "Codex Atlanticus, fol. 393r", year: "c. 1495", excerpt: "Shadow is the diminution or absence of light. The shadows cast by bodies are of the same nature as the bodies that produce them.", prompts: ["How did you plan the light for the Last Supper?", "Why is sfumato essential to your portraits?"] },
  { id: "art-3", domain: "art", title: "The Proportions of the Human Figure", codex: "Vitruvian Man", year: "c. 1490", excerpt: "If you open your legs so much as to decrease your height by one-fourteenth, and raise your hands till your extended fingers touch the line of the top of your head, you will find that the centre of the extended limbs will be at the navel.", prompts: ["Explain the Vitruvian Man drawing.", "How do art and mathematics unite in your work?"] },
  { id: "art-4", domain: "art", title: "On Sfumato and the Edge of Form", codex: "Treatise on Painting", year: "c. 1490–1515", excerpt: "Sfumato is without lines or borders, in the manner of smoke or beyond the focus of the eye.", prompts: ["How do you achieve sfumato in a portrait?"] },
  { id: "art-5", domain: "art", title: "The Mirror of the Painter", codex: "Codex Atlanticus, fol. 207r", year: "c. 1492", excerpt: "The mirror is the master of painters.", prompts: ["Why did you write backwards in your notebooks?"] },
  { id: "art-6", domain: "art", title: "Composition of the Battle of Anghiari", codex: "Lost cartoon", year: "c. 1503–1506", excerpt: "In the fury of battle I sought to show horses and men interlocked.", prompts: ["Tell me of the Battle of Anghiari."] },
  { id: "anatomy-1", domain: "anatomy", title: "Dissection of the Human Body", codex: "Royal Collection, Windsor", year: "c. 1508–1510", excerpt: "I have dissected more than ten human bodies, destroying all the other members and removing the very minutest particles of flesh which surrounded these veins.", prompts: ["What did you discover by dissecting cadavers?"] },
  { id: "anatomy-2", domain: "anatomy", title: "The Heart and Its Chambers", codex: "Royal Collection, Windsor", year: "c. 1513", excerpt: "The heart is of itself a muscle, and it is the principle that gives warmth to the blood.", prompts: ["What did you understand about the heart?"] },
  { id: "anatomy-3", domain: "anatomy", title: "The Muscles of the Shoulder", codex: "Codex Windsor", year: "c. 1510", excerpt: "The shoulder is the joint of greatest liberty in the human frame.", prompts: ["Why did you draw muscles in layers?"] },
  { id: "anatomy-4", domain: "anatomy", title: "The Layers of the Eye", codex: "Royal Collection, Windsor", year: "c. 1508", excerpt: "The eye modifies the light that passes through it, and the pupil dilates and contracts.", prompts: ["Describe the eye as you understood it."] },
  { id: "anatomy-5", domain: "anatomy", title: "The Fetus in the Womb", codex: "Royal Collection, Windsor", year: "c. 1511", excerpt: "I drew the child curled in its chamber with the placenta and umbilical cord.", prompts: ["What did you learn from studying the womb?"] },
  { id: "anatomy-6", domain: "anatomy", title: "The Spine and Nervous Pathways", codex: "Codex Windsor", year: "c. 1510", excerpt: "The spine is a column of bones separated by cartilage, bending with grace when the figure moves.", prompts: ["How did you study the spine?"] },
  { id: "eng-1", domain: "engineering", title: "On Flying Machines", codex: "Codex Atlanticus, fol. 812r", year: "c. 1485–1490", excerpt: "A bird is an instrument working according to mathematical law.", prompts: ["Did your ornithopter ever fly?"] },
  { id: "eng-2", domain: "engineering", title: "Water, Earth, and the Arno", codex: "Codex Leicester", year: "c. 1508", excerpt: "Water is the driver of nature.", prompts: ["What did you learn from studying the Arno river?"] },
  { id: "eng-3", domain: "engineering", title: "War Machines and Fortifications", codex: "Codex Atlanticus", year: "c. 1485", excerpt: "I have designed machines both for attack and defence.", prompts: ["Tell me about your tank design."] },
  { id: "eng-4", domain: "engineering", title: "Parachute and Aerial Screw", codex: "Codex Atlanticus", year: "c. 1485", excerpt: "If a man have a tent of linen twelve braccia wide, he may throw himself from any height without injury.", prompts: ["Did you invent the parachute?"] },
  { id: "eng-5", domain: "engineering", title: "Canals and Locks for Milan", codex: "Codex Atlanticus", year: "c. 1487", excerpt: "To bring prosperity to Milan I proposed canals with locks.", prompts: ["Tell me of your canal designs."] },
  { id: "eng-6", domain: "engineering", title: "Geology and Fossils", codex: "Codex Leicester", year: "c. 1508", excerpt: "Shells found upon mountain peaks were once creatures of the sea.", prompts: ["What did fossils teach you?"] },
];

const paintings = [
  { id: "annunciation", domain: "art", title: "The Annunciation", year: "c. 1472–1475", location: "Uffizi Gallery, Florence", description: "An early masterpiece of light and angelic presence.", prompts: ["How did you compose the light in The Annunciation?", "What were you seeking to capture in this work?"] },
  { id: "last-supper", domain: "art", title: "The Last Supper", year: "c. 1495–1498", location: "Santa Maria delle Grazie, Milan", description: "Christ and the apostles at the moment of betrayal.", prompts: ["How did you plan the light for the Last Supper?"] },
  { id: "mona-lisa", domain: "art", title: "Mona Lisa", year: "c. 1503–1519", location: "Louvre", description: "Sfumato dissolves the corners of the mouth and eyes.", prompts: ["Why does her expression seem to change?"] },
  { id: "vitruvian-man", domain: "art", title: "Vitruvian Man", year: "c. 1490", location: "Accademia Gallery", description: "Man inscribed in circle and square.", prompts: ["Explain the Vitruvian Man."] },
  { id: "lady-ermine", domain: "art", title: "Lady with an Ermine", year: "c. 1489–1491", location: "Kraków", description: "Gesture carries character.", prompts: ["Who was Cecilia Gallerani?"] },
  { id: "saint-john", domain: "art", title: "Saint John the Baptist", year: "c. 1513–1516", location: "Louvre", description: "The Baptist points heavenward.", prompts: ["What does the pointing finger mean?"] },
  { id: "battle-anghiari", domain: "art", title: "The Battle of Anghiari", year: "c. 1503–1506", location: "Lost mural", description: "Horses and warriors locked in fury.", prompts: ["How do you paint motion and violence?"] },
  { id: "anatomy-shoulder", domain: "anatomy", title: "Studies of the Shoulder and Neck", year: "c. 1510", location: "Royal Collection", description: "Layered dissections revealing how muscle wraps bone.", prompts: ["Why study the shoulder?"] },
  { id: "skull-sections", domain: "anatomy", title: "The Skull Sectioned", year: "c. 1489", location: "Royal Collection", description: "I sawed the skull to count its chambers.", prompts: ["What did the skull teach you?"] },
  { id: "heart-blood", domain: "anatomy", title: "The Heart and Blood", year: "c. 1513", location: "Royal Collection", description: "Four chambers, vortices within.", prompts: ["What did you understand about the heart?"] },
  { id: "anatomy-eye", domain: "anatomy", title: "Studies of the Eye", year: "c. 1508", location: "Royal Collection", description: "The eye bends light through humours.", prompts: ["How does the eye relate to painting?"] },
  { id: "anatomy-embryo", domain: "anatomy", title: "The Fetus in the Womb", year: "c. 1511", location: "Royal Collection", description: "Life before birth, curled with placenta.", prompts: ["Why draw the fetus?"] },
  { id: "ornithopter", domain: "engineering", title: "Design for a Flying Machine", year: "c. 1488", location: "Codex Atlanticus", description: "Wings modeled on the bat.", prompts: ["Could your flying machine work?"] },
  { id: "water-screw", domain: "engineering", title: "Water Screw", year: "c. 1490", location: "Codex Atlanticus", description: "A spiral to lift water against gravity.", prompts: ["How does the water screw work?"] },
  { id: "tank", domain: "engineering", title: "Armoured Vehicle", year: "c. 1485", location: "Codex Atlanticus", description: "A turtle shell bristling with cannons.", prompts: ["Tell me about your tank design."] },
  { id: "water-study", domain: "engineering", title: "Studies of Water and Flow", year: "c. 1508", location: "Codex Leicester", description: "Vortices and the Arno's patience.", prompts: ["What did water teach you?"] },
];

function paintingFolios() {
  return paintings.map((p) => ({
    id: `p-${p.id}`,
    domain: p.domain,
    kind: "painting",
    title: p.title,
    provenance: p.location,
    year: p.year,
    body: p.description,
    presenceLine: "I load the brush beside you — watch how the light settles on the panel.",
    imageKey: p.id,
    prompts: p.prompts,
  }));
}

function codexFolios() {
  return notebooks.map((e) => ({
    id: `c-${e.id}`,
    domain: e.domain,
    kind: "codex",
    title: e.title,
    provenance: e.codex,
    year: e.year,
    body: e.excerpt,
    presenceLine: "His quill moves between you — follow the line.",
    imageKey: e.id,
    prompts: e.prompts,
  }));
}

const domains = ["art", "anatomy", "engineering"];
const folios = [];
for (const d of domains) {
  const p = paintingFolios().filter((f) => f.domain === d);
  const c = codexFolios().filter((f) => f.domain === d);
  const max = Math.max(p.length, c.length);
  for (let i = 0; i < max; i++) {
    if (p[i]) folios.push(p[i]);
    if (c[i]) folios.push(c[i]);
  }
}

writeFileSync(join(dataDir, "folios.json"), JSON.stringify(folios, null, 2));
writeFileSync(join(dataDir, "corpus.json"), JSON.stringify({ notebooks, paintings, folios }, null, 2));
console.log("Built", folios.length, "folios → src/data/*.json (runtime uses museumCorpus.ts)");
