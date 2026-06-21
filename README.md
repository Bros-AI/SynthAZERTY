# 🎹 SynthAZERTY

Un instrument de musique web, **multilingue** et **sans aucune dépendance**.
Ouvre simplement `index.html` dans un navigateur moderne.

## 🎛️ Un vrai instrument expressif

SynthAZERTY n'est pas un simple piano : c'est un **synthétiseur jouable** avec
ses propres gestes d'expression.

- **🦶 ESPACE = pédale de sustain** — maintiens la barre d'espace pour laisser
  résonner les notes après les avoir relâchées.
- **〰️ MAJ (Shift) = vibrato** — maintiens Shift pour faire onduler la hauteur.
- **Moteur sonore** : deux oscillateurs légèrement désaccordés passant dans un
  **filtre passe-bas résonant**, pour un timbre riche et chaleureux.
- Réglages dédiés : **Brillance** (fréquence du filtre), **Résonance**, **Richesse**
  (désaccord des oscillateurs), en plus de timbre / volume / attaque / relâchement / octave.
- Deux **indicateurs lumineux** au-dessus du clavier montrent l'état du sustain et du vibrato.

## ✨ Fonctions

- **🎹 Jouer** — synthé polyphonique (Web Audio API) avec oscilloscope temps réel
  (forme d'onde ou spectre).
- **🎮 Apprendre** — mode Guitar Hero : les notes tombent au-dessus de la bonne
  touche, avec score, combos, précision, effets de particules et écran de résultats.
- **⏺ Créer** — enregistre ta propre mélodie au clavier, nomme-la et sauvegarde-la.
  Elle s'ajoute à la liste des chansons à apprendre (stockée dans le navigateur).
- **🌍 Multilingue** — Français, English, Español, Deutsch (changement instantané).
- 💾 Tes réglages, ta langue et tes chansons sont **mémorisés** automatiquement.

## 🎼 Chansons incluses

Do Ré Mi (échauffement) · Au clair de la lune · Frère Jacques ·
Ah ! vous dirai-je maman · Ode à la joie · Für Elise · Jingle Bells ·
London Bridge · Old MacDonald · When the Saints.

## ⌨️ Comment jouer

- **Touches blanches** : `Q S D F G H J K L M`
- **Touches noires** : `Z E T Y U O P` (rangée du dessus)
- Ou **clique** directement sur les touches à l'écran.

## 🎧 Mode apprentissage

1. Onglet **Apprendre**, choisis une chanson.
2. **🔊 Écouter** pour entendre la mélodie (les touches s'illuminent).
3. **▶ Jouer** : reproduis les notes qui tombent quand elles atteignent la ligne.
4. Ajuste la **Vitesse** selon ton niveau.

## ⏺ Créer une chanson

1. Onglet **Créer** → **⏺ Enregistrer**.
2. Joue ta mélodie au clavier (le rythme est capturé tel que tu le joues).
3. **⏹ Arrêter**, donne un nom, puis **💾 Sauvegarder**.
4. Elle apparaît dans **Mes chansons** et dans la liste de l'onglet Apprendre.

## 📁 Fichiers

| Fichier      | Rôle                                                |
|--------------|-----------------------------------------------------|
| `index.html` | Structure de la page (onglets, panneaux)            |
| `style.css`  | Thème néon sombre, animations                       |
| `i18n.js`    | Traductions FR / EN / ES / DE                       |
| `songs.js`   | Mapping clavier AZERTY + bibliothèque de chansons   |
| `app.js`     | Audio, oscilloscope, clavier, jeu, enregistreur, UI |
