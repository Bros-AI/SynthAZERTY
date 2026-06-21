"use strict";

/* =========================================================================
   Mapping clavier AZERTY -> notes (une octave + extension)
   - Touches blanches : Q S D F G H J K L M
   - Touches noires   : Z E T Y U O P
   midi : numéro MIDI (Do4 = 60).  name : nom français de la note.
   ========================================================================= */
const KEYS = [
  { key: "q", midi: 60, name: "Do",  type: "white" },
  { key: "z", midi: 61, name: "Do#", type: "black" },
  { key: "s", midi: 62, name: "Ré",  type: "white" },
  { key: "e", midi: 63, name: "Ré#", type: "black" },
  { key: "d", midi: 64, name: "Mi",  type: "white" },
  { key: "f", midi: 65, name: "Fa",  type: "white" },
  { key: "t", midi: 66, name: "Fa#", type: "black" },
  { key: "g", midi: 67, name: "Sol", type: "white" },
  { key: "y", midi: 68, name: "Sol#",type: "black" },
  { key: "h", midi: 69, name: "La",  type: "white" },
  { key: "u", midi: 70, name: "La#", type: "black" },
  { key: "j", midi: 71, name: "Si",  type: "white" },
  { key: "k", midi: 72, name: "Do",  type: "white" },
  { key: "o", midi: 73, name: "Do#", type: "black" },
  { key: "l", midi: 74, name: "Ré",  type: "white" },
  { key: "p", midi: 75, name: "Ré#", type: "black" },
  { key: "m", midi: 76, name: "Mi",  type: "white" },
];

const KEY_BY_LETTER = Object.fromEntries(KEYS.map((k) => [k.key, k]));
const KEY_BY_MIDI = Object.fromEntries(KEYS.map((k) => [k.midi, k]));

/* =========================================================================
   Notes (constantes MIDI) pour écrire les mélodies lisiblement
   Octave jouable : Do4(60) -> Mi5(76)
   ========================================================================= */
const DO = 60, DOd = 61, RE = 62, REd = 63, MI = 64, FA = 65, FAd = 66,
      SOL = 67, SOLd = 68, LA = 69, LAd = 70, SI = 71,
      DO2 = 72, DO2d = 73, RE2 = 74, RE2d = 75, MI2 = 76;
const _ = null; // silence / pause

// seq(bpm, [[midi, dureeEnTemps], ...]) -> {bpm, notes:[{midi,beat,dur}], beats}
function seq(bpm, notes) {
  let t = 0;
  const out = [];
  for (const [midi, dur] of notes) {
    if (midi !== null) out.push({ midi, beat: t, dur });
    t += dur;
  }
  return { bpm, notes: out, beats: t };
}

/* =========================================================================
   Presets de sons (timbres prêts à l'emploi)
   wave : sine|triangle|sawtooth|square
   attack/release : millisecondes
   bright/res/rich : 0-100 (brillance du filtre / résonance / désaccord)
   ========================================================================= */
const PRESETS = [
  { name: "🎹 Piano",          wave: "triangle", attack: 4,   release: 350,  bright: 72, res: 8,  rich: 22 },
  { name: "📻 Orgue",          wave: "square",   attack: 4,   release: 120,  bright: 55, res: 4,  rich: 12 },
  { name: "🎮 8-bit",          wave: "square",   attack: 2,   release: 80,   bright: 92, res: 0,  rich: 0  },
  { name: "🌊 Nappe (Pad)",    wave: "sawtooth", attack: 420, release: 1300, bright: 44, res: 12, rich: 72 },
  { name: "🎸 Lead synthé",    wave: "sawtooth", attack: 8,   release: 240,  bright: 86, res: 22, rich: 42 },
  { name: "🔔 Cloche",         wave: "sine",     attack: 2,   release: 1600, bright: 96, res: 6,  rich: 10 },
  { name: "🎻 Cordes",         wave: "sawtooth", attack: 240, release: 700,  bright: 60, res: 10, rich: 62 },
  { name: "🎵 Boîte à musique", wave: "triangle", attack: 2,  release: 950,  bright: 100, res: 4, rich: 6  },
  { name: "🫧 Doux",           wave: "sine",     attack: 28,  release: 520,  bright: 50, res: 3,  rich: 16 },
  { name: "🪕 Pizzicato",      wave: "triangle", attack: 2,   release: 200,  bright: 82, res: 16, rich: 26 },
  { name: "🎷 Anche",          wave: "sawtooth", attack: 40,  release: 300,  bright: 66, res: 26, rich: 32 },
  { name: "💥 Basse",          wave: "square",   attack: 6,   release: 220,  bright: 28, res: 18, rich: 12 },
  { name: "🎺 Cuivres",        wave: "sawtooth", attack: 55,  release: 300,  bright: 70, res: 16, rich: 36 },
  { name: "🪗 Accordéon",      wave: "triangle", attack: 18,  release: 260,  bright: 62, res: 8,  rich: 46 },
  { name: "🛸 Sci-Fi",         wave: "sawtooth", attack: 120, release: 850,  bright: 76, res: 36, rich: 82 },
  { name: "👻 Fantôme",        wave: "sine",     attack: 320, release: 1500, bright: 40, res: 32, rich: 52 },
];

/* =========================================================================
   Bibliothèque de chansons intégrées (domaine public / traditionnel)
   ========================================================================= */
const SONGS = {
  "gamme": {
    title: "Do Ré Mi · Échauffement",
    ...seq(100, [
      [DO,1],[RE,1],[MI,1],[FA,1],[SOL,1],[LA,1],[SI,1],[DO2,1],
      [DO2,1],[SI,1],[LA,1],[SOL,1],[FA,1],[MI,1],[RE,1],[DO,2],
    ]),
  },
  "au-clair": {
    title: "Au clair de la lune",
    ...seq(96, [
      [DO,1],[DO,1],[DO,1],[RE,1],[MI,2],[RE,2],
      [DO,1],[MI,1],[RE,1],[RE,1],[DO,4],
      [DO,1],[DO,1],[DO,1],[RE,1],[MI,2],[RE,2],
      [DO,1],[MI,1],[RE,1],[RE,1],[DO,4],
    ]),
  },
  "frere-jacques": {
    title: "Frère Jacques",
    ...seq(112, [
      [DO,1],[RE,1],[MI,1],[DO,1],
      [DO,1],[RE,1],[MI,1],[DO,1],
      [MI,1],[FA,1],[SOL,2],
      [MI,1],[FA,1],[SOL,2],
      [SOL,.5],[LA,.5],[SOL,.5],[FA,.5],[MI,1],[DO,1],
      [SOL,.5],[LA,.5],[SOL,.5],[FA,.5],[MI,1],[DO,1],
      [DO,1],[SOL,1],[DO,2],
      [DO,1],[SOL,1],[DO,2],
    ]),
  },
  "twinkle": {
    title: "Ah ! vous dirai-je maman",
    ...seq(112, [
      [DO,1],[DO,1],[SOL,1],[SOL,1],[LA,1],[LA,1],[SOL,2],
      [FA,1],[FA,1],[MI,1],[MI,1],[RE,1],[RE,1],[DO,2],
      [SOL,1],[SOL,1],[FA,1],[FA,1],[MI,1],[MI,1],[RE,2],
      [SOL,1],[SOL,1],[FA,1],[FA,1],[MI,1],[MI,1],[RE,2],
      [DO,1],[DO,1],[SOL,1],[SOL,1],[LA,1],[LA,1],[SOL,2],
      [FA,1],[FA,1],[MI,1],[MI,1],[RE,1],[RE,1],[DO,2],
    ]),
  },
  "ode-joie": {
    title: "Ode à la joie · Beethoven",
    ...seq(120, [
      [MI,1],[MI,1],[FA,1],[SOL,1],[SOL,1],[FA,1],[MI,1],[RE,1],
      [DO,1],[DO,1],[RE,1],[MI,1],[MI,1.5],[RE,.5],[RE,2],
      [MI,1],[MI,1],[FA,1],[SOL,1],[SOL,1],[FA,1],[MI,1],[RE,1],
      [DO,1],[DO,1],[RE,1],[MI,1],[RE,1.5],[DO,.5],[DO,2],
    ]),
  },
  "fur-elise": {
    title: "Für Elise · Beethoven",
    ...seq(82, [
      [MI2,.5],[RE2d,.5],[MI2,.5],[RE2d,.5],[MI2,.5],[SI,.5],[RE2,.5],[DO2,.5],[LA,1],
      [DO,.5],[MI,.5],[LA,.5],[SI,1],
      [MI,.5],[SOLd,.5],[SI,.5],[DO2,1],
      [MI2,.5],[RE2d,.5],[MI2,.5],[RE2d,.5],[MI2,.5],[SI,.5],[RE2,.5],[DO2,.5],[LA,1],
      [DO,.5],[MI,.5],[LA,.5],[SI,1],
      [MI,.5],[DO2,.5],[SI,.5],[LA,1.5],
    ]),
  },
  "jingle": {
    title: "Jingle Bells",
    ...seq(120, [
      [MI,1],[MI,1],[MI,2],[MI,1],[MI,1],[MI,2],
      [MI,1],[SOL,1],[DO,1.5],[RE,.5],[MI,4],
      [FA,1],[FA,1],[FA,1],[FA,1],[FA,1],[MI,1],[MI,1],[MI,.5],[MI,.5],
      [MI,1],[RE,1],[RE,1],[MI,1],[RE,2],[SOL,2],
    ]),
  },
  "london-bridge": {
    title: "London Bridge",
    ...seq(120, [
      [SOL,1.5],[LA,.5],[SOL,1],[FA,1],[MI,1],[FA,1],[SOL,2],
      [RE,1],[MI,1],[FA,2],[MI,1],[FA,1],[SOL,2],
      [SOL,1.5],[LA,.5],[SOL,1],[FA,1],[MI,1],[FA,1],[SOL,2],
      [RE,2],[SOL,1],[MI,1],[DO,2],
    ]),
  },
  "old-macdonald": {
    title: "Old MacDonald",
    ...seq(120, [
      [DO,1],[DO,1],[DO,1],[SOL,1],[LA,1],[LA,1],[SOL,2],
      [MI,1],[MI,1],[RE,1],[RE,1],[DO,2],
      [SOL,1],[DO,1],[DO,1],[DO,1],[SOL,1],[LA,1],[LA,1],[SOL,2],
      [MI,1],[MI,1],[RE,1],[RE,1],[DO,2],
    ]),
  },
  "saints": {
    title: "When the Saints",
    ...seq(120, [
      [DO,1],[MI,1],[FA,1],[SOL,3],
      [DO,1],[MI,1],[FA,1],[SOL,3],
      [DO,1],[MI,1],[FA,1],[SOL,2],[MI,1],[DO,1],[MI,1],[RE,3],
      [MI,1],[MI,1],[RE,1],[DO,2],[DO,1],[MI,1],[SOL,1.5],[SOL,.5],[FA,2],
      [MI,1],[FA,1],[SOL,1],[MI,1],[DO,1],[RE,1],[DO,3],
    ]),
  },
};
