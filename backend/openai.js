import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function normalizeQuery(query, language = "el") {
  const prompt =
    language === "el"
      ? `Από την παρακάτω πρόταση βγάλε μόνο το όνομα του φαγητού (χωρίς επίθετα, χωρίς περιγραφές, μόνο φαγητό). Αν υπάρχουν πολλές λέξεις, κράτησε έως 4 που περιγράφουν το πιάτο.
Πρόταση: "${query}".`
      : `From the following sentence, extract only the meal name (no adjectives, no extra words, just the dish). Max 4 words.
Sentence: "${query}".`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return (response.choices[0]?.message?.content || "").trim();
}


// 🍽️ Meal suggestion
export async function getMealSuggestion(meals, language = "en") {

  const randomMeal = meals[Math.floor(Math.random() * meals.length)];

  const prompt =
    language === "el"
      ? `Έχω επιλέξει το γεύμα: "${randomMeal}".
Γράψε μια σύντομη και όμορφη πρόταση για να το προτείνεις, αλλάζοντας κάθε φορά το ύφος.
Χρησιμοποίησε διαφορετικές λέξεις όπως "δοκίμασε", "γευτείτε", "μια υπέροχη επιλογή είναι", "ιδανικό πιάτο για σήμερα", "σας προτείνουμε", "απολαύστε", "για σήμερα προτείνεται" κτλ.
Μία πρόταση μόνο, στα ελληνικά.`
      : `The chosen meal is: "${randomMeal}".
Write a short, varied sentence to suggest it, using different expressions each time (e.g. "try", "enjoy", "today's pick is", "we recommend").
One sentence only, in English.`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });

  return (response.choices[0]?.message?.content || "").trim();

}

// 💡 Daily tip (expert-style, food-related)
export async function getDailyTip(language = "el", meal = "") {
  const prompt =
    language === "el"
      ? meal
        ? `Δώσε μια πολύ σύντομη συμβουλή υγείας (ως 12 λέξεις) σχετική με το φαγητό "${meal}".`
        : "Δώσε μια πολύ σύντομη συμβουλή υγείας (ως 12 λέξεις)."
      : meal
        ? `Give a very short health tip (max 12 words) related to the meal "${meal}".`
        : "Give a very short health tip (max 12 words).";

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0]?.message?.content.trim();
  } catch (err) {
    console.error("❌ Health tip error:", err);
    return language === "el"
      ? "Να πίνεις αρκετό νερό κατά τη διάρκεια της ημέρας."
      : "Remember to drink enough water during the day.";
  }
}

