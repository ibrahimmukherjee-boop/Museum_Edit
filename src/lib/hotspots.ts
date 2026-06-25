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
  // —— Studio ——
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

  "p-lady-ermine": [
    { id: "ermine", x: 35, y: 30, w: 30, h: 45, label: "The Ermine", prompt: "Why did you include the ermine in Cecilia's portrait?" },
    { id: "gaze", x: 38, y: 22, w: 28, h: 20, label: "Her Gaze", prompt: "What were you seeking in her turned gaze?" },
  ],
  "p-saint-john": [
    { id: "finger", x: 40, y: 25, w: 22, h: 35, label: "Raised Finger", prompt: "Why does Saint John point upward?" },
    { id: "smile", x: 38, y: 20, w: 28, h: 22, label: "The Smile", prompt: "Is this the same enigma you painted in the Mona Lisa?" },
  ],
  "p-battle-anghiari": [
    { id: "horses", x: 15, y: 25, w: 70, h: 45, label: "The Horses", prompt: "What were you trying to capture in the fury of battle?" },
    { id: "faces", x: 25, y: 35, w: 50, h: 35, label: "Faces of Rage", prompt: "How did you study rage in the faces of warriors?" },
  ],
  "p-virgin-rocks": [
    { id: "grotto", x: 10, y: 15, w: 80, h: 70, label: "The Grotto", prompt: "How did you create the atmosphere in the grotto?" },
    { id: "mary", x: 35, y: 25, w: 30, h: 50, label: "Mary", prompt: "How did you dissolve rock, water, and flesh into one light?" },
  ],

  // —— Dissection ——
  "c-anatomy-1": [
    { id: "veins", x: 15, y: 30, w: 70, h: 40, label: "The Vessels", prompt: "What did you see when you traced the course of the veins?" },
    { id: "knife", x: 60, y: 10, w: 30, h: 30, label: "The Knife", prompt: "How did dissection at Santa Maria Nuova change your art?" },
  ],
  "c-anatomy-2": [
    { id: "chambers", x: 30, y: 30, w: 45, h: 45, label: "Four Chambers", prompt: "What did you discover about the heart's chambers?" },
  ],
  "c-anatomy-3": [
    { id: "skull", x: 35, y: 25, w: 35, h: 45, label: "Skull Chambers", prompt: "Why did you saw the skull to study its chambers?" },
  ],
  "c-anatomy-4": [
    { id: "eye", x: 30, y: 25, w: 45, h: 40, label: "The Eye", prompt: "How does the eye bend light through its humours?" },
  ],
  "c-anatomy-5": [
    { id: "womb", x: 25, y: 35, w: 55, h: 45, label: "The Womb", prompt: "What did you learn from studying life before birth?" },
  ],
  "c-anatomy-6": [
    { id: "thigh", x: 20, y: 25, w: 60, h: 50, label: "Thigh Muscles", prompt: "How did you study the muscles of the leg?" },
  ],
  "c-anatomy-7": [
    { id: "foot", x: 25, y: 30, w: 55, h: 45, label: "Foot & Calf", prompt: "What does the foot reveal about movement?" },
  ],
  "c-anatomy-8": [
    { id: "bear", x: 25, y: 28, w: 55, h: 48, label: "Bear's Foot", prompt: "Why did you dissect a bear's foot?" },
  ],

  // —— Workshop ——
  "c-eng-1": [
    { id: "wings", x: 10, y: 15, w: 80, h: 50, label: "The Wings", prompt: "How did you study birds to design this flying machine?" },
    { id: "pilot", x: 35, y: 45, w: 30, h: 40, label: "The Pilot", prompt: "Did you believe man could truly fly in your age?" },
  ],
  "c-eng-2": [
    { id: "shell", x: 15, y: 25, w: 70, h: 55, label: "Armoured Shell", prompt: "How did you conceive this turtle-shaped war machine?" },
    { id: "cannons", x: 20, y: 40, w: 60, h: 30, label: "The Cannons", prompt: "Why array cannons in every direction on one vehicle?" },
  ],
  "c-eng-3": [
    { id: "vortex", x: 30, y: 35, w: 45, h: 40, label: "The Vortex", prompt: "What did swirling water teach you about motion?" },
    { id: "arno", x: 10, y: 60, w: 80, h: 30, label: "The Arno", prompt: "How did the Arno river shape your engineering?" },
  ],
  "c-eng-4": [
    { id: "screw", x: 30, y: 20, w: 45, h: 55, label: "The Screw", prompt: "How does the water screw lift water against gravity?" },
  ],
  "c-eng-5": [
    { id: "aerial", x: 25, y: 18, w: 55, h: 55, label: "Aerial Screw", prompt: "Was the aerial screw the ancestor of the helicopter?" },
  ],
  "c-eng-6": [
    { id: "bow", x: 15, y: 25, w: 70, h: 50, label: "The Crossbow", prompt: "What was the purpose of such an enormous crossbow?" },
  ],
  "c-eng-7": [
    { id: "arch", x: 20, y: 35, w: 65, h: 40, label: "The Arch", prompt: "How could a bridge span so far without supports?" },
  ],
};

export function hotspotsForFolio(folioId: string): Hotspot[] {
  if (FOLIO_HOTSPOTS[folioId]) return FOLIO_HOTSPOTS[folioId];
  return [
    { id: "centre", x: 25, y: 30, w: 50, h: 40, label: "Study this", prompt: "Leonardo, speak to me about what we see here before us." },
    { id: "margin", x: 5, y: 70, w: 90, h: 25, label: "Read the notes", prompt: "What does this passage in your notebook mean for the painter?" },
  ];
}
