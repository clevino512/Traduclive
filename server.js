import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch"; // si tu utilises Node < 18

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ✅ Route POST pour traduire avec DeepL
app.post("/api/translate", async (req, res) => {
  const { 
    text, 
    source_lang, 
    target_lang, 
    alternatives 
  } = req.body;

  if (!text || !target_lang) {
    return res.status(400).json({ error: "Texte et langue cible sont requis." });
  }

  try {
    const response = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        auth_key: process.env.DEEPL_KEY, // ⚡ mettre ta clé DeepL dans .env
        text,
        source_lang: source_lang || "",
        target_lang,
        ...(alternatives ? { alternatives: String(alternatives) } : {}), // optionnel
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();

    res.json({
      translations: data.translations.map((t) => t.text),
    });
  } catch (error) {
    console.error("Erreur API DeepL:", error);
    console.log(text, source_lang, target_lang, alternatives);
    res.status(500).json({ error: "Erreur avec DeepL API", details: error.message || error.toString() });
  }
});

  app.get("/", (req, res) => {
    const { text, source_lang, target_lang, alternatives } = req.query;
    console.log("Requête reçue :", 
      { text, 
        source_lang, 
        target_lang, 
        alternatives });
    });

    res.send("✅ Bienvenue sur le serveur Traduclive avec DeepL !");
    console.log("Clé API DeepL chargée :", process.env.DEEPL_KEY);

app.listen(port, () => console.log(`🚀 Serveur démarré sur http://localhost:${port}`));
