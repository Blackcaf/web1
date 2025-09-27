// Переменные для canvas
let canvas;
let ctx;
let canvasSize = 600;
let center = 300;
let scale = 60; // Упрощенный масштаб: 1 единица = 60 пикселей
let points = [];

// Инициализация canvas при загрузке
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeCanvas();
    }, 200);
});

// Инициализация canvas
function initializeCanvas() {
    console.log('Инициализация canvas...');

    canvas = document.getElementById('coordinatePlane');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }

    console.log('Canvas инициализирован успешно');

    // Обработчик клика по canvas
    canvas.addEventListener('click', handleCanvasClick);

    // Начальная отрисовка
    drawCoordinatePlane();
}

// Основная функция отрисовки
function drawCoordinatePlane() {
    if (!ctx) {
        console.error('Canvas context not available');
        return;
    }

    console.log('Отрисовка координатной плоскости...');

    try {
        // Очистка canvas
        ctx.clearRect(0, 0, canvasSize, canvasSize);

        // Заливка фона
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        // Отрисовка всех точек
        function drawAllPoints() {
            if (!ctx || !points.length) return;

            console.log(`Отрисовка ${points.length} точек`);

            points.forEach(point => {
                if (typeof point.x === 'number' && typeof point.y === 'number') {
                    drawSinglePoint(point.x, point.y, point.hit);
                }
            });
        }

// Отрисовка одной точки
        function drawSinglePoint(x, y, hit) {
            if (!ctx) return;

            const pixelX = center + x * scale;
            const pixelY = center - y * scale; // Инвертируем Y

            ctx.save();

            ctx.fillStyle = hit ? '#34C759' : '#FF3B30';
            ctx.strokeStyle = hit ? '#30A14E' : '#D60A00';
            ctx.lineWidth = 3;

            ctx.beginPath();
            ctx.arc(pixelX, pixelY, 8, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }

// Очистка canvas
        function clearCanvas() {
            console.log('Очистка canvas');
            points = [];
            drawCoordinatePlane();
        }

// Экспорт функций
        window.drawCoordinatePlane = drawCoordinatePlane;
        window.addPointToCanvas = addPointToCanvas;
        window.clearCanvas = clearCanvas;овка сетки
        drawGrid();

        // Отрисовка осей
        drawAxes();

        // Отрисовка областей если R выбран
        const currentRValue = window.currentR ? window.currentR() : null;
        if (currentRValue && currentRValue > 0) {
            drawAreas(currentRValue);
        }

        // Отрисовка меток с R-шкалой
        drawLabelsWithRScale();

        // Отрисовка точек
        drawAllPoints();

        console.log('Координатная плоскость отрисована успешно');
    } catch (error) {
        console.error('Ошибка при отрисовке:', error);
    }
}

// Отрисовка сетки
function drawGrid() {
    if (!ctx) return;

    const currentRValue = window.currentR ? window.currentR() : 2;

    ctx.strokeStyle = '#E5E5E7';
    ctx.lineWidth = 0.5;

    // Мелкая сетка (через R/2)
    const smallStep = currentRValue * scale / 2;

    // Вертикальные линии
    for (let i = -10; i <= 10; i++) {
        const x = center + i * smallStep;
        if (x >= 0 && x <= canvasSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasSize);
            ctx.stroke();
        }
    }

    // Горизонтальные линии
    for (let i = -10; i <= 10; i++) {
        const y = center + i * smallStep;
        if (y >= 0 && y <= canvasSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasSize, y);
            ctx.stroke();
        }
    }

    // Основная сетка (через R)
    ctx.strokeStyle = '#D1D1D6';
    ctx.lineWidth = 1;

    const mainStep = currentRValue * scale;

    for (let i = -5; i <= 5; i++) {
        const x = center + i * mainStep;
        const y = center + i * mainStep;

        if (x >= 0 && x <= canvasSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasSize);
            ctx.stroke();
        }

        if (y >= 0 && y <= canvasSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasSize, y);
            ctx.stroke();
        }
    }
}

// Отрисовка осей координат
function drawAxes() {
    if (!ctx) return;

    ctx.strokeStyle = '#1D1D1F';
    ctx.lineWidth = 3;

    // Ось X
    ctx.beginPath();
    ctx.moveTo(0, center);
    ctx.lineTo(canvasSize, center);
    ctx.stroke();

    // Ось Y
    ctx.beginPath();
    ctx.moveTo(center, 0);
    ctx.lineTo(center, canvasSize);
    ctx.stroke();

    // Стрелки
    // Стрелка X
    ctx.beginPath();
    ctx.moveTo(canvasSize - 15, center - 5);
    ctx.lineTo(canvasSize - 5, center);
    ctx.lineTo(canvasSize - 15, center + 5);
    ctx.stroke();

    // Стрелка Y
    ctx.beginPath();
    ctx.moveTo(center - 5, 15);
    ctx.lineTo(center, 5);
    ctx.lineTo(center + 5, 15);
    ctx.stroke();
}

// ИСПРАВЛЕННАЯ отрисовка областей
function drawAreas(r) {
    if (!ctx || !r || r <= 0) return;

    console.log('Отрисовка областей для R =', r);

    const rPixels = r * scale;
    const halfRPixels = rPixels / 2;

    ctx.save();
    ctx.globalAlpha = 0.4;

    try {
        // 1. ПРЯМОУГОЛЬНИК (2-й квадрант): x от -R/2 до 0, y от 0 до R
        ctx.fillStyle = '#4A90E2'; // Синий
        ctx.fillRect(
            center - halfRPixels,  // x = -R/2
            center - rPixels,      // y = R (инвертированная Y)
            halfRPixels,           // width = R/2
            rPixels                // height = R
        );

        // 2. ЧЕТВЕРТЬ КРУГА СЛЕВА СНИЗУ (3-й квадрант) - ИСПРАВЛЕНО!
        // Радиус R/2, от π (180°) до 3π/2 (270°)
        ctx.fillStyle = '#FF9500'; // Оранжевый
        ctx.beginPath();
        ctx.arc(center, center, halfRPixels, Math.PI, 3 * Math.PI / 2);
        ctx.lineTo(center, center);
        ctx.closePath();
        ctx.fill();

        // 3. ТРЕУГОЛЬНИК (4-й квадрант): от (0,0) до (R/2,0) до (0,-R)
        ctx.fillStyle = '#34C759'; // Зеленый
        ctx.beginPath();
        ctx.moveTo(center, center);                    // (0, 0)
        ctx.lineTo(center + halfRPixels, center);      // (R/2, 0)
        ctx.lineTo(center, center + rPixels);          // (0, -R)
        ctx.closePath();
        ctx.fill();

    } catch (error) {
        console.error('Ошибка при отрисовке областей:', error);
    }

    ctx.restore();

    // Контуры областей
    ctx.strokeStyle = '#1D1D1F';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 1;

    // Контур прямоугольника
    ctx.strokeRect(center - halfRPixels, center - rPixels, halfRPixels, rPixels);

    // Контур четверти круга
    ctx.beginPath();
    ctx.arc(center, center, halfRPixels, Math.PI, 3 * Math.PI / 2);
    ctx.stroke();

    // Контур треугольника
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + halfRPixels, center);
    ctx.lineTo(center, center + rPixels);
    ctx.closePath();
    ctx.stroke();
}

// ИСПРАВЛЕННАЯ R-шкала с промежуточными делениями
function drawLabelsWithRScale() {
    if (!ctx) return;

    const currentRValue = window.currentR ? window.currentR() : null;

    // Если R не выбран, показываем обычные цифры
    if (!currentRValue) {
        drawRegularLabels();
        return;
    }

    ctx.fillStyle = '#1D1D1F';
    ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // R-деления с промежуточными значениями
    const rDivisions = [
        { value: -2, label: '-2R', pixels: -2 * currentRValue * scale, color: '#666666' },
        { value: -1.5, label: '-3R/2', pixels: -1.5 * currentRValue * scale, color: '#999999' },
        { value: -1, label: '-R', pixels: -1 * currentRValue * scale, color: '#007AFF' },
        { value: -0.5, label: '-R/2', pixels: -0.5 * currentRValue * scale, color: '#FF9500' },
        { value: 0.5, label: 'R/2', pixels: 0.5 * currentRValue * scale, color: '#FF9500' },
        { value: 1, label: 'R', pixels: 1 * currentRValue * scale, color: '#007AFF' },
        { value: 1.5, label: '3R/2', pixels: 1.5 * currentRValue * scale, color: '#999999' },
        { value: 2, label: '2R', pixels: 2 * currentRValue * scale, color: '#666666' }
    ];

    rDivisions.forEach(div => {
        // Метки на оси X
        const x = center + div.pixels;
        if (x >= 50 && x <= canvasSize - 50) {
            ctx.fillStyle = div.color;
            ctx.fillText(div.label, x, center + 25);

            // Деления на оси X
            ctx.strokeStyle = div.color;
            ctx.lineWidth = (div.value === 1 || div.value === -1 || div.value === 0.5 || div.value === -0.5) ? 3 : 2;
            ctx.beginPath();
            ctx.moveTo(x, center - 8);
            ctx.lineTo(x, center + 8);
            ctx.stroke();
        }

        // Метки на оси Y
        const y = center - div.pixels; // Инвертируем для Y
        if (y >= 50 && y <= canvasSize - 50) {
            ctx.fillStyle = div.color;
            ctx.fillText(div.label, center - 30, y);

            // Деления на оси Y
            ctx.strokeStyle = div.color;
            ctx.lineWidth = (div.value === 1 || div.value === -1 || div.value === 0.5 || div.value === -0.5) ? 3 : 2;
            ctx.beginPath();
            ctx.moveTo(center - 8, y);
            ctx.lineTo(center + 8, y);
            ctx.stroke();
        }
    });

    // Подписи осей
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#1D1D1F';
    ctx.fillText('X', canvasSize - 30, center - 20);
    ctx.fillText('Y', center + 20, 30);
    ctx.fillText('0', center - 20, center + 20);
}

// Обычные цифровые метки (если R не выбран)
function drawRegularLabels() {
    if (!ctx) return;

    ctx.fillStyle = '#1D1D1F';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Основные деления
    const divisions = [-4, -3, -2, -1, 1, 2, 3, 4];

    divisions.forEach(i => {
        const x = center + i * scale;
        const y = center - i * scale;

        // Метки на оси X
        if (x >= 30 && x <= canvasSize - 30) {
            ctx.fillText(i.toString(), x, center + 20);
        }

        // Метки на оси Y
        if (y >= 30 && y <= canvasSize - 30) {
            ctx.fillText(i.toString(), center - 20, y);
        }
    });

    // Подписи осей
    ctx.font = 'bold 16px Arial';
    ctx.fillText('X', canvasSize - 30, center - 20);
    ctx.fillText('Y', center + 20, 30);
    ctx.fillText('0', center - 20, center + 20);
}

// Обработка клика
function handleCanvasClick(event) {
    if (!canvas) return;

    console.log('Клик по canvas');

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Преобразование в математические координаты
    const mathX = (x - center) / scale;
    const mathY = -(y - center) / scale; // Инвертируем Y

    const roundedX = Math.round(mathX * 10) / 10;
    const roundedY = Math.round(mathY * 10) / 10;

    console.log(`Координаты: (${roundedX}, ${roundedY})`);

    if (window.addPointFromCanvas) {
        window.addPointFromCanvas(roundedX, roundedY);
    }
}

// Добавление точки
function addPointToCanvas(x, y, hit, r) {
    console.log(`Добавление точки: (${x}, ${y}), hit: ${hit}`);

    if (typeof x !== 'number' || typeof y !== 'number') {
        console.error('Некорректные координаты точки');
        return;
    }

    points.push({ x, y, hit, r });

    // Перерисовываем всё
    setTimeout(() => {
        drawCoordinatePlane();
    }, 10);
}

// Отрис