import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        // --- App.jsx ---
        title: "Your Next Meal",
        suggestButton: "Suggest a meal",
        yourMeals: "Your meals",
        emptyMealsText: "🍴 You don’t have any meals stored yet.<br />Add a few to get started!",
        addMealBtn: "+ Add meal",
        needMoreMeals: "⚠️ Please add at least 12 meals before suggestions!",

        todaysTip: "Today's Tip",
        viewMeals: "View Meals",
        loading: "Loading...",
        exampleSuggestion: "You might enjoy grilled salmon tonight — it's packed with omega-3s.",

        // --- AddMealModal.jsx ---
        addMeal: "Add a meal",
        name: "Name",
        cuisine: "Cuisine",
        cuisineOptional: "Cuisine (optional)",
        exampleMeal: "e.g., Chicken tikka",
        exampleCuisine: "e.g., Indian",
        cancel: "Cancel",
        save: "Save",

        // --- MealsModal.jsx ---
        noMealsYet: "No meals yet. Add your first below!",
        edit: "Edit",
        delete: "Delete",   // 👈 added
        clearAll: "Clear all",
        loadExamples: "Load examples",
        deleteExamples: "Delete examples",
        close: "Close",
      },
    },
    el: {
      translation: {
        // --- App.jsx ---
        title: "Το επόμενο γεύμα σου",
        suggestButton: "Πρότεινε γεύμα",
        yourMeals: "Τα γεύματά σου",
        emptyMealsText: "🍴 Δεν έχεις αποθηκεύσει γεύματα ακόμα.<br />Πρόσθεσε μερικά για να ξεκινήσεις!",
        addMealBtn: "+ Πρόσθεσε γεύμα",
        needMoreMeals: "⚠️ Πρόσθεσε τουλάχιστον 12 γεύματα πριν ζητήσεις προτάσεις!",

        todaysTip: "Συμβουλή της ημέρας",
        viewMeals: "Δες τα γεύματά σου",
        loading: "Φόρτωση...",
        exampleSuggestion: "Ίσως σου αρέσει σολομός στη σχάρα απόψε — είναι γεμάτος ωμέγα-3.",

        // --- AddMealModal.jsx ---
        addMeal: "Πρόσθεσε γεύμα",
        name: "Όνομα",
        cuisine: "Κουζίνα",
        cuisineOptional: "Κουζίνα (προαιρετικό)",
        exampleMeal: "π.χ. Κοτόπουλο Τίκκα",
        exampleCuisine: "π.χ. Ινδική",
        cancel: "Ακύρωση",
        save: "Αποθήκευση",

        // --- MealsModal.jsx ---
        noMealsYet: "Δεν έχεις ακόμα γεύματα. Πρόσθεσε το πρώτο!",
        edit: "Επεξεργασία",
        delete: "Διαγραφή",  // 👈 added
        clearAll: "Διαγραφή όλων",
        loadExamples: "Φόρτωσε παραδείγματα",
        deleteExamples: "Διαγραφή παραδειγμάτων",
        close: "Κλείσιμο",
      },
    },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
