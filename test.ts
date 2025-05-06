import { createAudioFileFromText } from './createAudio'; // Assure-toi que le chemin est correct

const testText = "Bonjour, ceci est un test de génération audio avec ElevenLabs.";

createAudioFileFromText(testText)
  .then((fileName) => {
    console.log(`Fichier audio généré avec succès : ${fileName}`);
  })
  .catch((error) => {
    console.error("Erreur lors de la génération de l'audio :", error);
  });
