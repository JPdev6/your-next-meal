import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function MealsModal({
  meals,
  onDelete,
  onClear,
  onClose,
  onAdd,
  onUpdate,
  onLoadExamples,
  onDeleteExamples,
}) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [draftCuisine, setDraftCuisine] = useState("");

  const startEdit = (m) => {
    setEditingId(m.id);
    setDraftName(m.name);
    setDraftCuisine(m.cuisine || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftName("");
    setDraftCuisine("");
  };

  const saveEdit = () => {
    const name = draftName.trim();
    if (!name) return;
    onUpdate(editingId, { name, cuisine: draftCuisine.trim() });
    cancelEdit();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h2 className="modal-title">{t("yourMeals")}</h2>

        {meals.length === 0 ? (
          <p className="empty-text">{t("noMealsYet")}</p>
        ) : (
          <div className="table-wrap">
            <table className="meal-table">
              <thead>
                <tr>
                  <th>{t("name")}</th>
                  <th>{t("cuisine")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {meals.map((m) => (
                  <tr key={m.id}>
                    <td>
                      {editingId === m.id ? (
                        <input
                          className="input"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                        />
                      ) : (
                        m.name
                      )}
                    </td>
                    <td>
                      {editingId === m.id ? (
                        <input
                          className="input"
                          value={draftCuisine}
                          onChange={(e) => setDraftCuisine(e.target.value)}
                        />
                      ) : (
                        m.cuisine
                      )}
                    </td>
                    <td>
                      {editingId === m.id ? (
                        <>
                          <button className="btn btn-accent" onClick={saveEdit}>
                            {t("save")}
                          </button>
                          <button className="btn btn-ghost" onClick={cancelEdit}>
                            {t("cancel")}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-outline"
                            onClick={() => startEdit(m)}
                          >
                            {t("edit")}
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => onDelete(m.id)}
                            aria-label={t("delete")}   // 👈 added for accessibility
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="modal-actions spread">
          <button className="btn btn-outline" onClick={onAdd}>
            + {t("addMeal")}
          </button>
          <div>
            <button className="btn btn-ghost" onClick={onLoadExamples}>
              {t("loadExamples")}
            </button>

            {meals.some((m) => m.isExample) && (
              <button className="btn btn-ghost" onClick={onDeleteExamples}>
                {t("deleteExamples")}
              </button>
            )}

            {meals.length > 0 && (
              <button className="btn btn-ghost" onClick={() => onClear()}>
                {t("clearAll")}
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={onClose}
              style={{ marginLeft: 8 }}
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
