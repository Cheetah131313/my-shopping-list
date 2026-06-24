import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next'; 

const ConfirmationModal = ({ show, handleClose, handleConfirm, message }) => {
  const { t } = useTranslation();
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{t("Confirmation")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {t("Cancel")}
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          {t("Confirm")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
