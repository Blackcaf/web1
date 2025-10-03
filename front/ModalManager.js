export class ModalManager {
    #errorModal;
    #confirmModal;

    constructor(errorModalId, confirmModalId) {
        this.#errorModal = document.getElementById(errorModalId);
        this.#confirmModal = document.getElementById(confirmModalId);
        this.#initialize();
    }

    #initialize() {
        if (this.#errorModal) {
            const closeBtn = this.#errorModal.querySelector('.close-btn');
            const backdrop = this.#errorModal.querySelector('.modal-backdrop');
            [closeBtn, backdrop].forEach(el => {
                if (el) el.addEventListener('click', () => this.hideErrorModal());
            });
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape') this.hideErrorModal();
            });
        }

        if (this.#confirmModal) {
            const closeBtn = this.#confirmModal.querySelector('.close-btn');
            const backdrop = this.#confirmModal.querySelector('.modal-backdrop');
            const noBtn = document.getElementById('confirm-no');
            [closeBtn, backdrop, noBtn].forEach(el => {
                if (el) el.addEventListener('click', () => this.hideConfirmModal());
            });
        }
    }

    showErrorModal(message) {
        if (this.#errorModal) {
            const errorText = document.getElementById('error-text');
            if (errorText) errorText.textContent = message;
            this.#errorModal.style.display = 'flex';
        }
    }

    hideErrorModal() {
        if (this.#errorModal) this.#errorModal.style.display = 'none';
    }

    showConfirmModal(title, message, onConfirm) {
        if (this.#confirmModal) {
            const titleEl = document.getElementById('confirm-title');
            const textEl = document.getElementById('confirm-text');
            const yesBtn = document.getElementById('confirm-yes');
            if (titleEl && textEl && yesBtn) {
                titleEl.textContent = title;
                textEl.textContent = message;
                const newYesBtn = yesBtn.cloneNode(true);
                yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
                newYesBtn.addEventListener('click', () => {
                    this.hideConfirmModal();
                    if (onConfirm) onConfirm();
                });
                this.#confirmModal.style.display = 'flex';
            }
        }
    }

    hideConfirmModal() {
        if (this.#confirmModal) this.#confirmModal.style.display = 'none';
    }
}