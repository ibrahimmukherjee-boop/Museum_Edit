export interface Hotspot {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  prompt: string;
}

export const FOLIO_HOTSPOTS: Record<string, Hotspot[]> = {
  "p-annunciation": [
    { id: "angel", x: 4, y: 20, w: 32, h: 75, label: "The Angel", prompt: "Leonardo, how did you paint the angel's wings and the light around Gabriel?" },
    { id: "mary", x: 52, y: 25, w: 35, h: 70, label: "Virgin Mary", prompt: "What were you seeking in Mary's gesture and expression in The Annunciation?" },
    { id: "garden", x: 20, y: 55, w: 60, h: 40, label: "The Garden", prompt: "How does the landscape behind us teach atmosphere and distance?" },
  ],
  "p-last-supper": [
    { id: "christ", x: 38, y: 15, w: 24, h: 55, label: "Christ", prompt: "How did you place Christ as the luminous centre of The Last Supper?" },
    { id: "judas", x: 52, y: 30, w: 18, h: 45, label: "Judas", prompt: "Why did you hide Judas in shadow while the others lean toward the light?" },
    { id: "hands", x: 10, y: 40, w: 80, h: 35, label: "The Hands", prompt: "Walk me through the language of hands in this moment of betrayal." },
  ],
  "p-mona-lisa": [
    { id: "smile", x: 38, y: 28, w: 28, h: 22, label: "The Smile", prompt: "Why does her expression seem to change as the viewer moves?" },
    { id: "eyes", x: 35, y: 22, w: 35, h: 18, label: "The Eyes", prompt: "How did sfumato dissolve the corners of her eyes?" },
    { id: "landscape", x: 5, y: 50, w: 90, h: 45, label: "The Landscape", prompt: "What role does the distant landscape play in the portrait?" },
  ],
  "p-vitruvian-man": [
    { id: "circle", x: 15, y: 10, w: 70, h: 80, label: "Circle & Square", prompt: "Why did you inscribe man in both circle and square?" },
    { id: "navel", x: 42, y: 48, w: 16, h: 12, label: "The Navel", prompt: "What does the navel as centre of proportion mean to you?" },
  ],
  "c-art-1": [
    { id: "eye", x: 10, y: 20, w: 80, h: 25, label: "Window of the Soul", prompt: "You wrote the eye is the window of the soul — explain this to me." },
    { id: "universal", x: 10, y: 50, w: 80, h: 35, label: "Universal Painter", prompt: "Why must the painter be universal in knowledge?" },
  ],
  "c-anatomy-1": [
    { id: "veins", x: 15, y: 30, w: 70, h: 40, label: "The Vessels", prompt: "What did you see when you traced the course of the veins?" },
    { id: "knife", x: 60, y: 10, w: 30, h: 30, label: "The Knife", prompt: "How did dissection at Santa Maria Nuova change your art?" },
  ],
  "p-ornithopter": [
    { id: "wings", x: 10, y: 15, w: 80, h: 50, label: "The Wings", prompt: "How did you study birds to design this flying machine?" },
    { id: "pilot", x: 35, y: 45, w: 30, h: 40, label: "The Pilot", prompt: "Did you believe man could truly fly in your age?" },
  ],
  "p-lady-ermine": [
    { id: "ermine", x: 55, y: 45, w: 30, h: 35, label: "The Ermine", prompt: "Why did you place an ermine in Cecilia's arms?" },
    { id: "gesture", x: 25, y: 30, w: 40, h: 50, label: "Her Gesture", prompt: "How does gesture reveal character in portraiture?" },
  ],
  "p-saint-john": [
    { id: "finger", x: 42, y: 35, w: 20, h: 40, label: "Pointing Finger", prompt: "What does the Baptist's finger toward heaven signify?" },
    { id: "smile", x: 38, y: 20, w: 28, h: 22, label: "The Smile", prompt: "Why paint John with such an enigmatic smile?" },
  ],
  "p-tank": [
    { id: "shell", x: 15, y: 25, w: 70, h: 55, label: "Armoured Shell", prompt: "How did you conceive this turtle-shaped war machine?" },
    { id: "cannons", x: 20, y: 40, w: 60, h: 30, label: "The Cannons", prompt: "Why array cannons in every direction on one vehicle?" },
  ],
  "p-water-study": [
    { id: "vortex", x: 30, y: 35, w: 45, h: 40, label: "The Vortex", prompt: "What did swirling water teach you about motion?" },
    { id: "arno", x: 10, y: 60, w: 80, h: 30, label: "The Arno", prompt: "How did the Arno river shape your engineering?" },
  ],
  "p-skull-sections": [
    { id: "chambers", x: 35, y: 25, w: 35, h: 45, label: "Skull Chambers", prompt: "Why did you saw the skull to study its chambers?" },
  ],
  "p-heart-blood": [
    { id: "chambers", x: 30, y: 30, w: 45, h: 45, label: "Four Chambers", prompt: "What did you discover about the heart's chambers?" },
  ],
  "c-art-2": [
    { id: "shadow", x: 15, y: 35, w: 70, h: 35, label: "Shadow & Light", prompt: "How did shadow shape the drama of the Last Supper?" },
  ],
  "c-eng-1": [
    { id: "bird", x: 20, y: 20, w: 65, h: 50, label: "The Bird", prompt: "You wrote a bird is an instrument of mathematical law — explain." },
  ],
  "c-eng-2": [
    { id: "vortex", x: 25, y: 30, w: 50, h: 45, label: "Water Vortex", prompt: "What did swirling water teach you about motion and power?" },
  ],
  "c-eng-3": [
    { id: "shell", x: 15, y: 25, w: 70, h: 55, label: "Armoured Shell", prompt: "How did you conceive this turtle-shaped war machine?" },
  ],
  "c-eng-4": [
    { id: "screw", x: 30, y: 20, w: 45, h: 55, label: "Aerial Screw", prompt: "Did you imagine this screw could lift a man into the air?" },
  ],
  "c-eng-5": [
    { id: "lock", x: 20, y: 35, w: 60, h: 45, label: "Canal Lock", prompt: "How would your locks bring prosperity to Milan?" },
  ],
  "c-eng-6": [
    { id: "fossil", x: 25, y: 30, w: 55, h: 45, label: "Fossil Shell", prompt: "What did fossils on mountain peaks teach you about time?" },
  ],
  "c-anatomy-2": [
    { id: "heart", x: 30, y: 30, w: 45, h: 45, label: "The Heart", prompt: "What did you understand about the heart's chambers?" },
  ],
  "c-anatomy-3": [
    { id: "shoulder", x: 20, y: 25, w: 60, h: 50, label: "Shoulder Joint", prompt: "Why is the shoulder the joint of greatest liberty?" },
  ],
  "c-anatomy-4": [
    { id: "eye", x: 30, y: 25, w: 45, h: 40, label: "The Eye", prompt: "How does the eye bend light through its humours?" },
  ],
  "c-anatomy-5": [
    { id: "womb", x: 25, y: 35, w: 55, h: 45, label: "The Womb", prompt: "What did you learn from studying life before birth?" },
  ],
  "c-anatomy-6": [
    { id: "spine", x: 30, y: 25, w: 45, h: 50, label: "The Spine", prompt: "How does the spine bend with grace when the figure moves?" },
  ],
  "c-art-3": [
    { id: "proportion", x: 20, y: 15, w: 65, h: 75, label: "Proportion", prompt: "Explain the Vitruvian Man and man's place in the cosmos." },
  ],
  "c-art-4": [
    { id: "hands", x: 20, y: 30, w: 65, h: 45, label: "Study of Hands", prompt: "Why did you study hands so obsessively?" },
  ],
  "c-art-5": [
    { id: "mirror", x: 15, y: 25, w: 70, h: 50, label: "Mirror Writing", prompt: "Why did you write backwards in your notebooks?" },
  ],
  "c-art-6": [
    { id: "battle", x: 15, y: 30, w: 75, h: 50, label: "Battle Motion", prompt: "How do you paint horses and men interlocked in fury?" },
  ],
  "p-battle-anghiari": [
    { id: "horses", x: 15, y: 30, w: 70, h: 50, label: "The Horses", prompt: "How do you paint motion and violence in battle?" },
  ],
  "p-anatomy-eye": [
    { id: "eye", x: 30, y: 25, w: 45, h: 40, label: "The Eye", prompt: "How does the eye relate to painting?" },
  ],
  "p-anatomy-embryo": [
    { id: "fetus", x: 30, y: 35, w: 45, h: 45, label: "The Fetus", prompt: "Why draw the fetus curled in its chamber?" },
  ],
  "p-anatomy-shoulder": [
    { id: "muscle", x: 20, y: 25, w: 60, h: 50, label: "Muscle Layers", prompt: "Why did you draw the shoulder in layers of muscle?" },
    { id: "motion", x: 10, y: 60, w: 80, h: 30, label: "Motion", prompt: "How does the shoulder's freedom of movement inform battle scenes?" },
  ],
};

export function hotspotsForFolio(folioId: string): Hotspot[] {
  if (FOLIO_HOTSPOTS[folioId]) return FOLIO_HOTSPOTS[folioId];
  return [
    { id: "centre", x: 25, y: 30, w: 50, h: 40, label: "Study this", prompt: "Leonardo, speak to me about what we see here before us." },
    { id: "margin", x: 5, y: 70, w: 90, h: 25, label: "Read the notes", prompt: "What does this passage in your notebook mean for the painter?" },
  ];
}
