import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { normalizeQuery, getMealSuggestion, getDailyTip } from "./openai.js";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
app.use(cors({
  origin: "*"
}));
app.use(express.json());

// --- Recipe Cache ---
const recipeCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 ώρες

// --- Helper για random επιλογές ---
const pickRandom = (arr, n) => {
  if (arr.length <= n) return arr;
  return arr.sort(() => 0.5 - Math.random()).slice(0, n);
};

// --- Fallback δημοφιλείς συνταγές ---
const popularAkis = [
  {
    title: "Μουσακάς | Άκης Πετρετζίκης",
    link: "https://akispetretzikis.com/recipe/9242/atomikos-mousakas",
    snippet: "Κλασικός ελληνικός μουσακάς με κιμά, μελιτζάνες και μπεσαμέλ.",
    image: "https://akispetretzikis.com/uploads/recipes/mousakas.jpg",
  },
  {
    title: "Σουβλάκι | Άκης Πετρετζίκης",
    link: "https://akispetretzikis.com/recipe/107/souvlaki",
    snippet: "Αυθεντικό ελληνικό σουβλάκι με πίτα και τζατζίκι.",
    image: "https://akispetretzikis.com/uploads/recipes/souvlaki.jpg",
  },
  {
    title: "Παστίτσιο | Άκης Πετρετζίκης",
    link: "https://akispetretzikis.com/recipe/163/pastitsio",
    snippet: "Παραδοσιακό ελληνικό παστίτσιο με μακαρόνια, κιμά και μπεσαμέλ.",
    image: "https://akispetretzikis.com/uploads/recipes/pastitsio.jpg",
  },
];

const popularArgiro = [
  {
    title: "Φανουρόπιτα | Αργυρώ",
    link: "https://www.argiro.gr/recipe/fanouropita-7-9-ylika/",
    snippet: "Παραδοσιακή φανουρόπιτα με λίγα υλικά, εύκολη και νηστίσιμη.",
    image: "https://www.argiro.gr/wp-content/uploads/fanouropita.jpg",
  },
  {
    title: "Κοτόπουλο με πατάτες | Αργυρώ",
    link: "https://www.argiro.gr/recipe/kotopoylo-me-patates-sto-fourno/",
    snippet: "Κοτόπουλο στον φούρνο με πατάτες και μυρωδικά.",
    image: "https://www.argiro.gr/wp-content/uploads/kotopoulo.jpg",
  },
  {
    title: "Γεμιστά | Αργυρώ",
    link: "https://www.argiro.gr/recipe/gemista/",
    snippet: "Παραδοσιακά γεμιστά με ρύζι, μυρωδικά και λαχανικά.",
    image: "https://www.argiro.gr/wp-content/uploads/gemista.jpg",
  },
];

// --- Google API fetch ---
async function fetchRecipesForSite(query, site, API_KEY, CX) {
  const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(
    query + " site:" + site
  )}&num=10`;

  try {
    console.log("🔎 Fetching:", url);
    const res = await fetch(url);
    if (!res.ok) {
      console.error("❌ Google API error", res.status);
      return [];
    }
    const data = await res.json();
    return (
      data.items?.map((item) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        image:
          item.pagemap?.cse_image?.[0]?.src ||
          item.pagemap?.thumbnail?.[0]?.src ||
          null,
      })) || []
    );
  } catch (err) {
    console.error("❌ Fetch error:", err);
    return [];
  }
}

// --- Google API fetch με cache ---
async function fetchRecipesCached(query, site, API_KEY, CX) {
  const normalizedKey = query.trim().toLowerCase();
  const normalizedSite = site.replace("www.", "");
  const key = `${normalizedKey}-${normalizedSite}`;
  const now = Date.now();

  if (recipeCache.has(key)) {
    const { results, timestamp } = recipeCache.get(key);
    if (now - timestamp < CACHE_TTL) {
      console.log(`♻️ Returning cached recipes for ${key}`);
      return results;
    }
  }

  const results = await fetchRecipesForSite(query, site, API_KEY, CX);
  recipeCache.set(key, { results, timestamp: now });
  return results;
}

// --- Recipes endpoint ---
app.post("/recipes", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing query" });

    const API_KEY = process.env.GOOGLE_API_KEY;
    const CX = process.env.GOOGLE_CX;
    if (!API_KEY || !CX) {
      console.error("❌ Missing GOOGLE_API_KEY or GOOGLE_CX in .env");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const normalized = await normalizeQuery(query);
    console.log("🍽 Normalized keyword:", normalized);

    const akis = await fetchRecipesCached(normalized, "akispetretzikis.com", API_KEY, CX);
    const argiro = await fetchRecipesCached(normalized, "argiro.gr", API_KEY, CX);

    console.log("🔎 Akis found:", akis.length);
    console.log("🔎 Argiro found:", argiro.length);

    let results = [];
    let fallback = false;

    if (akis.length > 0 || argiro.length > 0) {
      results = [
        ...pickRandom(akis, 5),
        ...pickRandom(argiro, 5),
      ];
    } else {
      console.warn("⚠️ No valid recipes found — using popular recipes");
      fallback = true;
      results = [
        ...pickRandom(popularAkis, 5),
        ...pickRandom(popularArgiro, 5),
      ];
    }

    res.json({ recipes: results, fallback });
  } catch (err) {
    console.error("❌ Recipes fetch error:", err);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

// --- Suggest endpoint ---
app.post("/suggest", async (req, res) => {
  try {
    const { meals, language } = req.body;
    if (!meals || meals.length === 0) {
      return res.status(400).json({ error: "No meals provided" });
    }

    const suggestion = await getMealSuggestion(meals, language);
    const normalizedMeal = await normalizeQuery(suggestion, language);
    const tip = await getDailyTip(language, normalizedMeal);

    res.json({
      suggestion,
      tip,
    });
  } catch (err) {
    console.error("❌ Suggest error:", err);
    res.status(500).json({ error: "Failed to suggest" });
  }
});


// Όριο 20 requests ανά IP κάθε 24 ώρες
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 ώρες
  max: 20, // επιτρέπεται μέχρι 20 requests
  message: { error: "Έχεις φτάσει το ημερήσιο όριο αναζητήσεων." }
});

app.use("/recipes", limiter); // εφαρμόζεται μόνο στο /recipes endpoint

// --- Start server ---
const PORT = process.env.PORT || 5175;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
