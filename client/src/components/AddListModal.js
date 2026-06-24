import React from 'react';
import { useTranslation } from 'react-i18next'; 

function AddListModal({  
  showModal,
  setShowModal,
  newListName,
  setNewListName,
  newItemName,
  setNewItemName,
  newItems,
  handleAddItem,
  handleRemoveItem,
  handleAddList
}) {
  const { t } = useTranslation();
  if (!showModal) return null;
  

  return (
    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{t('addNewList')}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowModal(false)}
            ></button>
          </div>
          <div className="modal-body">
            <input
              type="text"
              placeholder={t("enterName")}
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <div>
              <input
                type="text"
                placeholder={t("enterItem")}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                style={{ width: "70%", marginRight: "5px" }}
              />
              <button className="purple-button" onClick={handleAddItem}>
                {t("addItem")}
              </button>
            </div>
            <ul style={{ marginTop: "10px" }}>
              {newItems.map((item, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  {item}
                  <button
                    className="purple-button"
                    onClick={() => handleRemoveItem(index)}
                  >
                    {t("Remove")}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="modal-footer">            
            <button className="delete-button" onClick={handleAddList}>
              {t("saveList")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddListModal;
