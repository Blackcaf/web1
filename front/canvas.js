// Переменные для canvas
let canvas;
let ctx;
let canvasSize = 600;
let center;
let scale;
let points = [];

// Инициализация canvas при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initializeCanvas();
});

// Инициализация canvas
function initializeCanvas() {
    canvas = document.getElementById('coordinatePlane');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    center = canvasSize / 2;

    // Увеличенный масштаб - теперь график больше!
    scale = canvasSize / 8; // Показываем от -4 до +4, но график крупнее

    // Обработчик клика по canvas
    canvas.addEventListener('click', handleCanvasClick);

    // Начальная отрисовка
    drawCoordinatePlane();
}

// Отрисовка координатной плоскости
function drawCoordinatePlane() {
    // Очистка canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Заливка фона
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Отрисовка областей
    if (window.currentR && window.currentR()) {
        drawAreas(window.currentR());
    }

    // Отрисовка сетки
    drawGrid();

    // Отрисовка осей
    drawAxes();

    // Отрисовка меток с R-шкалой
    drawLabelsWithRScale();

    // Отрисовка всех точек
    drawAllPoints();
}

// ⭐ ИСПРАВЛЕННЫЕ ОБЛАСТИ - четверть круга СЛЕВА СНИЗУ ⭐
function drawAreas(r) {
    const rPixels = r * scale; // R в пикселях
    const halfRPixels = rPixels / 2; // R/2 в пикселях

    ctx.save();
    ctx.globalAlpha = 0.4;

    // 🔵 ОБЛАСТЬ 1: Прямоугольник СЛЕВА СВЕРХУ (2-й квадрант)
    // X: от -R/2 до 0, Y: от 0 до R
    ctx.fillStyle = '#4A90E2'; // Синий
    ctx.fillRect(
        center - halfRPixels,  // x = -R/2
        center - rPixels,      // y = R (помним, что Y инвертирован)
        halfRPixels,           // width = R/2
        rPixels                // height = R
    );

    // 🟠 ОБЛАСТЬ 2: Четверть круга СЛЕВА СНИЗУ (3-й квадрант) - ИСПРАВЛЕНО!
    // Радиус R/2, центр в (0,0)
    ctx.fillStyle = '#FF9500'; // Оранжевый
    ctx.beginPath();
    ctx.arc(center, center, halfRPixels, Math.PI, 3*Math.PI/2); // от 180° до 270°
    ctx.lineTo(center, center); // линия к центру
    ctx.closePath();
    ctx.fill();

    // 🟢 ОБЛАСТЬ 3: Треугольник СПРАВА СНИЗУ (4-й квадрант)
    // X: от 0 до R/2, Y: от 0 до -R
    ctx.fillStyle = '#34C759'; // Зеленый
    ctx.beginPath();
    ctx.moveTo(center, center);                    // (0, 0)
    ctx.lineTo(center + halfRPixels, center);      // (R/2, 0)
    ctx.lineTo(center, center + rPixels);          // (0, -R)
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Контуры областей
    ctx.strokeStyle = '#1D1D1F';
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 1;

    // Контур прямоугольника
    ctx.strokeRect(
        center - halfRPixels,
        center - rPixels,
        halfRPixels,
        rPixels
    );

    // Контур четверти круга
    ctx.beginPath();
    ctx.arc(center, center, halfRPixels, Math.PI, 3*Math.PI/2);
    ctx.stroke();

    // Контур треугольника
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + halfRPixels, center);
    ctx.lineTo(center, center + rPixels);
    ctx.closePath();
    ctx.stroke();
}

// Отрисовка сетки с R-делениями
function drawGrid() {
    const currentR = window.currentR ? window.currentR() : 2; // Дефолтный R для сетки
    const rPixels = currentR * scale;
    const halfRPixels = rPixels / 2;

    ctx.strokeStyle = '#E5E5E7';
    ctx.lineWidth = 1;

    // Сетка через R/2
    const step = halfRPixels;

    // Вертикальные линии
    for (let i = center - 4*rPixels; i <= center + 4*rPixels; i += step) {
        if (i >= 0 && i <= canvasSize) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvasSize);
            ctx.stroke();
        }
    }

    // Горизонтальные линии
    for (let i = center - 4*rPixels; i <= center + 4*rPixels; i += step) {
        if (i >= 0 && i <= canvasSize) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvasSize, i);
            ctx.stroke();
        }
    }

    // Более толстые линии для R-делений
    ctx.strokeStyle = '#D1D1D6';
    ctx.lineWidth = 1.5;

    // Линии через R
    const mainStep = rPixels;

    for (let i = center - 4*rPixels; i <= center + 4*rPixels; i += mainStep) {
        if (i >= 0 && i <= canvasSize) {
            // Вертикальные
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvasSize);
            ctx.stroke();

            // Горизонтальные
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvasSize, i);
            ctx.stroke();
        }
    }
}

// Отрисовка осей координат
function drawAxes() {
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

    // Стрелки осей
    drawArrow(canvasSize - 20, center, canvasSize - 5, center); // X
    drawArrow(center, 20, center, 5); // Y
}

// Отрисовка стрелки
function drawArrow(x1, y1, x2, y2) {
    ctx.strokeStyle = '#1D1D1F';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#1D1D1F';

    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLength = 15;

    ctx.beginPath();
    ctx.moveTo(x2 - arrowLength * Math.cos(angle - Math.PI/6), y2 - arrowLength * Math.sin(angle - Math.PI/6));
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2 - arrowLength * Math.cos(angle + Math.PI/6), y2 - arrowLength * Math.sin(angle + Math.PI/6));
    ctx.stroke();
}

// 📏 R-ШКАЛА ВМЕСТО ЦИФР
function drawLabelsWithRScale() {
    const currentR = window.currentR ? window.currentR() : null;

    // Если R не выбран, показываем обычные цифры
    if (!currentR) {
        drawRegularLabels();
        return;
    }

    const rPixels = currentR * scale;
    const halfRPixels = rPixels / 2;

    ctx.fillStyle = '#1D1D1F';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // R-деления на осях
    const rDivisions = [
        { value: -2, label: '-2R', pixels: -2 * rPixels },
        { value: -1.5, label: '-3R/2', pixels: -1.5 * rPixels },
        { value: -1, label: '-R', pixels: -rPixels },
        { value: -0.5, label: '-R/2', pixels: -halfRPixels },
        { value: 0.5, label: 'R/2', pixels: halfRPixels },
        { value: 1, label: 'R', pixels: rPixels },
        { value: 1.5, label: '3R/2', pixels: 1.5 * rPixels },
        { value: 2, label: '2R', pixels: 2 * rPixels }
    ];

    rDivisions.forEach(div => {
        // Метки на оси X
        const x = center + div.pixels;
        if (x >= 40 && x <= canvasSize - 40) {
            // Цвет метки в зависимости от значения
            if (div.value === 1 || div.value === -1) {
                ctx.fillStyle = '#007AFF'; // Синий для R
            } else if (div.value === 0.5 || div.value === -0.5) {
                ctx.fillStyle = '#FF9500'; // Оранжевый для R/2
            } else {
                ctx.fillStyle = '#666666'; // Серый для остальных
            }

            ctx.fillText(div.label, x, center + 30);

            // Деления на оси X
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = div.value === 1 || div.value === -1 || div.value === 0.5 || div.value === -0.5 ? 3 : 2;
            ctx.beginPath();
            ctx.moveTo(x, center - 12);
            ctx.lineTo(x, center + 12);
            ctx.stroke();
        }

        // Метки на оси Y
        const y = center - div.pixels; // Инвертируем для Y
        if (y >= 40 && y <= canvasSize - 40) {
            // Цвет метки
            if (div.value === 1 || div.value === -1) {
                ctx.fillStyle = '#007AFF'; // Синий для R
            } else if (div.value === 0.5 || div.value === -0.5) {
                ctx.fillStyle = '#FF9500'; // Оранжевый для R/2
            } else {
                ctx.fillStyle = '#666666'; // Серый для остальных
            }

            ctx.fillText(div.label, center - 35, y);

            // Деления на оси Y
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = div.value === 1 || div.value === -1 || div.value === 0.5 || div.value === -0.5 ? 3 : 2;
            ctx.beginPath();
            ctx.moveTo(center - 12, y);
            ctx.lineTo(center + 12, y);
            ctx.stroke();
        }
    });

    // Подписи осей
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#1D1D1F';
    ctx.fillText('X', canvasSize - 35, center - 25);
    ctx.fillText('Y', center + 25, 35);
    ctx.fillText('0', center - 25, center + 25);
}

// Обычные цифровые метки (если R не выбран)
function drawRegularLabels() {
    ctx.fillStyle = '#1D1D1F';
    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Основные деления
    const divisions = [-3, -2, -1, 1, 2, 3];

    divisions.forEach(i => {
        const x = center + i * scale;
        const y = center - i * scale;

        // Метки на оси X
        if (x >= 20 && x <= canvasSize - 20) {
            ctx.fillText(i.toString(), x, center + 25);

            ctx.strokeStyle = '#1D1D1F';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, center - 10);
            ctx.lineTo(x, center + 10);
            ctx.stroke();
        }

        // Метки на оси Y
        if (y >= 20 && y <= canvasSize - 20) {
            ctx.fillText(i.toString(), center - 25, y);

            ctx.strokeStyle = '#1D1D1F';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(center - 10, y);
            ctx.lineTo(center + 10, y);
            ctx.stroke();
        }
    });

    // Подписи осей
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#1D1D1F';
    ctx.fillText('X', canvasSize - 35, center - 25);
    ctx.fillText('Y', center + 25, 35);
    ctx.fillText('0', center - 25, center + 25);
}

// Обработка клика по canvas
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Преобразование пиксельных координат в математические
    const mathX = (x - center) / scale;
    const mathY = -(y - center) / scale; // Инвертируем Y

    // Округление до разумной точности (0.1)
    const roundedX = Math.round(mathX * 10) / 10;
    const roundedY = Math.round(mathY * 10) / 10;

    console.log(`Клик: пиксели (${x.toFixed(1)}, ${y.toFixed(1)}) -> координаты (${roundedX}, ${roundedY})`);

    // Вызов функции добавления точки из main script
    if (window.addPointFromCanvas) {
        window.addPointFromCanvas(roundedX, roundedY);
    }
}

// Добавление точки на canvas
function addPointToCanvas(x, y, hit, r) {
    points.push({ x, y, hit, r });
    drawPoint(x, y, hit, r);
}

// Отрисовка одной точки
function drawPoint(x, y, hit, r) {
    const pixelX = center + x * scale;
    const pixelY = center - y * scale; // Инвертируем Y

    ctx.save();

    // Цвет точки в зависимости от попадания
    ctx.fillStyle = hit ? '#34C759' : '#FF3B30'; // iOS цвета
    ctx.strokeStyle = hit ? '#30A14E' : '#D60A00';
    ctx.lineWidth = 3;

    // Отрисовка точки (увеличенной)
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Подсветка для последней добавленной точки
    if (points.length > 0 && points[points.length - 1].x === x && points[points.length - 1].y === y) {
        ctx.strokeStyle = '#FF9500';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, 15, 0, 2 * Math.PI);
        ctx.stroke();

        // Анимация пульсации
        setTimeout(() => {
            drawCoordinatePlane();
        }, 2000);
    }

    ctx.restore();
}

// Отрисовка всех точек
function drawAllPoints() {
    points.forEach(point => {
        drawPoint(point.x, point.y, point.hit, point.r);
    });
}

// Очистка canvas
function clearCanvas() {
    points = [];
    drawCoordinatePlane();
}

// Экспорт функций
window.drawCoordinatePlane = drawCoordinatePlane;
window.addPointToCanvas = addPointToCanvas;
window.clearCanvas = clearCanvas;