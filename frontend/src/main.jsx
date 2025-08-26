import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import "./i18n";
import LanguageToggle from './components/LanguageToggle.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// --- Language Toggle ---

const _langMount = document.createElement('div');   // 👈 FIXED (was "onst")
_langMount.id = 'lang-toggle-root';
document.body.appendChild(_langMount);

ReactDOM.createRoot(_langMount).render(
  <React.StrictMode>
    <LanguageToggle />
  </React.StrictMode>
);
// --- end Language Toggle ---
