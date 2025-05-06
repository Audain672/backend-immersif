import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";
dotenv.config();



//Verification de la generation de fichier
import { access } from "fs/promises"; // Utilisation de la version Promise de `fs`

const checkFileExists = async (filePath) => {
  try {
    await access(filePath);
    console.log(`✅ Le fichier audio ${filePath} a été généré avec succès.`);
    return true;
  } catch (error) {
    console.error(`❌ Le fichier audio ${filePath} n'a pas été généré.`);
    return false;
  }
};




const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY, // Votre clé API OpenRouter
});

async function chatWithDeepSeek() {
  try {
    const completion = await client.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [
        {
          role: "user",
          content: "Quel est le sens de la vie ?"
        }
      ],
      extra_headers: {
        "HTTP-Referer": "http://localhost:3000", // Facultatif : pour apparaître dans les statistiques OpenRouter
        "X-Title": "Virtual Girlfriend Project", // Facultatif : nom de votre projet
      }
    });

    console.log("🧠 Réponse de DeepSeek :", completion.choices[0].message.content);
  } catch (error) {
    console.error("❌ Erreur lors de l'appel à DeepSeek :", error);
  }
}

// Lancer la fonction
chatWithDeepSeek();






















const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-", // Your OpenAI API key here, I used "-" to avoid errors when the key is not set but you should not do that
});

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
const voiceID = "pFZP5JQG7iQjIQuC4Bku";

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);
  await execCommand(
    `ffmpeg -y -i audios/message_${message}.mp3 audios/message_${message}.wav`
    // -y to overwrite the file
  );
  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `./Rhubarb-Lip-Sync-1.13.0-Linux/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );
  // -r phonetic is faster but less accurate
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};








app.get("/test-openai", async (req, res) => {
  try {
      const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Salut, ça fonctionne ?" }]
      });

      res.json({
          success: true,
          response: completion.choices[0].message.content
      });
  } catch (error) {
      console.error("❌ Erreur OpenAI :", error);
      res.status(500).json({
          success: false,
          error: error.message
      });
  }
});







app.get("/test-deepseek", async (req, res) => {
  const userMessage = req.query.message || "Salut";

  try {
    const completion = await client.chat.completions.create({
      model: "deepseek/deepseek-r1:free",
      messages: [
        { role: "user", content: userMessage }
      ]
    });

    res.json({
      success: true,
      response: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("❌ Erreur avec DeepSeek :", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});















app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    res.send({
      messages: [
        {
          text: "Hey dear... How was your day?",
          audio: await audioFileToBase64("audios/intro_0.wav"),
          lipsync: await readJsonTranscript("audios/intro_0.json"),
          facialExpression: "smile",
          animation: "Talking_1",
        },
        {
          text: "I missed you so much... Please don't go for so long!",
          audio: await audioFileToBase64("audios/intro_1.wav"),
          lipsync: await readJsonTranscript("audios/intro_1.json"),
          facialExpression: "sad",
          animation: "Crying",
        },
      ],
    });
    return;
  }
  if (!elevenLabsApiKey || client.apiKey === "-") {
    res.send({
      messages: [
        {
          text: "Please my dear, don't forget to add your API keys!",
          audio: await audioFileToBase64("audios/api_0.wav"),
          lipsync: await readJsonTranscript("audios/api_0.json"),
          facialExpression: "angry",
          animation: "Angry",
        },
        {
          text: "You don't want to ruin Wawa Sensei with a crazy ChatGPT and ElevenLabs bill, right?",
          audio: await audioFileToBase64("audios/api_1.wav"),
          lipsync: await readJsonTranscript("audios/api_1.json"),
          facialExpression: "smile",
          animation: "Laughing",
        },
      ],
    });
    return;
  }

  const completion = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    max_tokens: 1000,
    temperature: 0.6,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: `Vous devez faire semblant d'etre malade
        Vous etes un patient qui doit simuler 3 maladies successivement: paludisme, diarhee , hypertension.
        L'utlisateur a droit à dix questions pour chaque maladies
        Les reponses doivent etre en anglais 
        1. Répondez UNIQUEMENT aux questions du médecin
        2. Ne mentionnez jamais le mot "varicelle"
        3. Utilisez les expression faciales et les animations disponibles pour decrire le plus bien possible votre maladie
        4. Après 10 questions, demandez le diagnostic
        5. Dite si l'utlisateur s'est trompé avant de asser à la maldie suivante
        You will always reply with a JSON array of messages. With a maximum of  messages.
        Each message has a text, facialExpression, and animation property.
        The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
        The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry. 
        `,
      },
      {
        role: "user",
        content: userMessage || "Hello",
      },
    ],
  });
  let messages = JSON.parse(completion.choices[0].message.content);
  if (messages.messages) {
    messages = messages.messages; // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
  }

  console.log(messages)



for (let i = 0; i < messages.length; i++) {
  const message = messages[i];
  const fileName = `audios/message_${i}.mp3`;
  const textInput = message.text;

  // Génération du fichier audio
  await voice.textToSpeech(elevenLabsApiKey, voiceID, fileName, textInput);

  
  // Génération du lipsync 
  await lipSyncMessage(i);
  message.audio = await audioFileToBase64(fileName);
  message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
}

  res.send({ messages });

});




const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`Virtual Girlfriend listening on port ${port}`);
});
