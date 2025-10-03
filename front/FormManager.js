export class FormManager {
    #selectedX = null;
    #selectedY = null;
    #selectedR = null;

    constructor(formId, xButtonsSelector, yInputId, rRadiosSelector, onSubmit, onClear) {
        this.form = document.getElementById(formId);
        this.xButtons = document.querySelectorAll(xButtonsSelector);
        this.yInput = document.getElementById(yInputId);
        this.rRadios = document.querySelectorAll(rRadiosSelector);
        this.onSubmit = onSubmit;
        this.onClear = onClear;

        this.#initialize();
    }

    #initialize() {
        this.xButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.#selectedX = parseFloat(button.dataset.value);
                this.xButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.#validateX();
            });
        });

        if (this.yInput) {
            this.yInput.addEventListener('keypress', e => {
                const char = String.fromCharCode(e.which);
                const value = this.yInput.value;
                if (!/[\d.,\-]/.test(char) || (char === '-' && value.length > 0) ||
                    ((char === '.' || char === ',') && (value.includes('.') || value.includes(',')))) {
                    e.preventDefault();
                }
            });

            this.yInput.addEventListener('input', () => {
                let value = this.yInput.value.trim().replace(',', '.');
                if (value.length > 30) {
                    value = value.substring(0, 30);
                    this.yInput.value = value;
                }
                this.#selectedY = value || null;
                this.#validateY();
            });

            this.yInput.addEventListener('paste', e => {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text').replace(',', '.').trim();
                if (/^-?\d*\.?\d*$/.test(pastedText)) {
                    this.yInput.value = pastedText;
                    this.#selectedY = pastedText;
                    this.#validateY();
                }
            });
        }

        this.rRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.checked) {
                    this.#selectedR = parseFloat(radio.value);
                    this.#updateCurrentRDisplay();
                    this.#validateR();
                }
            });
        });

        if (this.form) {
            this.form.addEventListener('submit', e => {
                e.preventDefault();
                this.#handleSubmit();
            });
        }

        const clearButton = document.getElementById('clear-results');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.onClear());
        }
    }

    getSelectedX() {
        return this.#selectedX;
    }

    getSelectedY() {
        return this.#selectedY;
    }

    getSelectedR() {
        return this.#selectedR;
    }

    clearForm() {
        this.#selectedX = null;
        this.#selectedY = null;
        this.xButtons.forEach(btn => btn.classList.remove('active'));
        if (this.yInput) this.yInput.value = '';
        ['x-error', 'y-error'].forEach(id => this.#hideError(document.getElementById(id)));
    }

    #updateCurrentRDisplay() {
        const currentRSpan = document.getElementById('current-r');
        if (currentRSpan) {
            currentRSpan.textContent = this.#selectedR || '-';
        }
    }

    #validateX() {
        const errorElement = document.getElementById('x-error');
        if (!errorElement) return true;

        if (this.#selectedX === null || isNaN(this.#selectedX)) {
            this.#showError(errorElement, 'Выберите значение X');
            return false;
        }

        const allowedValues = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
        if (!allowedValues.includes(this.#selectedX)) {
            this.#showError(errorElement, 'X должен быть одним из допустимых значений');
            return false;
        }

        this.#hideError(errorElement);
        return true;
    }

    #validateY() {
        const errorElement = document.getElementById('y-error');
        if (!errorElement) return true;

        if (this.#selectedY === null || this.#selectedY === '') {
            this.#showError(errorElement, 'Введите значение Y');
            return false;
        }

        if (!/^-?\d+\.?\d*$/.test(this.#selectedY)) {
            this.#showError(errorElement, 'Y должен быть числом');
            return false;
        }

        this.#hideError(errorElement);
        return true;
    }

    #validateR() {
        const errorElement = document.getElementById('r-error');
        if (!errorElement) return true;

        if (this.#selectedR === null || isNaN(this.#selectedR)) {
            this.#showError(errorElement, 'Выберите значение R');
            return false;
        }

        const allowedValues = [1, 1.5, 2, 2.5, 3];
        if (!allowedValues.includes(this.#selectedR)) {
            this.#showError(errorElement, 'R должен быть одним из допустимых значений');
            return false;
        }

        this.#hideError(errorElement);
        return true;
    }

    #showError(element, message) {
        if (element) {
            element.textContent = message;
            element.classList.add('show');
            element.closest('.form-group')?.classList.add('error');
        }
    }

    #hideError(element) {
        if (element) {
            element.textContent = '';
            element.classList.remove('show');
            element.closest('.form-group')?.classList.remove('error');
        }
    }

    #handleSubmit() {
        if (!this.#validateX() || !this.#validateY() || !this.#validateR()) {
            this.onSubmit(null);
            return;
        }
        this.onSubmit({ x: this.#selectedX, y: this.#selectedY, r: this.#selectedR });
    }
}