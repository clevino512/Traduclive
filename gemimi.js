import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

// === Endpoint Gemini ===
app.post('/api/gemini', async (req, res) => {
  const { texte, langue } = req.body;

  if (!texte) {
    return res.status(400).json({ error: "Le champ 'texte' est requis." });
  }

  const prompt = `
Réponds uniquement en ${langue} le contenu demandé, sans salutation, sans introduction, sans mise en contexte .

Voici le texte à reformuler : "${texte}"

Contenu à demandé :
- Fournis exactement 3 reformulations du texte, chacune dans un style différent : soutenu, courant, et familier.
- Écris les réponses exclusivement en ${langue}, quelle que soit la langue d'origine du texte.
- Présente chaque reformulation sur une ligne numérotée distincte.

Exemple du format de réponse attendu :
1. ...
2. ...
3. ...
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
        headers: { 'Content-Type': 'application/json' },
        params: { key: process.env.GEMINI_KEY }
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

// === Endpoint Analyse ===
app.post('/api/analyse', async (req, res) => {
  const { texte, langue } = req.body;

  if (!texte) {
    return res.status(400).json({ error: "Le champ 'texte' est requis." });
  }

  const promptAnalyse = `
Réponds uniquement en ${langue}  le contenu demandé, sans salutation, sans introduction, Analyse le texte suivant : "${texte}"

 contenu demandé : 
1. Analyse des points clés, du ton, du style et de l’intention de l’auteur.  

2. Analyse orthographique : détection et explication des éventuelles fautes.

3. Analyse grammaticale : donner combien dans le texte (noms, verbes, adjectifs) et comment est l'accords.


instruction :
- La réponse doit être rédigée uniquement en ${langue}.  
- Aucune mise en forme avec des caractères spéciaux (ex. *, #, -).  
- La sortie doit toujours suivre la structure donnée ci-dessus, même si le texte ne contient pas d’erreurs.

`;

  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [{ text: promptAnalyse }]
          }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        params: { key: process.env.GEMINI_KEY }
      }
    );

    const output = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.json({ texte, output });
  } catch (error) {
    console.error("Erreur Analyse:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Échec de l'analyse",
      details: error.response?.data?.error?.message || error.message
    });
  }
});


// === Test rapide ===
app.get('/', (_, res) => {
  res.send('✅ Serveur Gemini Flash est en cours d\'exécution !');
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur actif sur http://localhost:${PORT}`);
});
