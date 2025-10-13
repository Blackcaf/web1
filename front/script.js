let selectedX = null;
let selectedY = null;
let selectedR = null;

const STORAGE_KEY = 'web1_results';
const MAX_RESULTS = 50;

const storage = {
    save: data => {
        try {
            const results = [data, ...storage.load()].slice(0, MAX_RESULTS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
        } catch (e) { console.error('Save error:', e); }
    },
    load: () => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) { return []; }
    },
    clear: () => localStorage.removeItem(STORAGE_KEY)
};

const VALIDATION_RULES = {
    x: {
        check: () => selectedX !== null && [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2].includes(selectedX),
        error: 'Выберите значение X'
    },
    y: {
        check: () => selectedY && /^-?\d+\.?\d*$/.test(selectedY),
        error: 'Введите корректное значение Y'
    },
    r: {
        check: () => selectedR !== null && [1, 1.5, 2, 2.5, 3].includes(selectedR),
        error: 'Выберите значение R'
    }
};

function validate(field) {
    const errorEl = document.getElementById(`${field}-error`);
    if (!errorEl) return true;

    const rule = VALIDATION_RULES[field];
    const isValid = rule.check();

    errorEl.textContent = isValid ? '' : rule.error;
    errorEl.classList.toggle('show', !isValid);
    errorEl.closest('.form-group')?.classList.toggle('error', !isValid);

    return isValid;
}

function showModal(title, message, buttons = []) {
    document.getElementById('universal-modal')?.remove();

    const buttonsHTML = buttons.map(btn =>
        `<button class="modal-btn modal-btn-${btn.type}" data-action="${btn.action}">${btn.text}</button>`
    ).join('');

    document.body.insertAdjacentHTML('beforeend', `
        <div id="universal-modal" class="modal" style="display: flex;">
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="close-btn">×</button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                    ${buttons.length ? `<div class="modal-actions">${buttonsHTML}</div>` : ''}
                </div>
            </div>
        </div>
    `);

    const modal = document.getElementById('universal-modal');
    const close = () => modal.remove();

    modal.querySelector('.close-btn').onclick = close;
    modal.querySelector('.modal-backdrop').onclick = close;

    buttons.forEach(btn => {
        modal.querySelector(`[data-action="${btn.action}"]`).onclick = () => {
            close();
            btn.callback?.();
        };
    });
}

const ERROR_MESSAGES = {
    'Failed to fetch': 'Сервер недоступен',
    '500': 'Внутренняя ошибка сервера',
    '400': 'Некорректные данные',
    '404': 'Endpoint не найден',
    '405': 'Недопустимый метод'
};

function sendDataToServer(x, y, r, fromCanvas = false) {
    if (!fromCanvas) showLoading(true);

    fetch('/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y: String(y), r })
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (data.error) throw new Error(data.error);

            addResultToTable(data);
            storage.save(data);
            window.addPointToCanvas?.(parseFloat(data.x), parseFloat(data.y), data.hit, parseFloat(data.r));
            hideEmptyState();
            clearForm();
        })
        .catch(error => {
            const message = Object.entries(ERROR_MESSAGES)
                .find(([key]) => error.message.includes(key))?.[1] || 'Ошибка запроса';
            showModal('Ошибка', message);
        })
        .finally(() => !fromCanvas && showLoading(false));
}

function addResultToTable(data) {
    const tbody = document.getElementById('results-body');
    if (!tbody) return;

    const row = tbody.insertRow(0);
    row.className = data.hit ? 'hit' : 'miss';
    row.innerHTML = `
        <td>${data.x}</td>
        <td>${data.y}</td>
        <td>${data.r}</td>
        <td class="result-${data.hit ? 'hit' : 'miss'}">${data.hit ? 'Попадание' : 'Промах'}</td>
        <td>${new Date(data.currentTime).toLocaleString('ru-RU')}</td>
        <td>${data.scriptTimeMs} мс</td>
    `;

    hideEmptyState();
}

function clearResults() {
    document.getElementById('results-body').innerHTML = '';
    storage.clear();
    window.clearCanvas?.();
    showEmptyState();
}

function loadStoredResults() {
    const results = storage.load();
    if (!results.length) {
        showEmptyState();
        return;
    }

    results.forEach(data => {
        addResultToTable(data);
        window.addPointToCanvas?.(parseFloat(data.x), parseFloat(data.y), data.hit, parseFloat(data.r));
    });
    hideEmptyState();
}

function clearForm() {
    selectedX = selectedY = null;
    document.querySelectorAll('.x-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('y-input').value = '';
    ['x', 'y', 'r'].forEach(field => validate(field));
}

function handleFormSubmit() {
    if (!validate('x') || !validate('y') || !validate('r')) {
        showModal('Ошибка', 'Исправьте ошибки в форме');
        return;
    }
    sendDataToServer(selectedX, selectedY, selectedR);
}

function addPointFromCanvas(x, y) {
    if (!selectedR) {
        showModal('Ошибка', 'Выберите значение R');
        return;
    }
    if (!/^-?\d+\.?\d*$/.test(x) || !/^-?\d+\.?\d*$/.test(y)) {
        showModal('Ошибка', 'X и Y должны быть числами');
        return;
    }
    sendDataToServer(x, y, selectedR, true);
}

function updateCurrentRDisplay() {
    const span = document.getElementById('current-r');
    if (span) span.textContent = selectedR || '-';
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = show ? 'flex' : 'none';
}

function showEmptyState() {
    document.getElementById('empty-state').style.display = 'block';
}

function hideEmptyState() {
    document.getElementById('empty-state').style.display = 'none';
}

function initializeForm() {
    document.getElementById('x-buttons').onclick = e => {
        if (!e.target.matches('.x-btn')) return;
        e.preventDefault();

        selectedX = parseFloat(e.target.dataset.value);
        document.querySelectorAll('.x-btn').forEach(btn =>
            btn.classList.toggle('active', btn === e.target)
        );
        validate('x');
    };

    const yInput = document.getElementById('y-input');
    yInput.onkeypress = e => {
        const char = String.fromCharCode(e.which);
        if (!/[\d.,\-]/.test(char) ||
            (char === '-' && e.target.value) ||
            ((char === '.' || char === ',') && /[.,]/.test(e.target.value))) {
            e.preventDefault();
        }
    };

    yInput.oninput = function() {
        selectedY = this.value.trim().replace(',', '.').substring(0, 100);
        this.value = selectedY;
        validate('y');
    };

    yInput.onpaste = e => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const cleaned = text.replace(',', '.').trim();
        if (/^-?\d*\.?\d*$/.test(cleaned)) {
            yInput.value = selectedY = cleaned;
            validate('y');
        }
    };

    document.getElementById('r-radios').onchange = e => {
        if (e.target.name !== 'r') return;
        selectedR = parseFloat(e.target.value);
        updateCurrentRDisplay();
        validate('r');
        setTimeout(() => window.drawCoordinatePlane?.(), 50);
    };

    document.getElementById('coordinateForm').onsubmit = e => {
        e.preventDefault();
        handleFormSubmit();
    };

    document.getElementById('clear-results').onclick = () => {
        showModal('Очистить результаты?', 'Это действие нельзя отменить', [
            { text: 'Да', type: 'primary', action: 'ok', callback: clearResults },
            { text: 'Отмена', type: 'secondary', action: 'cancel' }
        ]);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    loadStoredResults();
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.getElementById('universal-modal')?.remove();
    }
});

window.currentR = () => selectedR;
window.addPointFromCanvas = addPointFromCanvas;