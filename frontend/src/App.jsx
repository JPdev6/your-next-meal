import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AddMealModal from "./components/AddMealModal.jsx";
import MealsModal from "./components/MealsModal.jsx";
import {
  loadMeals,
  saveMeals,
  resetToExamples,
  deleteExamplesOnly,
} from "./storage";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function App() {
  const { t, i18n } = useTranslation();
  const loadExamplesNow = () => setMeals(resetToExamples());
  const deleteExamplesNow = () => setMeals((curr) => deleteExamplesOnly(curr));

  // state
  const [meals, setMeals] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showMeals, setShowMeals] = useState(false);
  const [suggested, setSuggested] = useState(null);
  const [dailyTip, setDailyTip] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [fallback, setFallback] = useState(false);

  // refs
  const resultRef = useRef(null);
  const lottieRef = useRef(null);

  // scroll helpers
  const scrollTo = (ref, offset = 60) => {
    if (!ref.current) return;
    const y = ref.current.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };
  const scrollToResults = () => scrollTo(resultRef);

  // scroll στο κάτω Lottie όταν αρχίζει το loading
  useEffect(() => {
    if (loading) {
      const id = setTimeout(() => {
        if (lottieRef.current) {
          scrollTo(lottieRef, 40);
        }
      }, 50);
      return () => clearTimeout(id);
    }
  }, [loading]);

  // load meals on first mount
  useEffect(() => {
    setMeals(loadMeals());
  }, []);

  // persist meals to localStorage
  useEffect(() => {
    saveMeals(meals);
  }, [meals]);

  const suggestMeal = async () => {
    if (loading || cooldown) return;

    if (meals.length < 12) {
      setSuggested(null);
      alert(t("needMoreMeals"));
      return;
    }

    setLoading(true);
    setCooldown(true);
    try {
      // 🔹 Fetch suggestion + tip
      const res = await fetch("https://your-next-meal.onrender.com/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meals: meals.map((m) => m.name),
          language: i18n.language,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch suggestion");
      const data = await res.json();

      setSuggested(data.suggestion || null);
      setDailyTip(data.tip || null);

      // 🔹 Fetch recipes from Google API
      if (data.suggestion) {
        const recipeRes = await fetch(
          "https://your-next-meal.onrender.com/recipes",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: data.suggestion }),
          }
        );
        const recipeData = await recipeRes.json();
        setRecipes(recipeData.recipes || []);
        setFallback(recipeData.fallback || false);
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
      setSuggested(null);
      setDailyTip(null);
      setRecipes([]);
    } finally {
      setLoading(false);
      setTimeout(() => setCooldown(false), 1000); // cooldown 1 sec
    }
  };

  // helpers για να χωρίσουμε τα recipes
  const akisRecipes = recipes
    .filter((r) => r.link.includes("akispetretzikis"))
    .slice(0, 5);
  const argiroRecipes = recipes
    .filter((r) => r.link.includes("argiro"))
    .slice(0, 5);

  // crud meals
  const addMeal = (meal) => setMeals((m) => [...m, meal]);
  const deleteMeal = (id) => setMeals((m) => m.filter((x) => x.id !== id));
  const clearMeals = (newMeals = []) => setMeals(newMeals);
  const updateMeal = (id, patch) =>
    setMeals((m) => m.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <main className="page">
      {/* HEADER με γλώσσες */}
      <header className="header">
        <div className="lang-switch" aria-label="Language">
          <button
            className={`lang-btn ${
              i18n.language.startsWith("en") ? "active" : ""
            }`}
            onClick={() => i18n.changeLanguage("en")}
          >
            <span className="flag">🇬🇧</span> EN
          </button>
          <button
            className={`lang-btn ${
              i18n.language.startsWith("el") ? "active" : ""
            }`}
            onClick={() => i18n.changeLanguage("el")}
          >
            <span className="flag">🇬🇷</span> EL
          </button>
        </div>
      </header>

      <h1 className="title">{t("title")}</h1>

      <section className="center">
        {/* Κεντρικό Lottie */}
        <div className="lottie-wrap">
          <DotLottieReact
            src="https://lottie.host/54e34844-99c3-4559-b86c-690aded4c5cd/HFMFfwyYwB.lottie"
            loop
            autoplay
            mode="normal"
            background="transparent"
            style={{
              width: 400,
              height: 400,
              margin: "0 auto",
              display: "block",
            }}
          />
        </div>

        {/* Κουμπιά */}
        <div className="controls">
          <button
            className="btn btn-primary"
            onClick={async () => {
              setSuggested(null);
              await suggestMeal();
              setTimeout(scrollToResults, 200);
            }}
            disabled={loading || cooldown}
          >
            {t("suggestButton")}
          </button>

          <div className="controls-row">
            <button
              className="btn btn-outline"
              onClick={() => setShowMeals(true)}
            >
              {t("yourMeals")}
            </button>
          </div>
        </div>

        {/* anchor για auto-scroll στα αποτελέσματα */}
        <div ref={resultRef} />

        {meals.length === 0 && (
          <div className="empty">
            <p
              className="empty-text"
              dangerouslySetInnerHTML={{ __html: t("emptyMealsText") }}
            />
            <button className="btn btn-accent" onClick={() => setShowAdd(true)}>
              {t("addMealBtn")}
            </button>
          </div>
        )}

        {/* Suggestion Box με Loader */}
        {(loading || suggested) && (
          <div className="suggestion-box" ref={lottieRef}>
            {loading ? (
              <DotLottieReact
                src="https://lottie.host/23c74f53-239a-4c22-9fc5-513ea9bcb7ac/IxQZn4kkZo.lottie"
                loop
                autoplay
                style={{ width: 300, height: 300, margin: "0 auto" }}
                speed={3}
              />
            ) : (
              <>
                <p className="suggestion-text">{suggested}</p>
                {dailyTip && <p className="tip-text">💡 {dailyTip}</p>}

                {/* ✅ Recipes section */}
                {recipes.length > 0 && (
                  <div className="recipes-container">
                    {fallback && (
                      <p className="fallback-msg">
                        Με αυτό το γεύμα δεν βρήκαμε αποτελέσματα, αλλά έχουμε
                        τις τοπ επιλογές των δύο σεφ παρακάτω 🍽️
                      </p>
                    )}

                    {akisRecipes.length > 0 && (
                      <div className="recipe-section akis">
                        <h3>👨‍🍳 Συνταγές Άκη</h3>
                        <div className="recipe-grid">
                          {akisRecipes.map((r, idx) => (
                            <div className="recipe-card" key={idx}>
                              <img
                                src={
                                  r.image ||
                                  "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1"
                                }
                                alt={r.title}
                                className="recipe-img"
                              />
                              <h4 className="recipe-title">
                                <a href={r.link} target="_blank" rel="noreferrer">
                                  {r.title}
                                </a>
                              </h4>
                              <p className="recipe-snippet">{r.snippet}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {argiroRecipes.length > 0 && (
                      <div className="recipe-section argiro">
                        <h3>👩‍🍳 Συνταγές Αργυρώς</h3>
                        <div className="recipe-grid">
                          {argiroRecipes.map((r, idx) => (
                            <div className="recipe-card" key={idx}>
                              <img
                                src={
                                  r.image ||
                                  "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1"
                                }
                                alt={r.title}
                                className="recipe-img"
                              />
                              <h4 className="recipe-title">
                                <a href={r.link} target="_blank" rel="noreferrer">
                                  {r.title}
                                </a>
                              </h4>
                              <p className="recipe-snippet">{r.snippet}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {showAdd && (
        <AddMealModal onClose={() => setShowAdd(false)} onSave={addMeal} />
      )}
      {showMeals && (
        <MealsModal
          meals={meals}
          onDelete={deleteMeal}
          onClear={clearMeals}
          onClose={() => setShowMeals(false)}
          onAdd={() => {
            setShowMeals(false);
            setShowAdd(true);
          }}
          onUpdate={updateMeal}
          onLoadExamples={loadExamplesNow}
          onDeleteExamples={deleteExamplesNow}
        />
      )}
    </main>
  );
}
