"use strict";

/* =========================================================================
   Système multilingue (i18n)
   Langues : Français, English, Español, Deutsch
   ========================================================================= */
const TRANSLATIONS = {
  fr: {
    "lang.name": "Français",
    "app.subtitle": "Clavier musical · Oscilloscope · Apprends en mode Guitar Hero",
    "tab.play": "🎹 Jouer",
    "tab.learn": "🎮 Apprendre",
    "tab.create": "⏺ Créer",

    "play.title": "Mode libre",
    "play.desc": "Joue avec ton clavier ou la souris. Regarde le son vivre dans l'oscilloscope.",

    "set.timbre": "Timbre",
    "set.volume": "Volume",
    "set.attack": "Attaque",
    "set.release": "Relâchement",
    "set.octave": "Octave",
    "set.scope": "Affichage",

    "wave.sine": "Sinusoïde (doux)",
    "wave.triangle": "Triangle",
    "wave.sawtooth": "Dent de scie (riche)",
    "wave.square": "Carré (rétro)",

    "scope.wave": "Forme d'onde",
    "scope.spectrum": "Spectre",
    "scope.label": "OSCILLOSCOPE",

    "learn.song": "Chanson",
    "learn.play": "▶ Jouer",
    "learn.listen": "🔊 Écouter",
    "learn.stop": "■ Stop",
    "learn.speed": "Vitesse",
    "learn.score": "Score",
    "learn.combo": "Combo",
    "learn.accuracy": "Précision",
    "learn.idle": "Choisis une chanson puis clique sur ▶ Jouer — les notes tombent, appuie sur la touche au bon moment !",
    "learn.builtin": "Chansons",
    "learn.custom": "Mes chansons",

    "judge.perfect": "PARFAIT",
    "judge.great": "BIEN",
    "judge.ok": "OK",
    "judge.miss": "RATÉ",

    "res.perfect": "Parfait ! 🌟",
    "res.excellent": "Excellent ! 🎉",
    "res.good": "Bien joué ! 👍",
    "res.ok": "Pas mal !",
    "res.practice": "Continue à t'entraîner 💪",
    "res.notes": "Notes réussies",
    "res.accuracy": "Précision",
    "res.bestcombo": "Meilleur combo",
    "res.close": "Fermer",

    "create.title": "Compose ta musique",
    "create.desc": "Clique sur Enregistrer, joue ta mélodie au clavier, puis sauvegarde-la. Elle apparaîtra dans la liste des chansons à apprendre.",
    "create.rec": "⏺ Enregistrer",
    "create.stop": "⏹ Arrêter",
    "create.recording": "● Enregistrement…",
    "create.name": "Nom de la chanson",
    "create.namePh": "Ma mélodie",
    "create.save": "💾 Sauvegarder",
    "create.discard": "🗑 Effacer",
    "create.mysongs": "Mes chansons",
    "create.empty": "Aucune chanson pour l'instant. Enregistre ta première mélodie !",
    "create.del": "Supprimer",
    "create.load": "Apprendre",
    "create.saved": "Chanson sauvegardée ✔",
    "create.needNotes": "Joue au moins une note avant de sauvegarder.",
    "create.confirmDel": "Supprimer cette chanson ?",
    "create.notesCount": "notes",

    "set.preset": "Preset / Son",
    "set.custom": "🎚️ Personnalisé",
    "set.brightness": "Brillance",
    "set.resonance": "Résonance",
    "set.richness": "Richesse",
    "expr.sustain": "Sustain",
    "expr.vibrato": "Vibrato",
    "expr.space": "ESPACE",
    "expr.shift": "MAJ",

    "hint.body": "Touches blanches : <kbd>Q S D F G H J K L M</kbd> · Touches noires : <kbd>Z E T Y U O P</kbd> · <kbd>Espace</kbd> sustain · <kbd>Maj</kbd> vibrato.",

    "footer.madeby": "Créé avec",
    "footer.follow": "⭐ Me suivre",
    "follow.title": "Tu aimes SynthAZERTY ?",
    "follow.subtitle": "Suis-moi et mets une étoile au projet, ça aide énormément !",
    "follow.star": "⭐ Star le projet",
    "follow.github": "Suivre sur GitHub",
    "follow.later": "Plus tard",
  },

  en: {
    "lang.name": "English",
    "app.subtitle": "Music keyboard · Oscilloscope · Learn in Guitar Hero mode",
    "tab.play": "🎹 Play",
    "tab.learn": "🎮 Learn",
    "tab.create": "⏺ Create",

    "play.title": "Free play",
    "play.desc": "Play with your keyboard or mouse. Watch the sound come alive in the oscilloscope.",

    "set.timbre": "Timbre",
    "set.volume": "Volume",
    "set.attack": "Attack",
    "set.release": "Release",
    "set.octave": "Octave",
    "set.scope": "Display",

    "wave.sine": "Sine (soft)",
    "wave.triangle": "Triangle",
    "wave.sawtooth": "Sawtooth (rich)",
    "wave.square": "Square (retro)",

    "scope.wave": "Waveform",
    "scope.spectrum": "Spectrum",
    "scope.label": "OSCILLOSCOPE",

    "learn.song": "Song",
    "learn.play": "▶ Play",
    "learn.listen": "🔊 Listen",
    "learn.stop": "■ Stop",
    "learn.speed": "Speed",
    "learn.score": "Score",
    "learn.combo": "Combo",
    "learn.accuracy": "Accuracy",
    "learn.idle": "Pick a song then click ▶ Play — notes fall, hit the key at the right moment!",
    "learn.builtin": "Songs",
    "learn.custom": "My songs",

    "judge.perfect": "PERFECT",
    "judge.great": "GREAT",
    "judge.ok": "OK",
    "judge.miss": "MISS",

    "res.perfect": "Perfect! 🌟",
    "res.excellent": "Excellent! 🎉",
    "res.good": "Well played! 👍",
    "res.ok": "Not bad!",
    "res.practice": "Keep practising 💪",
    "res.notes": "Notes hit",
    "res.accuracy": "Accuracy",
    "res.bestcombo": "Best combo",
    "res.close": "Close",

    "create.title": "Compose your music",
    "create.desc": "Click Record, play your melody on the keyboard, then save it. It will appear in the song list to learn.",
    "create.rec": "⏺ Record",
    "create.stop": "⏹ Stop",
    "create.recording": "● Recording…",
    "create.name": "Song name",
    "create.namePh": "My melody",
    "create.save": "💾 Save",
    "create.discard": "🗑 Discard",
    "create.mysongs": "My songs",
    "create.empty": "No songs yet. Record your first melody!",
    "create.del": "Delete",
    "create.load": "Learn",
    "create.saved": "Song saved ✔",
    "create.needNotes": "Play at least one note before saving.",
    "create.confirmDel": "Delete this song?",
    "create.notesCount": "notes",

    "set.preset": "Preset / Sound",
    "set.custom": "🎚️ Custom",
    "set.brightness": "Brightness",
    "set.resonance": "Resonance",
    "set.richness": "Richness",
    "expr.sustain": "Sustain",
    "expr.vibrato": "Vibrato",
    "expr.space": "SPACE",
    "expr.shift": "SHIFT",

    "hint.body": "White keys: <kbd>Q S D F G H J K L M</kbd> · Black keys: <kbd>Z E T Y U O P</kbd> · <kbd>Space</kbd> sustain · <kbd>Shift</kbd> vibrato.",

    "footer.madeby": "Made with",
    "footer.follow": "⭐ Follow me",
    "follow.title": "Enjoying SynthAZERTY?",
    "follow.subtitle": "Follow me and star the project — it helps a lot!",
    "follow.star": "⭐ Star the project",
    "follow.github": "Follow on GitHub",
    "follow.later": "Maybe later",
  },

  es: {
    "lang.name": "Español",
    "app.subtitle": "Teclado musical · Osciloscopio · Aprende en modo Guitar Hero",
    "tab.play": "🎹 Tocar",
    "tab.learn": "🎮 Aprender",
    "tab.create": "⏺ Crear",

    "play.title": "Juego libre",
    "play.desc": "Toca con tu teclado o el ratón. Mira el sonido cobrar vida en el osciloscopio.",

    "set.timbre": "Timbre",
    "set.volume": "Volumen",
    "set.attack": "Ataque",
    "set.release": "Liberación",
    "set.octave": "Octava",
    "set.scope": "Pantalla",

    "wave.sine": "Senoidal (suave)",
    "wave.triangle": "Triangular",
    "wave.sawtooth": "Diente de sierra (rico)",
    "wave.square": "Cuadrada (retro)",

    "scope.wave": "Forma de onda",
    "scope.spectrum": "Espectro",
    "scope.label": "OSCILOSCOPIO",

    "learn.song": "Canción",
    "learn.play": "▶ Jugar",
    "learn.listen": "🔊 Escuchar",
    "learn.stop": "■ Parar",
    "learn.speed": "Velocidad",
    "learn.score": "Puntos",
    "learn.combo": "Combo",
    "learn.accuracy": "Precisión",
    "learn.idle": "Elige una canción y pulsa ▶ Jugar — las notas caen, ¡pulsa la tecla en el momento justo!",
    "learn.builtin": "Canciones",
    "learn.custom": "Mis canciones",

    "judge.perfect": "PERFECTO",
    "judge.great": "BIEN",
    "judge.ok": "OK",
    "judge.miss": "FALLO",

    "res.perfect": "¡Perfecto! 🌟",
    "res.excellent": "¡Excelente! 🎉",
    "res.good": "¡Bien jugado! 👍",
    "res.ok": "¡Nada mal!",
    "res.practice": "Sigue practicando 💪",
    "res.notes": "Notas acertadas",
    "res.accuracy": "Precisión",
    "res.bestcombo": "Mejor combo",
    "res.close": "Cerrar",

    "create.title": "Compón tu música",
    "create.desc": "Pulsa Grabar, toca tu melodía en el teclado y guárdala. Aparecerá en la lista de canciones para aprender.",
    "create.rec": "⏺ Grabar",
    "create.stop": "⏹ Parar",
    "create.recording": "● Grabando…",
    "create.name": "Nombre de la canción",
    "create.namePh": "Mi melodía",
    "create.save": "💾 Guardar",
    "create.discard": "🗑 Descartar",
    "create.mysongs": "Mis canciones",
    "create.empty": "Aún no hay canciones. ¡Graba tu primera melodía!",
    "create.del": "Eliminar",
    "create.load": "Aprender",
    "create.saved": "Canción guardada ✔",
    "create.needNotes": "Toca al menos una nota antes de guardar.",
    "create.confirmDel": "¿Eliminar esta canción?",
    "create.notesCount": "notas",

    "set.preset": "Preset / Sonido",
    "set.custom": "🎚️ Personalizado",
    "set.brightness": "Brillo",
    "set.resonance": "Resonancia",
    "set.richness": "Riqueza",
    "expr.sustain": "Sustain",
    "expr.vibrato": "Vibrato",
    "expr.space": "ESPACIO",
    "expr.shift": "MAYÚS",

    "hint.body": "Teclas blancas: <kbd>Q S D F G H J K L M</kbd> · Teclas negras: <kbd>Z E T Y U O P</kbd> · <kbd>Espacio</kbd> sustain · <kbd>Mayús</kbd> vibrato.",

    "footer.madeby": "Hecho con",
    "footer.follow": "⭐ Sígueme",
    "follow.title": "¿Te gusta SynthAZERTY?",
    "follow.subtitle": "Sígueme y dale una estrella al proyecto, ¡ayuda muchísimo!",
    "follow.star": "⭐ Estrella el proyecto",
    "follow.github": "Seguir en GitHub",
    "follow.later": "Más tarde",
  },

  de: {
    "lang.name": "Deutsch",
    "app.subtitle": "Musiktastatur · Oszilloskop · Lerne im Guitar-Hero-Modus",
    "tab.play": "🎹 Spielen",
    "tab.learn": "🎮 Lernen",
    "tab.create": "⏺ Erstellen",

    "play.title": "Freies Spiel",
    "play.desc": "Spiele mit deiner Tastatur oder Maus. Sieh den Klang im Oszilloskop lebendig werden.",

    "set.timbre": "Klangfarbe",
    "set.volume": "Lautstärke",
    "set.attack": "Anstieg",
    "set.release": "Ausklang",
    "set.octave": "Oktave",
    "set.scope": "Anzeige",

    "wave.sine": "Sinus (weich)",
    "wave.triangle": "Dreieck",
    "wave.sawtooth": "Sägezahn (reich)",
    "wave.square": "Rechteck (retro)",

    "scope.wave": "Wellenform",
    "scope.spectrum": "Spektrum",
    "scope.label": "OSZILLOSKOP",

    "learn.song": "Lied",
    "learn.play": "▶ Spielen",
    "learn.listen": "🔊 Anhören",
    "learn.stop": "■ Stopp",
    "learn.speed": "Tempo",
    "learn.score": "Punkte",
    "learn.combo": "Combo",
    "learn.accuracy": "Genauigkeit",
    "learn.idle": "Wähle ein Lied und klicke ▶ Spielen — die Noten fallen, triff die Taste im richtigen Moment!",
    "learn.builtin": "Lieder",
    "learn.custom": "Meine Lieder",

    "judge.perfect": "PERFEKT",
    "judge.great": "GUT",
    "judge.ok": "OK",
    "judge.miss": "DANEBEN",

    "res.perfect": "Perfekt! 🌟",
    "res.excellent": "Ausgezeichnet! 🎉",
    "res.good": "Gut gespielt! 👍",
    "res.ok": "Nicht schlecht!",
    "res.practice": "Übe weiter 💪",
    "res.notes": "Getroffene Noten",
    "res.accuracy": "Genauigkeit",
    "res.bestcombo": "Bester Combo",
    "res.close": "Schließen",

    "create.title": "Komponiere deine Musik",
    "create.desc": "Klicke auf Aufnehmen, spiele deine Melodie auf der Tastatur und speichere sie. Sie erscheint in der Liederliste zum Lernen.",
    "create.rec": "⏺ Aufnehmen",
    "create.stop": "⏹ Stopp",
    "create.recording": "● Aufnahme…",
    "create.name": "Liedname",
    "create.namePh": "Meine Melodie",
    "create.save": "💾 Speichern",
    "create.discard": "🗑 Verwerfen",
    "create.mysongs": "Meine Lieder",
    "create.empty": "Noch keine Lieder. Nimm deine erste Melodie auf!",
    "create.del": "Löschen",
    "create.load": "Lernen",
    "create.saved": "Lied gespeichert ✔",
    "create.needNotes": "Spiele mindestens eine Note vor dem Speichern.",
    "create.confirmDel": "Dieses Lied löschen?",
    "create.notesCount": "Noten",

    "set.preset": "Preset / Klang",
    "set.custom": "🎚️ Eigen",
    "set.brightness": "Helligkeit",
    "set.resonance": "Resonanz",
    "set.richness": "Fülle",
    "expr.sustain": "Sustain",
    "expr.vibrato": "Vibrato",
    "expr.space": "LEER",
    "expr.shift": "UMSCH",

    "hint.body": "Weiße Tasten: <kbd>Q S D F G H J K L M</kbd> · Schwarze Tasten: <kbd>Z E T Y U O P</kbd> · <kbd>Leer</kbd> Sustain · <kbd>Umsch</kbd> Vibrato.",

    "footer.madeby": "Erstellt mit",
    "footer.follow": "⭐ Folgen",
    "follow.title": "Gefällt dir SynthAZERTY?",
    "follow.subtitle": "Folge mir und gib dem Projekt einen Stern — das hilft sehr!",
    "follow.star": "⭐ Projekt mit Stern",
    "follow.github": "Auf GitHub folgen",
    "follow.later": "Später",
  },
};

const I18N = {
  lang: "fr",
  storeKey: "synthazerty.lang",

  init() {
    const saved = localStorage.getItem(this.storeKey);
    const guess = (navigator.language || "fr").slice(0, 2);
    this.lang = TRANSLATIONS[saved] ? saved : (TRANSLATIONS[guess] ? guess : "fr");
  },

  t(key) {
    return (TRANSLATIONS[this.lang] && TRANSLATIONS[this.lang][key]) || key;
  },

  set(lang) {
    if (!TRANSLATIONS[lang]) return;
    this.lang = lang;
    localStorage.setItem(this.storeKey, lang);
    this.apply();
  },

  apply() {
    document.documentElement.lang = this.lang;
    // textContent
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = this.t(el.dataset.i18n);
    });
    // innerHTML (pour le texte contenant des <kbd>)
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = this.t(el.dataset.i18nHtml);
    });
    // placeholders
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      el.placeholder = this.t(el.dataset.i18nPh);
    });
    // Permet aux modules de se rafraîchir (options, listes…)
    if (typeof UI !== "undefined" && UI.onLangChange) UI.onLangChange();
  },
};
