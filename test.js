import dotenv from 'dotenv';
import { ElevenLabsClient } from 'elevenlabs';
import { createWriteStream } from 'fs';
import { v4 as uuid } from 'uuid';

dotenv.config();
console.log('API Key:', process.env.ELEVEN_LABS_API_KEY);

const ELEVENLABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;

const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

export const createAudioFileFromText = async (text) => {
  return new Promise(async (resolve, reject) => {
    try {
      const audio = await client.textToSpeech.convert('JBFqnCBsd6RMkjVDRZzb', {
        model_id: 'eleven_multilingual_v2',
        text,
        output_format: 'mp3_44100_128',
        voice_settings: {
          stability: 0,
          similarity_boost: 0,
          use_speaker_boost: true,
          speed: 1.0,
        },
      });

      const fileName = `${uuid()}.mp3`;
      const fileStream = createWriteStream(fileName);

      audio.pipe(fileStream);
      fileStream.on('finish', () => resolve(fileName));
      fileStream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

// Test function
const testText = "Bonjour, ceci est un test de synthèse vocale.";

createAudioFileFromText(testText)
  .then(fileName => {
    console.log(`Fichier audio créé avec succès : ${fileName}`);
  })
  .catch(error => {
    console.error(`Erreur lors de la création du fichier audio : ${error.message}`);
  });
