// Глобальные переменные
let selectedX = null;
let selectedY = null;
let selectedR = null;
let currentR = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    initializeModal();
    initializeTable();
    loadStoredResults();
});

// Инициализация формы
function initializeForm() {
    // Обработчики для кнопок X
    const xButtons = document.querySelectorAll('.x-btn');
    xButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Предотвращаем отправку формы
            selectXValue(this.dataset.value);
            updateActiveButton(xButtons, this);
        });
    });

    // Обработчик для поля Y
    const yInput = document.getElementById('y-input');
    yInput.addEventListener('input', function() {
        selectedY = this.value;
        validateY();
    });
    yInput.addEventListener('blur', validateY);

    // Обработчики для радио кнопок R
    const rRadios = document.querySelectorAll('input[name="r"]');
    rRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                selectedR = parseFloat(this.value);
                currentR = selectedR;
                updateCurrentR();
                validateR();
                // Перерисовать координатную плоскость с новым R
                if (window.drawCoordinatePlane) {
                    drawCoordinatePlane();
                }
            }
        });
    });

    // Обработчик отправки формы
    const form = document.getElementById('coordinateForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmit();
    });

    // Кнопка очистки результатов
    const clearButton = document.getElementById('clear-results');
    if (clearButton) {
        clearButton.addEventListener('click', clearResults);
    }
}

// Выбор значения X
function selectXValue(value) {
    selectedX = parseFloat(value);
    validateX();
}

// Обновление активной кнопки
function updateActiveButton(buttons, activeButton) {
    buttons.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
}

// Обновление текущего R в интерфейсе
function updateCurrentR() {
    const currentRSpan = document.getElementById('current-r');
    if (currentRSpan) {
        currentRSpan.textContent = selectedR || '-';
    }
}

// Валидация X
function validateX() {
    const errorElement = document.getElementById('x-error');
    const formGroup = errorElement?.closest('.form-group');

    if (!errorElement || !formGroup) return false;

    if (selectedX === null) {
        showError(errorElement, 'Выберите значение X');
        formGroup.classList.add('error');
        return false;
    }

    const allowedValues = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
    if (!allowedValues.includes(selectedX)) {
        showError(errorElement, 'X должен быть одним из: -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2');
        formGroup.classList.add('error');
        return false;
    }

    hideError(errorElement);
    formGroup.classList.remove('error');
    return true;
}

// Валидация Y
function validateY() {
    const yInput = document.getElementById('y-input');
    const errorElement = document.getElementById('y-error');
    const formGroup = errorElement?.closest('.form-group');

    if (!yInput || !errorElement || !formGroup) return false;

    const value = yInput.value.trim();

    if (!value) {
        showError(errorElement, 'Введите значение Y');
        formGroup.classList.add('error');
        return false;
    }

    // Замена запятой на точку
    const normalizedValue = value.replace(',', '.');
    const numValue = parseFloat(normalizedValue);

    if (isNaN(numValue)) {
        showError(errorElement, 'Y должен быть числом');
        formGroup.classList.add('error');
        return false;
    }

    if (numValue <= -3 || numValue >= 5) {
        showError(errorElement, 'Y должен быть в интервале (-3; 5)');
        formGroup.classList.add('error');
        return false;
    }

    selectedY = numValue;
    yInput.value = normalizedValue; // Обновляем поле с нормализованным значением

    hideError(errorElement);
    formGroup.classList.remove('error');
    return true;
}

// Валидация R
function validateR() {
    const errorElement = document.getElementById('r-error');
    const formGroup = errorElement?.closest('.form-group');

    if (!errorElement || !formGroup) return false;

    if (selectedR === null) {
        showError(errorElement, 'Выберите значение R');
        formGroup.classList.add('error');
        return false;
    }

    const allowedValues = [1, 1.5, 2, 2.5, 3];
    if (!allowedValues.includes(selectedR)) {
        showError(errorElement, 'R должен быть одним из: 1, 1.5, 2, 2.5, 3');
        formGroup.classList.add('error');
        return false;
    }

    hideError(errorElement);
    formGroup.classList.remove('error');
    return true;
}

// Показать ошибку
function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.classList.add('show');
    }
}

// Скрыть ошибку
function hideError(element) {
    if (element) {
        element.textContent = '';
        element.classList.remove('show');
    }
}

// Обработка отправки формы
function handleFormSubmit() {
    // Валидация всех полей
    const isXValid = validateX();
    const isYValid = validateY();
    const isRValid = validateR();

    if (!isXValid || !isYValid || !isRValid) {
        showModal('Пожалуйста, исправьте ошибки в форме');
        return;
    }

    // Отправка данных на сервер
    sendDataToServer(selectedX, selectedY, selectedR);
}

// Отправка данных на FastCGI сервер
function sendDataToServer(x, y, r) {
    showLoading(true);

    const data = {
        x: x,
        y: y,
        r: r
    };

    fetch('/fcgi-bin/web1.jar', {
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

    // Добавление результата в таблицу
    addResultToTable(data);

    // Сохранение результата в localStorage
    saveResultToStorage(data);

    // Обновление координатной плоскости
    if (window.addPointToCanvas) {
        addPointToCanvas(parseFloat(data.x), parseFloat(data.y), data.hit, selectedR);
    }

    // Скрытие пустого состояния
    hideEmptyState();

    // Очистка формы (кроме R)
    clearFormExceptR();
}

// Обработка ошибки сервера
function handleServerError(error) {
    let errorMessage = 'Ошибка при отправке запроса на сервер';

    if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Не удается подключиться к серверу. Проверьте, что FastCGI сервер запущен на порту 25501';
    } else if (error.message.includes('500')) {
        errorMessage = 'Внутренняя ошибка сервера';
    } else if (error.message.includes('400')) {
        errorMessage = 'Некорректные данные';
    }

    showModal(errorMessage);
}

// Скрытие пустого состояния
function hideEmptyState() {
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        emptyState.style.display = 'none';
    }
}

// Показ пустого состояния
function showEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const tableBody = document.getElementById('results-body');
    if (emptyState && tableBody && tableBody.children.length === 0) {
        emptyState.style.display = 'block';
    }
}

// Добавление результата в таблицу
function addResultToTable(data) {
    const tableBody = document.getElementById('results-body');
    if (!tableBody) return;

    const row = document.createElement('tr');

    const hitClass = data.hit ? 'hit' : 'miss';
    const resultText = data.hit ? 'Попадание' : 'Промах';
    const resultClass = data.hit ? 'result-hit' : 'result-miss';

    row.className = hitClass;
    row.innerHTML = `
        <td>${data.x}</td>
        <td>${data.y}</td>
        <td>${data.r}</td>
        <td class="${resultClass}">${resultText}</td>
        <td>${formatTime(data.currentTime)}</td>
        <td>${data.scriptTimeMs} мс</td>
    `;

    // Добавляем строку в начало таблицы
    tableBody.insertBefore(row, tableBody.firstChild);

    // Скрываем пустое состояние
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

// Очистка формы (кроме R)
function clearFormExceptR() {
    // Очистка X
    selectedX = null;
    const xButtons = document.querySelectorAll('.x-btn');
    xButtons.forEach(btn => btn.classList.remove('active'));
    const xError = document.getElementById('x-error');
    if (xError) {
        hideError(xError);
        const xFormGroup = xError.closest('.form-group');
        if (xFormGroup) xFormGroup.classList.remove('error');
    }

    // Очистка Y
    selectedY = null;
    const yInput = document.getElementById('y-input');
    if (yInput) {
        yInput.value = '';
        const yError = document.getElementById('y-error');
        if (yError) {
            hideError(yError);
            const yFormGroup = yError.closest('.form-group');
            if (yFormGroup) yFormGroup.classList.remove('error');
        }
    }
}

// Очистка результатов
function clearResults() {
    if (confirm('Вы уверены, что хотите очистить все результаты?')) {
        const tableBody = document.getElementById('results-body');
        if (tableBody) {
            tableBody.innerHTML = '';
            localStorage.removeItem('web1_results');

            // Показываем пустое состояние
            showEmptyState();

            // Очистка точек на координатной плоскости
            if (window.clearCanvas) {
                clearCanvas();
            }
        }
    }
}

// Сохранение результата в localStorage
function saveResultToStorage(data) {
    try {
        let results = JSON.parse(localStorage.getItem('web1_results') || '[]');
        results.unshift(data); // Добавляем в начало массива

        // Ограничиваем количество сохраненных результатов
        if (results.length > 50) {
            results = results.slice(0, 50);
        }

        localStorage.setItem('web1_results', JSON.stringify(results));
    } catch (e) {
        console.error('Ошибка при сохранении результатов:', e);
    }
}

// Загрузка сохраненных результатов
function loadStoredResults() {
    try {
        const results = JSON.parse(localStorage.getItem('web1_results') || '[]');

        if (results.length === 0) {
            showEmptyState();
            return;
        }

        results.forEach(data => {
            addResultToTable(data);

            // Добавление точки на координатную плоскость
            if (window.addPointToCanvas) {
                addPointToCanvas(parseFloat(data.x), parseFloat(data.y), data.hit, parseFloat(data.r));
            }
        });

        hideEmptyState();
    } catch (e) {
        console.error('Ошибка при загрузке результатов:', e);
        showEmptyState();
    }
}

// Исправленная инициализация модального окна
function initializeModal() {
    const modal = document.getElementById('error-modal');
    const closeBtn = modal?.querySelector('.close-btn');
    const backdrop = modal?.querySelector('.modal-backdrop');

    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideModal();
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideModal();
        });
    }

    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
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

        // Фокус на модальном окне для доступности
        setTimeout(() => {
            modal.focus();
        }, 100);
    }
}

// Скрыть модальное окно
function hideModal() {
    const modal = document.getElementById('error-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Показать/скрыть индикатор загрузки
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

// Функция для добавления точки через координатную плоскость
function addPointFromCanvas(x, y) {
    if (selectedR === null) {
        showModal('Пожалуйста, выберите значение R перед добавлением точки');
        return;
    }

    // Проверка диапазонов
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

// Экспорт функций для использования в других файлах
window.addPointFromCanvas = addPointFromCanvas;
window.currentR = () => selectedR;