let selectedX = null, selectedY = null, selectedR = null;
const X_VALUES = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
const STORAGE_KEY = 'web1_results';
const MAX_RESULTS = 50;

const storage = {
    save: data => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([data, ...storage.load()].slice(0, MAX_RESULTS)));
        } catch (e) { console.error('Save error:', e); }
    },
    load: () => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
        catch (e) { return []; }
    },
    clear: () => localStorage.removeItem(STORAGE_KEY)
};

const VALIDATION_RULES = {
    x: { check: () => selectedX !== null && X_VALUES.includes(selectedX), error: 'Выберите значение X' },
    y: { check: () => selectedY && /^-?\d+\.?\d*$/.test(selectedY), error: 'Введите корректное значение Y' },
    r: { check: () => selectedR !== null && [1, 1.5, 2, 2.5, 3].includes(selectedR), error: 'Выберите значение R' }
};

const ERROR_MESSAGES = {
    'Failed to fetch': 'Сервер недоступен',
    '500': 'Внутренняя ошибка сервера',
    '400': 'Некорректные данные',
    '404': 'Endpoint не найден',
    '405': 'Недопустимый метод'
};

function roundToNearestX(value) {
    return X_VALUES.reduce((prev, curr) => Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
}

function validate(field, showError = false) {
    const errorEl = document.getElementById(`${field}-error`);
    if (!errorEl) return true;
    const isValid = VALIDATION_RULES[field].check();
    if (showError) {
        errorEl.textContent = isValid ? '' : VALIDATION_RULES[field].error;
        errorEl.classList.toggle('show', !isValid);
        errorEl.closest('.form-group')?.classList.toggle('error', !isValid);
    } else {
        errorEl.textContent = '';
        errorEl.classList.remove('show');
        errorEl.closest('.form-group')?.classList.remove('error');
    }
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
    buttons.forEach(btn => modal.querySelector(`[data-action="${btn.action}"]`).onclick = () => {
        close();
        btn.callback?.();
    });
}

function sendDataToServer(x, y, r) {
    toggleLoading(true);
    fetch('/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y: String(y), r })
    })
        .then(response => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
        .then(data => {
            if (data.error) throw new Error(data.error);
            addResultToTable(data);
            storage.save(data);
            window.addPointToCanvas?.(parseFloat(data.x), parseFloat(data.y), data.hit, parseFloat(data.r));
            toggleEmptyState(false);
            clearForm();
        })
        .catch(error => showModal('Ошибка', Object.entries(ERROR_MESSAGES).find(([key]) => error.message.includes(key))?.[1] || 'Ошибка запроса'))
        .finally(() => toggleLoading(false));
}

function addResultToTable(data) {
    const tbody = document.getElementById('results-body');
    if (!tbody) return;
    const row = tbody.insertRow(0);
    row.className = data.hit ? 'hit' : 'miss';
    const y = parseFloat(data.y);
    row.innerHTML = `
        <td>${data.x}</td>
        <td title="${data.y}">${y.toString().length > 8 ? y.toFixed(4) : data.y}</td>
        <td>${data.r}</td>
        <td class="result-${data.hit ? 'hit' : 'miss'}">${data.hit ? 'Попадание' : 'Промах'}</td>
        <td>${new Date(data.currentTime).toLocaleString('ru-RU')}</td>
        <td>${data.scriptTimeMs} мс</td>
    `;
    toggleEmptyState(false);
}

function clearResults() {
    document.getElementById('results-body').innerHTML = '';
    storage.clear();
    window.clearCanvas?.();
    toggleEmptyState(true);
}

function loadStoredResults() {
    const results = storage.load();
    if (!results.length) return toggleEmptyState(true);
    results.forEach(data => {
        addResultToTable(data);
        window.addPointToCanvas?.(parseFloat(data.x), parseFloat(data.y), data.hit, parseFloat(data.r));
    });
    toggleEmptyState(false);
}

function clearForm() {
    selectedX = selectedY = null;
    document.querySelectorAll('.x-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('y-input').value = '';
    ['x', 'y', 'r'].forEach(field => validate(field, false));
}

function handleFormSubmit() {
    if (['x', 'y', 'r'].every(field => validate(field, true))) {
        sendDataToServer(selectedX, selectedY, selectedR);
    } else {
        showModal('Ошибка', 'Исправьте ошибки в форме');
    }
}

function fillFormFromCanvas(x, y) {
    selectedX = roundToNearestX(parseFloat(x));
    selectedY = parseFloat(y);
    document.querySelectorAll('.x-btn').forEach(btn => btn.classList.toggle('active', parseFloat(btn.dataset.value) === selectedX));
    document.getElementById('y-input').value = y;
}

function toggleLoading(show) {
    const el = document.getElementById('loading');
    if (el) el.style.display = show ? 'flex' : 'none';
}

function toggleEmptyState(show) {
    document.getElementById('empty-state').style.display = show ? 'block' : 'none';
}

function initializeForm() {
    document.getElementById('x-buttons').onclick = e => {
        if (!e.target.matches('.x-btn')) return;
        e.preventDefault();
        selectedX = parseFloat(e.target.dataset.value);
        document.querySelectorAll('.x-btn').forEach(btn => btn.classList.toggle('active', btn === e.target));
    };

    const yInput = document.getElementById('y-input');
    yInput.onkeypress = e => {
        const char = String.fromCharCode(e.which);
        if (!/[\d.,\-]/.test(char) || (char === '-' && e.target.value) ||
            ((char === '.' || char === ',') && /[.,]/.test(e.target.value))) e.preventDefault();
    };
    yInput.oninput = function() {
        selectedY = this.value.trim().replace(',', '.').substring(0, 100);
        this.value = selectedY;
    };
    yInput.onpaste = e => {
        e.preventDefault();
        const cleaned = (e.clipboardData || window.clipboardData).getData('text').replace(',', '.').trim();
        if (/^-?\d*\.?\d*$/.test(cleaned)) yInput.value = selectedY = cleaned;
    };

    document.getElementById('r-radios').onchange = e => {
        if (e.target.name !== 'r') return;
        selectedR = parseFloat(e.target.value);
        document.getElementById('current-r').textContent = selectedR;
        setTimeout(() => window.drawCoordinatePlane?.(), 50);
    };

    document.getElementById('coordinateForm').onsubmit = e => {
        e.preventDefault();
        handleFormSubmit();
    };

    document.getElementById('clear-results').onclick = () => showModal('Очистить результаты?', 'Это действие нельзя отменить', [
        { text: 'Да', type: 'primary', action: 'ok', callback: clearResults },
        { text: 'Отмена', type: 'secondary', action: 'cancel' }
    ]);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    loadStoredResults();
});
document.addEventListener('keydown', e => e.key === 'Escape' && document.getElementById('universal-modal')?.remove());

window.currentR = () => selectedR;
window.fillFormFromCanvas = fillFormFromCanvas;