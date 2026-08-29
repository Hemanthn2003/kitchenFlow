import React, {
  useEffect,
} from "react";

import {
  AlertTriangle,
  X,
} from "lucide-react";

import "./ConfirmModal.css";


function ConfirmModal({
  open,
  title = "Confirm Action",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) {

  useEffect(
    () => {

      if (!open) {
        return;
      }


      const handleKeyDown =
        (event) => {

          if (
            event.key === "Escape" &&
            !loading
          ) {

            onCancel?.();

          }

        };


      window.addEventListener(
        "keydown",
        handleKeyDown
      );


      return () => {

        window.removeEventListener(
          "keydown",
          handleKeyDown
        );

      };

    },

    [
      open,
      loading,
      onCancel,
    ]
  );


  if (!open) {
    return null;
  }


  return (

    <div
      className="confirm-modal-overlay"
      onMouseDown={
        () => {

          if (!loading) {
            onCancel?.();
          }

        }
      }
    >

      <div
        className="confirm-modal-card"
        onMouseDown={
          (event) =>
            event.stopPropagation()
        }
      >

        <button
          type="button"
          className="confirm-modal-close"
          disabled={loading}
          onClick={onCancel}
          aria-label="Close"
        >

          <X size={20} />

        </button>


        <div
          className="confirm-modal-icon"
        >

          <AlertTriangle size={30} />

        </div>


        <span
          className="confirm-modal-kicker"
        >

          KITCHENFLOW

        </span>


        <h2>

          {title}

        </h2>


        <p>

          {message}

        </p>


        <div
          className="confirm-modal-actions"
        >

          <button
            type="button"
            className="confirm-modal-cancel"
            disabled={loading}
            onClick={onCancel}
          >

            {cancelText}

          </button>


          <button
            type="button"
            className="confirm-modal-confirm"
            disabled={loading}
            onClick={onConfirm}
          >

            {loading
              ? "Please wait..."
              : confirmText}

          </button>

        </div>

      </div>

    </div>

  );

}


export default ConfirmModal;