import { useState } from "react";
import { normalizeMealName } from "../utils/text";
import { useTranslation } from "react-i18next";

export default function AddMealModal({ onClose, onSave }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(normalizeMealName(val));
  };

  const submit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({
      id: crypto.randomUUID?.() || String(Date.now()),
      name: trimmed,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h2 className="modal-title">{t("addMeal")}</h2>
        <form onSubmit={submit} className="form">
          <label className="label">
            <span>{t("name")}</span>
            <input
              className="input"
              value={name}
              onChange={handleNameChange}
              placeholder="π.χ. σνίτζελ με πατάτες"
              autoFocus
            />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {t("cancel")}
            </button>
            <button type="submit" className="btn btn-accent">
              {t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
