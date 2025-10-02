// Глобальные переменные
let selectedX = null;
let selectedY = null;
let selectedR = null;

// Функция для получения текущего R
function getCurrentR() {
    return selectedR;
}

// Экспорт функций в window
window.currentR = getCurrentR;
window.addPointFromCanvas = addPointFromCanvas;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация...');

    try {
        initializeForm();
        initializeModal();
        initializeTable();
        loadStoredResults();
        initializeConfirmModal(); // Новая функция для модалки подтверждения

        console.log('Инициализация завершена успешно');
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
    }
});

// Инициализация формы
function initializeForm() {
    console.log('Инициализация формы...');

    // X кнопки
    const xButtons = document.querySelectorAll('.x-btn');
    console.log('Найдено X кнопок:', xButtons.length);

    xButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Выбран X:', this.dataset.value);

            selectedX = parseFloat(this.dataset.value);

            // Убираем активный класс со всех кнопок
            xButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс к текущей
            this.classList.add('active');

            validateX();
        });
    });

    // Y поле - улучшенная обработка (пункт 7)
    const yInput = document.getElementById('y-input');
    if (yInput) {
        // Предотвращаем вставку недопустимых символов
        yInput.addEventListener('keypress', function(e) {
            const char = String.fromCharCode(e.which);
            const value = this.value;

            // Разрешаем: цифры, точку, запятую, минус (только в начале)
            if (!/[\d.,\-]/.test(char)) {
                e.preventDefault();
                return;
            }

            // Минус только в начале
            if (char === '-' && value.length > 0) {
                e.preventDefault();
                return;
            }

            // Только одна точка или запятая
            if ((char === '.' || char === ',') && (value.includes('.') || value.includes(','))) {
                e.preventDefault();
                return;
            }
        });

        yInput.addEventListener('input', function() {
            let value = this.value.trim();

            // Заменяем запятую на точку
            value = value.replace(',', '.');

            // Не обрезаем знаки после запятой (пункт 5)
            selectedY = value ? value : null;
            console.log('Введен Y:', selectedY);
            validateY();
        });

        // Предотвращаем изменение через инспектор (пункт 7)
        yInput.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const cleanedText = pastedText.replace(',', '.').trim();

            // Проверяем, что вставляемый текст - это число
            if (/^-?\d*\.?\d*$/.test(cleanedText)) {
                this.value = cleanedText;
                selectedY = cleanedText;
                validateY();
            }
        });
    }

    // R радио кнопки
    const rRadios = document.querySelectorAll('input[name="r"]');
    console.log('Найдено R радио:', rRadios.length);

    rRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                selectedR = parseFloat(this.value);
                console.log('Выбран R:', selectedR);

                updateCurrentRDisplay();
                validateR();

                // Перерисовать график
                setTimeout(() => {
                    if (window.drawCoordinatePlane) {
                        window.drawCoordinatePlane();
                    }
                }, 50);
            }
        });
    });

    // Форма
    const form = document.getElementById('coordinateForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit();
        });
    }

    // Кнопка очистки с красивым модальным окном (пункт 3)
    const clearButton = document.getElementById('clear-results');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            showConfirmModal('Очистить все результаты?', 'Это действие нельзя отменить', function() {
                clearResults();
            });
        });
    }
}

// Обновление отображения текущего R
function updateCurrentRDisplay() {
    const currentRSpan = document.getElementById('current-r');
    if (currentRSpan) {
        currentRSpan.textContent = selectedR || '-';
    }
}

// УЛУЧШЕННАЯ ВАЛИДАЦИЯ (пункт 1 и 7)
function validateX() {
    const errorElement = document.getElementById('x-error');
    if (!errorElement) return true;

    if (selectedX === null || isNaN(selectedX)) {
        showError(errorElement, 'Выберите значение X');
        return false;
    }

    const allowedValues = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
    if (!allowedValues.includes(selectedX)) {
        showError(errorElement, 'X должен быть одним из допустимых значений');
        return false;
    }

    hideError(errorElement);
    return true;
}

function validateY() {
    const errorElement = document.getElementById('y-error');
    if (!errorElement) return true;

    if (selectedY === null || selectedY === '') {
        showError(errorElement, 'Введите значение Y');
        return false;
    }

    // Преобразуем в число для проверки диапазона
    const numY = parseFloat(selectedY);

    if (isNaN(numY)) {
        showError(errorElement, 'Y должен быть числом');
        return false;
    }

    if (numY <= -3 || numY >= 5) {
        showError(errorElement, 'Y должен быть в интервале (-3; 5)');
        return false;
    }

    hideError(errorElement);
    return true;
}

function validateR() {
    const errorElement = document.getElementById('r-error');
    if (!errorElement) return true;

    if (selectedR === null || isNaN(selectedR)) {
        showError(errorElement, 'Выберите значение R');
        return false;
    }

    const allowedValues = [1, 1.5, 2, 2.5, 3];
    if (!allowedValues.includes(selectedR)) {
        showError(errorElement, 'R должен быть одним из допустимых значений');
        return false;
    }

    hideError(errorElement);
    return true;
}

// Показать ошибку
function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.classList.add('show');
        element.closest('.form-group')?.classList.add('error');
    }
}

// Скрыть ошибку
function hideError(element) {
    if (element) {
        element.textContent = '';
        element.classList.remove('show');
        element.closest('.form-group')?.classList.remove('error');
    }
}

// Обработка отправки формы
function handleFormSubmit() {
    console.log('Отправка формы:', { x: selectedX, y: selectedY, r: selectedR });

    if (!validateX() || !validateY() || !validateR()) {
        showModal('Пожалуйста, исправьте ошибки в форме');
        return;
    }

    // Реальная отправка данных на FastCGI сервер
    sendDataToServer(selectedX, selectedY, selectedR);
}

// Отправка данных на FastCGI сервер (без показа загрузки для точек с canvas - пункт 2)
function sendDataToServer(x, y, r, fromCanvas = false) {
    console.log('Отправка на сервер:', { x, y, r });

    // Показываем загрузку только если это не с canvas (пункт 2)
    if (!fromCanvas) {
        showLoading(true);
    }

    // Отправляем Y как строку для сохранения всех знаков (пункт 5)
    const data = {
        x: x,
        y: String(y), // Отправляем как строку
        r: r
    };

    // Исправленный URL для FastCGI
    fetch('/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Ответ сервера:', data);
            handleServerResponse(data);
        })
        .catch(error => {
            console.error('Ошибка:', error);
            handleServerError(error);
        })
        .finally(() => {
            if (!fromCanvas) {
                showLoading(false);
            }
        });
}

// Обработка ответа сервера
function handleServerResponse(data) {
    if (data.error) {
        showModal('Ошибка сервера: ' + data.error);
        return;
    }

    console.log('Обработка ответа:', data);

    addResultToTable(data);
    saveResultToStorage(data);

    if (window.addPointToCanvas) {
        // Используем исходные значения из ответа
        window.addPointToCanvas(parseFloat(data.x), parseFloat(data.y), data.hit, parseFloat(data.r));
    }

    hideEmptyState();
    clearForm();
}

// Обработка ошибки сервера
function handleServerError(error) {
    let errorMessage = 'Ошибка при отправке запроса на сервер';

    if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Не удается подключиться к серверу. Проверьте, что FastCGI сервер запущен';
    } else if (error.message.includes('500')) {
        errorMessage = 'Внутренняя ошибка сервера';
    } else if (error.message.includes('400')) {
        errorMessage = 'Некорректные данные';
    } else if (error.message.includes('405')) {
        errorMessage = 'Недопустимый метод запроса';
    }

    showModal(errorMessage);
}

// Добавление результата в таблицу
function addResultToTable(data) {
    const tableBody = document.getElementById('results-body');
    if (!tableBody) return;

    const row = document.createElement('tr');
    row.className = data.hit ? 'hit' : 'miss';

    const resultText = data.hit ? 'Попадание' : 'Промах';
    const resultClass = data.hit ? 'result-hit' : 'result-miss';

    // Отображаем Y как есть, без округления
    row.innerHTML = `
        <td>${data.x}</td>
        <td>${data.y}</td>
        <td>${data.r}</td>
        <td class="${resultClass}">${resultText}</td>
        <td>${formatTime(data.currentTime)}</td>
        <td>${data.scriptTimeMs} мс</td>
    `;

    tableBody.insertBefore(row, tableBody.firstChild);
    hideEmptyState();
}

// Форматирование времени
function formatTime(timeString) {
    try {
        const date = new Date(timeString);
        return date.toLocaleString('ru-RU');
    } catch (e) {
        return timeString;
    }
}

// Очистка формы
function clearForm() {
    selectedX = null;
    selectedY = null;

    document.querySelectorAll('.x-btn').forEach(btn => btn.classList.remove('active'));

    const yInput = document.getElementById('y-input');
    if (yInput) yInput.value = '';

    // Очищаем ошибки
    ['x-error', 'y-error'].forEach(id => {
        const errorElement = document.getElementById(id);
        if (errorElement) hideError(errorElement);
    });
}

// Очистка результатов
function clearResults() {
    const tableBody = document.getElementById('results-body');
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    localStorage.removeItem('web1_results');

    if (window.clearCanvas) {
        window.clearCanvas();
    }

    showEmptyState();
}

// Сохранение в localStorage
function saveResultToStorage(data) {
    try {
        let results = JSON.parse(localStorage.getItem('web1_results') || '[]');
        results.unshift(data);

        if (results.length > 50) {
            results = results.slice(0, 50);
        }

        localStorage.setItem('web1_results', JSON.stringify(results));
    } catch (e) {
        console.error('Ошибка при сохранении:', e);
    }
}

// Загрузка из localStorage
function loadStoredResults() {
    try {
        const results = JSON.parse(localStorage.getItem('web1_results') || '[]');

        if (results.length === 0) {
            showEmptyState();
            return;
        }

        results.forEach(data => {
            addResultToTable(data);

            if (window.addPointToCanvas) {
                window.addPointToCanvas(parseFloat(data.x), parseFloat(data.y), data.hit, parseFloat(data.r));
            }
        });

        hideEmptyState();
    } catch (e) {
        console.error('Ошибка при загрузке:', e);
        showEmptyState();
    }
}

// Функция для добавления точки с canvas (без загрузки - пункт 2)
function addPointFromCanvas(x, y) {
    console.log('Добавление точки с canvas:', { x, y });

    if (!selectedR) {
        showModal('Выберите значение R');
        return;
    }

    if (x < -2 || x > 2) {
        showModal('X должен быть в диапазоне [-2; 2]');
        return;
    }

    if (y <= -3 || y >= 5) {
        showModal('Y должен быть в диапазоне (-3; 5)');
        return;
    }

    // Отправляем БЕЗ показа загрузки (пункт 2)
    sendDataToServer(x, y, selectedR, true);
}

// Инициализация модального окна
function initializeModal() {
    const modal = document.getElementById('error-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.close-btn');
    const backdrop = modal.querySelector('.modal-backdrop');

    if (closeBtn) {
        closeBtn.addEventListener('click', hideModal);
    }

    if (backdrop) {
        backdrop.addEventListener('click', hideModal);
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideModal();
        }
    });
}

// Показать модальное окно
function showModal(message) {
    const modal = document.getElementById('error-modal');
    const errorText = document.getElementById('error-text');

    if (modal && errorText) {
        errorText.textContent = message;
        modal.style.display = 'flex';
    }
}

// Скрыть модальное окно
function hideModal() {
    const modal = document.getElementById('error-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// НОВОЕ: Инициализация модального окна подтверждения (пункт 3)
function initializeConfirmModal() {
    // Создаем модальное окно подтверждения, если его еще нет
    if (!document.getElementById('confirm-modal')) {
        const confirmModalHTML = `
            <div id="confirm-modal" class="modal">
                <div class="modal-backdrop"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title" id="confirm-title">Подтверждение</h3>
                        <button class="close-btn" type="button">×</button>
                    </div>
                    <div class="modal-body">
                        <p id="confirm-text"></p>
                        <div class="modal-actions">
                            <button id="confirm-yes" class="modal-btn modal-btn-primary">Да</button>
                            <button id="confirm-no" class="modal-btn modal-btn-secondary">Отмена</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', confirmModalHTML);
    }

    const modal = document.getElementById('confirm-modal');
    const closeBtn = modal.querySelector('.close-btn');
    const backdrop = modal.querySelector('.modal-backdrop');
    const noBtn = document.getElementById('confirm-no');

    // Обработчики для закрытия
    [closeBtn, backdrop, noBtn].forEach(element => {
        if (element) {
            element.addEventListener('click', hideConfirmModal);
        }
    });
}

// Показать модальное окно подтверждения (пункт 3)
function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-title');
    const textEl = document.getElementById('confirm-text');
    const yesBtn = document.getElementById('confirm-yes');

    if (modal && titleEl && textEl && yesBtn) {
        titleEl.textContent = title;
        textEl.textContent = message;

        // Удаляем старый обработчик и добавляем новый
        const newYesBtn = yesBtn.cloneNode(true);
        yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);

        newYesBtn.addEventListener('click', function() {
            hideConfirmModal();
            if (onConfirm) onConfirm();
        });

        modal.style.display = 'flex';
    }
}

// Скрыть модальное окно подтверждения
function hideConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Показать/скрыть загрузку
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'flex' : 'none';
    }
}

// Инициализация таблицы
function initializeTable() {
    showEmptyState();
}

// Показать пустое состояние
function showEmptyState() {
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        emptyState.style.display = 'block';
    }
}

// Скрыть пустое состояние
function hideEmptyState() {
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        emptyState.style.display = 'none';
    }
}

// Защита от изменения через консоль (пункт 7)
(function() {
    // Защищаем критические переменные
    Object.defineProperty(window, 'selectedX', {
        get: function() { return selectedX; },
        set: function() { console.warn('Попытка изменить защищенную переменную'); },
        configurable: false
    });

    Object.defineProperty(window, 'selectedY', {
        get: function() { return selectedY; },
        set: function() { console.warn('Попытка изменить защищенную переменную'); },
        configurable: false
    });

    Object.defineProperty(window, 'selectedR', {
        get: function() { return selectedR; },
        set: function() { console.warn('Попытка изменить защищенную переменную'); },
        configurable: false
    });
})();