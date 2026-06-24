import React from 'react';
import { useTranslation } from 'react-i18next'; 

function AlertModal({ show, message, handleClose }) {
  const { t } = useTranslation();
  if (!show) {
    return null;
  }

  return (
    <div className="modal" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{t("Notification")}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>
          <div className="modal-body">
            <p>{message}</p>
          </div>
          <div className="modal-footer">
            <button
              className="purple-button"
              onClick={handleClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;
