import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post('/api/gemini', async (req, res) => {
  const { texte, langue } = req.body;

  if (!texte) {
    return res.status(400).json({ error: "Le champ 'texte' est requis." });
  }

  const prompt = `
Réponds uniquement avec le contenu demandé, sans salutation, sans introduction, sans mise en contexte.

Voici le texte saisi: "${texte}"

Tâche :
- Fournis exactement 3 reformulations du texte saisi, chacune dans un style différent : soutenu, courant, familier.

⚠️ Règles :
- Toute ta réponse doit être rédigée uniquement en ${langue} quelque soit la langue du texte saisi.
exemple de réponse attendue : une petite espace entre chaque reformulation.

1. ....
2. ....
3. ....

`;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          key: process.env.GEMINI_KEY
        }
      }
    );

    const output = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.json({ texte, output });
  } catch (error) {
    console.error("Erreur Gemini:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Échec de la génération Gemini",
      details: error.response?.data?.error?.message || error.message
    });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Serveur Gemini Flash actif sur http://localhost:${PORT}`);
});

// Pour tester rapidement le serveur
app.get('/', (req, res) => {
  res.send('✅ Serveur Gemini Flash est en cours d\'exécution !');
});
