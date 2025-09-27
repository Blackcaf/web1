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

    // Y поле
    const yInput = document.getElementById('y-input');
    if (yInput) {
        yInput.addEventListener('input', function() {
            const value = this.value.trim().replace(',', '.');
            selectedY = value ? parseFloat(value) : null;
            console.log('Введен Y:', selectedY);
            validateY();
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

    // Кнопка очистки
    const clearButton = document.getElementById('clear-results');
    if (clearButton) {
        clearButton.addEventListener('click', function() {
            if (confirm('Очистить все результаты?')) {
                clearResults();
            }
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

// Валидация X
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

// Валидация Y
function validateY() {
    const errorElement = document.getElementById('y-error');
    if (!errorElement) return true;

    if (selectedY === null || isNaN(selectedY)) {
        showError(errorElement, 'Введите значение Y');
        return false;
    }

    if (selectedY <= -3 || selectedY >= 5) {
        showError(errorElement, 'Y должен быть в интервале (-3; 5)');
        return false;
    }

    hideError(errorElement);
    return true;
}

// Валидация R
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

// Отправка данных на FastCGI сервер
function sendDataToServer(x, y, r) {
    console.log('Отправка на сервер:', { x, y, r });

    showLoading(true);

    const data = {
        x: x,
        y: y,
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
            showLoading(false);
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

// Функция для добавления точки с canvas
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

    sendDataToServer(x, y, selectedR);
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