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
Réponds uniquement avec le contenu demandé, sans salutation, sans introduction, sans mise en contexte.

Voici le texte saisi: "${texte}"

Tâche :
- Fournis exactement 3 reformulations du texte saisi, chacune dans un style différent : soutenu, courant, familier.

⚠️ Règles :
- Ecrire les réponses en ${langue} uniquement quelque soit la langue du texte saisi.
exemple de réponse attendue : une plus petite espace entre chaque reformulation.

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
Réponds uniquement avec le contenu demandé, sans salutation, sans introduction, Analyse le texte suivant : "${texte}"

Tâches :
1. Analyse des points clés, du ton, du style et de l’intention de l’auteur.  
exemple :
                Analyse du texte(mettez ceci au centre comme une titre) : 
C'est une style informel, joyeux, enthousiaste, positif, motivant. dont l'intention est de motiver et encourager les lecteurs à poursuivre leurs rêves et à croire en eux-mêmes.

2. Analyse orthographique : détection et explication des éventuelles fautes.
exemple :
                Analyse orthographique : 
Il y a une faute d'orthographe dans le mot "reussir" qui devrait être écrit "réussir" avec un accent aigu sur le "e".

3. Analyse grammaticale : identification des noms, verbes, adjectifs, accords.
exemple :
                Analyse grammaticale (etude spécificique de mots clés présents dans le texte) :
- Noms : 5 (exemples : "rêves", "confiance")
- Verbes : 4 (exemples : "poursuivre", "croire")
- Adjectifs : 3 (exemples : "incroyables", "grandes")
- Accords : Tous les accords sont corrects.

⚠️ Règles :
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
app.get('/', (req, res) => {
  res.send('✅ Serveur Gemini Flash est en cours d\'exécution !');
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur actif sur http://localhost:${PORT}`);
});
