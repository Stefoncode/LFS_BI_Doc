// src/components/AccessibleModal.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import clsx from 'clsx';
// --- L'importation problématique a été retirée : import { useDocsSidebar } from '@docusaurus/theme-common/internal';

function AccessibleModal({ buttonLabel, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const modalTriggerRef = useRef(null);
  const modalRef = useRef(null);

  // Gérer la fermeture de la modale
  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Ramener le focus au bouton d'ouverture après la fermeture
    if (modalTriggerRef.current) {
      modalTriggerRef.current.focus();
    }
  }, []);

  // --- LOGIQUE ACCESSIBILITÉ (Focus Trap & ESC) ---
  useEffect(() => {
    if (isOpen) {
      // 1. Déplacer le focus sur la modale elle-même à l'ouverture
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // 2. Gérer la fermeture avec la touche ÉCHAP et la trappe de focus (Tab)
      const handleKeyDown = (event) => {
        // Fermeture par la touche Échap
        if (event.key === 'Escape') {
          closeModal();
          return;
        }

        // Trappe de Focus (si la tabulation est pressée)
        if (event.key === 'Tab') {
          const focusableElements = Array.from(
            modalRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          ).filter(el => !el.disabled && el.offsetParent !== null);
          
          if (focusableElements.length === 0) return;

          const first = focusableElements[0];
          const last = focusableElements[focusableElements.length - 1];

          if (event.shiftKey) { // Shift + Tab (navigation inverse)
            if (document.activeElement === first) {
              last.focus();
              event.preventDefault();
            }
          } else { // Tab (navigation normale)
            if (document.activeElement === last) {
              first.focus();
              event.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      // Nettoyage : retirer l'écouteur d'événement
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, closeModal]);
  // --------------------------------------------------

  // Le reste de la logique pour aria-hidden est retiré car il dépendait du Hook.

  return (
    <>
      <button
        ref={modalTriggerRef}
        className={clsx('button', 'button--primary')}
        onClick={() => setIsOpen(true)}
      >
        {buttonLabel || 'Ouvrir la Modale'}
      </button>

      {isOpen && (
        <div
          className={clsx('modal', 'modal--show')}
          role="dialog"
          aria-modal="true"
          ref={modalRef}
          tabIndex="-1"
        >
          <div className="modal__box">
            <div className="modal__header">
              <button
                className="close"
                aria-label="Fermer la Modale"
                onClick={closeModal}
              >
                &times;
              </button>
            </div>
            <div className="modal__body">
              {children}
            </div>
            <div className="modal__footer">
              <button
                className={clsx('button', 'button--secondary')}
                onClick={closeModal}
              >
                Fermer
              </button>
            </div>
          </div>
          <div className="modal__overlay" onClick={closeModal} />
        </div>
      )}
    </>
  );
}

export default AccessibleModal;