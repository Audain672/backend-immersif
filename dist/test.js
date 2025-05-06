"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createAudio_1 = require("./createAudio"); // Assure-toi que le chemin est correct
const testText = "Bonjour, ceci est un test de génération audio avec ElevenLabs.";
(0, createAudio_1.createAudioFileFromText)(testText)
    .then((fileName) => {
    console.log(`Fichier audio généré avec succès : ${fileName}`);
})
    .catch((error) => {
    console.error("Erreur lors de la génération de l'audio :", error);
});
