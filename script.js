let selectedX = null;
let currentR = 1;

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    drawGraph();
    loadPreviousResults();
});

function initializeEventListeners() {
    const xButtons = document.querySelectorAll('.x-button');
    xButtons.forEach(button => {
        button.addEventListener('click', function() {
            xButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
            selectedX = parseFloat(this.dataset.value);
            document.getElementById('x-value').value = selectedX;
            updateCurrentParams();
        });
    });

    const yInput = document.getElementById('y-input');
    yInput.addEventListener('input', function() {
        validateY();
        updateCurrentParams();
    });

    const rRadios = document.querySelectorAll('input[name="r"]');
    rRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            currentR = parseFloat(this.value);
            updateCurrentParams();
            drawGraph();
        });
    });

    const form = document.getElementById('pointForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            submitForm();
        }
    });
}

function validateY() {
    const yInput = document.getElementById('y-input');
    const yError = document.getElementById('y-error');
    const value = yInput.value.trim();
    
    // Проверяем на пустоту
    if (value === '') {
        yInput.classList.remove('error');
        yError.textContent = '';
        return false;
    }
    
    // А тут на число
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        yInput.classList.add('error');
        yError.textContent = 'Y должен быть числом';
        return false;
    }
    
    // Ну а тут на диапазон
    if (numValue < -3 || numValue > 5) {
        yInput.classList.add('error');
        yError.textContent = 'Y должен быть в диапазоне от -3 до 5';
        return false;
    }
    
    yInput.classList.remove('error');
    yError.textContent = '';
    return true;
}

function validateForm() {
    let isValid = true;
    
    if (selectedX === null) {
        alert('Пожалуйста, выберите значение X');
        isValid = false;
    }

    if (!validateY()) {
        const yInput = document.getElementById('y-input');
        if (yInput.value.trim() === '') {
            yInput.classList.add('error');
            document.getElementById('y-error').textContent = 'Введите значение Y';
        }
        isValid = false;
    }

    const selectedR = document.querySelector('input[name="r"]:checked');
    if (!selectedR) {
        alert('Пожалуйста, выберите значение R');
        isValid = false;
    }
    
    return isValid;
}

// Обновление переменных
function updateCurrentParams() {
    document.getElementById('current-x').textContent = selectedX !== null ? selectedX : '-';
    
    const yInput = document.getElementById('y-input');
    const yValue = yInput.value.trim();
    document.getElementById('current-y').textContent = yValue !== '' && !isNaN(parseFloat(yValue)) ? yValue : '-';
    
    const selectedR = document.querySelector('input[name="r"]:checked');
    document.getElementById('current-r').textContent = selectedR ? selectedR.value : '-';
}

// Отправка формы через AJAX
function submitForm() {
    const formData = new FormData();
    formData.append('x', selectedX);
    formData.append('y', document.getElementById('y-input').value);
    formData.append('r', document.querySelector('input[name="r"]:checked').value);
    
    // Отправка POST-запроса к FastCGI серверу
    fetch('/fcgi-bin/hello-world.jar', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        addResultToTable(data);
        drawPoint(data.x, data.y, data.hit);
    })
    .catch(error => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке запроса');
    });
}

// Добавление результата в таблицу
function addResultToTable(result) {
    const tbody = document.getElementById('resultsBody');
    const row = tbody.insertRow(0);
    
    row.innerHTML = `
        <td>${result.x}</td>
        <td>${result.y}</td>
        <td>${result.r}</td>
        <td class="${result.hit ? 'result-hit' : 'result-miss'}">${result.hit ? 'Попадание' : 'Промах'}</td>
        <td>${result.requestTime}</td>
        <td>${result.executionTime} мс</td>
    `;
}

function loadPreviousResults() {
    fetch('/fcgi-bin/hello-world.jar?action=history')
        .then(response => response.json())
        .then(data => {
            if (data.results && Array.isArray(data.results)) {
                data.results.forEach(result => {
                    addResultToTable(result);
                });
            }
        })
        .catch(error => {
            console.log('Нет сохраненных результатов');
        });
}

// Рисование графика
function drawGraph() {
    const canvas = document.getElementById('graph');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 60; 

    ctx.clearRect(0, 0, width, height);
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
    ctx.lineWidth = 2;
    
    const r = currentR * scale;
    
    // Прямоугольник
    ctx.fillRect(centerX - r/2, centerY - r, r/2, r);
    ctx.strokeRect(centerX - r/2, centerY - r, r/2, r);
    
    // Четверть круга 
    ctx.beginPath();
    ctx.arc(centerX, centerY, r/2, Math.PI/2, Math.PI);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Треугольник 
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + r/2, centerY);
    ctx.lineTo(centerX, centerY + r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width - 10, centerY - 5);
    ctx.lineTo(width, centerY);
    ctx.lineTo(width - 10, centerY + 5);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX - 5, 10);
    ctx.lineTo(centerX, 0);
    ctx.lineTo(centerX + 5, 10);
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = -3; i <= 3; i+=0.5) {
        if (i !== 0) {
            const x = centerX + i * scale;
            ctx.beginPath();
            ctx.moveTo(x, centerY - 5);
            ctx.lineTo(x, centerY + 5);
            ctx.stroke();
            
            if (Math.abs(i) <= currentR) {
                ctx.fillText(i === -0.5 ? '-R/2' : i === 0.5 ? 'R/2' : i === -1 ? '-R' : i === 1 ? 'R' : i === -1.5 ? '-3R/2' : i === 1.5 ? '3R/2' :i === -2 ? '-2R' : i === 2 ? '2R' : i === -2.5 ? '-5R/2' : i === 2.5 ? '5R/2' : i === -3 ? '-3R' : i === 3 ? '3R' : i, x, centerY + 10);
            }
        }
    }

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let i = -3; i <= 3; i+=0.5) {
        if (i !== 0) {
            const y = centerY - i * scale;
            ctx.beginPath();
            ctx.moveTo(centerX - 5, y);
            ctx.lineTo(centerX + 5, y);
            ctx.stroke();
            
            if (Math.abs(i) <= currentR) {
                ctx.fillText(i === -0.5 ? '-R/2' : i === 0.5 ? 'R/2' : i === -1 ? '-R' : i === 1 ? 'R' : i === -1.5 ? '-3R/2' : i === 1.5 ? '3R/2' :i === -2 ? '-2R' : i === 2 ? '2R' : i === -2.5 ? '-5R/2' : i === 2.5 ? '5R/2' : i === -3 ? '-3R' : i === 3 ? '3R' : i, centerX + 10, y);
            }
        }
    }

    ctx.font = 'bold 14px Arial';
    ctx.fillText('X', width - 15, centerY - 15);
    ctx.fillText('Y', centerX - 20, 10);
}

function drawPoint(x, y, hit) {
    const canvas = document.getElementById('graph');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = 60;
    
    const pointX = centerX + x * scale / currentR;
    const pointY = centerY - y * scale / currentR;
    
    ctx.fillStyle = hit ? '#48bb78' : '#e53e3e';
    ctx.strokeStyle = hit ? '#2f855a' : '#c53030';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(pointX, pointY, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}
