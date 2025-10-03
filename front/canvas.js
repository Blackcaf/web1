let canvas;
let ctx;
let canvasSize = 600;
let center = 300;
let baseScale = 50;
let points = [];

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeCanvas();
    }, 200);
});

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

    canvas.addEventListener('click', handleCanvasClick);

    drawCoordinatePlane();
}

function getCurrentScale() {
    return baseScale;
}

function drawCoordinatePlane() {
    if (!ctx) {
        console.error('Canvas context not available');
        return;
    }

    console.log('Отрисовка координатной плоскости...');

    try {
        ctx.clearRect(0, 0, canvasSize, canvasSize);

        drawPurpleBackground();

        drawBeautifulFrame();

        drawAxes();

        const currentRValue = window.currentR ? window.currentR() : null;
        if (currentRValue && currentRValue > 0) {
            drawAreas(currentRValue);
        }

        drawCleanScale();

        drawAllPoints();

        console.log('Координатная плоскость отрисована успешно');
    } catch (error) {
        console.error('Ошибка при отрисовке:', error);
    }
}

function drawPurpleBackground() {
    if (!ctx) return;

    const purpleGradient = ctx.createRadialGradient(
        canvasSize * 0.3, canvasSize * 0.3, 0,
        canvasSize * 0.7, canvasSize * 0.7, canvasSize * 0.9
    );

    purpleGradient.addColorStop(0, 'rgba(147,112,219,0.1)'); // Светло-фиолетовый
    purpleGradient.addColorStop(0.4, 'rgba(138,43,226,0.1)'); // Фиолетовый
    purpleGradient.addColorStop(0.7, 'rgba(123,104,238,0.1)'); // Средне-фиолетовый
    purpleGradient.addColorStop(1, 'rgba(106,90,205,0.1)'); // Сине-фиолетовый

    ctx.fillStyle = purpleGradient;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    ctx.save();

    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 8; i++) {
        const x = (canvasSize / 8) * i + Math.sin(i * 0.7) * 35;
        const y = canvasSize * 0.4 + Math.cos(i * 0.8) * 70;

        const waveGradient = ctx.createRadialGradient(x, y, 0, x + 40, y + 25, 90);
        waveGradient.addColorStop(0, 'rgba(186,85,211,0.1)'); // Medium orchid
        waveGradient.addColorStop(0.5, 'rgba(147,112,219,0.1)'); // Medium purple
        waveGradient.addColorStop(1, 'rgba(138,43,226,0.1)'); // Blue violet

        ctx.fillStyle = waveGradient;
        ctx.beginPath();
        ctx.ellipse(x, y, 60 + Math.sin(i) * 12, 30 + Math.cos(i) * 8, i * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 0.04;
    for (let i = 0; i < 12; i++) {
        const x = Math.random() * canvasSize;
        const y = Math.random() * canvasSize;
        const radius = 20 + Math.random() * 50;

        const dropGradient = ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0, x, y, radius
        );
        dropGradient.addColorStop(0, 'rgba(221,160,221,0.2)'); // Plum
        dropGradient.addColorStop(0.5, 'rgba(186,85,211,0.1)'); // Medium orchid
        dropGradient.addColorStop(1, 'rgba(147, 112, 219, 0.1)'); // Medium purple

        ctx.fillStyle = dropGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawBeautifulFrame() {
    if (!ctx) return;

    const outerPadding = 25;
    const innerPadding = 35;
    const borderRadius = 20;

    ctx.save();

    ctx.shadowColor = 'rgba(75,0,130,0.1)'; // Indigo shadow
    ctx.shadowBlur = 25;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;

    ctx.beginPath();
    ctx.roundRect(
        outerPadding,
        outerPadding,
        canvasSize - 2 * outerPadding,
        canvasSize - 2 * outerPadding,
        borderRadius
    );

    const outerGradient = ctx.createLinearGradient(0, outerPadding, 0, canvasSize - outerPadding);
    outerGradient.addColorStop(0, 'rgba(186, 85, 211, 0.25)'); // Medium orchid
    outerGradient.addColorStop(0.5, 'rgba(147, 112, 219, 0.2)'); // Medium purple
    outerGradient.addColorStop(1, 'rgba(138, 43, 226, 0.15)'); // Blue violet

    ctx.fillStyle = outerGradient;
    ctx.fill();

    // Убираем тень
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    const borderGradient = ctx.createLinearGradient(0, outerPadding, 0, canvasSize - outerPadding);
    borderGradient.addColorStop(0, 'rgba(221, 160, 221, 0.6)'); // Plum
    borderGradient.addColorStop(0.5, 'rgba(186, 85, 211, 0.4)'); // Medium orchid
    borderGradient.addColorStop(1, 'rgba(147, 112, 219, 0.5)'); // Medium purple

    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(
        innerPadding,
        innerPadding,
        canvasSize - 2 * innerPadding,
        canvasSize - 2 * innerPadding,
        borderRadius - 5
    );

    const innerGradient = ctx.createLinearGradient(0, innerPadding, 0, canvasSize - innerPadding);
    innerGradient.addColorStop(0, 'rgba(147, 112, 219, 0.08)'); // Medium purple
    innerGradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.06)'); // Blue violet
    innerGradient.addColorStop(1, 'rgba(123, 104, 238, 0.04)'); // Medium slate blue

    ctx.fillStyle = innerGradient;
    ctx.fill();

    const innerBorderGradient = ctx.createLinearGradient(0, innerPadding, 0, canvasSize - innerPadding);
    innerBorderGradient.addColorStop(0, 'rgba(221, 160, 221, 0.4)'); // Plum
    innerBorderGradient.addColorStop(0.5, 'rgba(186, 85, 211, 0.2)'); // Medium orchid
    innerBorderGradient.addColorStop(1, 'rgba(147, 112, 219, 0.3)'); // Medium purple

    ctx.strokeStyle = innerBorderGradient;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
}

function drawAllPoints() {
    if (!ctx || !points.length) return;

    points.forEach(point => {
        if (typeof point.x === 'number' && typeof point.y === 'number') {
            drawSinglePoint(point.x, point.y, point.hit);
        }
    });
}

function drawSinglePoint(x, y, hit) {
    if (!ctx) return;

    const scale = getCurrentScale();
    const pixelX = center + x * scale;
    const pixelY = center - y * scale;

    ctx.save();

    ctx.shadowColor = hit ? 'rgba(34, 139, 34, 0.4)' : 'rgba(220, 20, 60, 0.4)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;

    const gradient = ctx.createRadialGradient(
        pixelX - 3, pixelY - 3, 0,
        pixelX, pixelY, 12
    );

    if (hit) {
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.3, 'rgba(50, 205, 50, 0.9)'); // Lime green
        gradient.addColorStop(0.7, 'rgba(34, 139, 34, 0.95)'); // Forest green
        gradient.addColorStop(1, 'rgba(0, 100, 0, 0.8)'); // Dark green
    } else {
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.3, 'rgba(255, 69, 0, 0.9)'); // Red orange
        gradient.addColorStop(0.7, 'rgba(220, 20, 60, 0.95)'); // Crimson
        gradient.addColorStop(1, 'rgba(139, 0, 0, 0.8)'); // Dark red
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, 11, 0, 2 * Math.PI);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(pixelX - 3, pixelY - 3, 3, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
}

function clearCanvas() {
    points = [];
    drawCoordinatePlane();
}

function drawAxes() {
    if (!ctx) return;

    ctx.save();

    const axisGradient = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
    axisGradient.addColorStop(0, 'rgba(75, 0, 130, 0.7)'); // Indigo
    axisGradient.addColorStop(0.5, 'rgba(106, 90, 205, 0.8)'); // Slate blue
    axisGradient.addColorStop(1, 'rgba(72, 61, 139, 0.7)'); // Dark slate blue

    ctx.strokeStyle = axisGradient;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(60, center);
    ctx.lineTo(canvasSize - 60, center);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(center, 60);
    ctx.lineTo(center, canvasSize - 60);
    ctx.stroke();

    ctx.fillStyle = 'rgba(75, 0, 130, 0.8)'; // Indigo

    const arrowSize = 10;

    ctx.beginPath();
    ctx.moveTo(canvasSize - 60, center);
    ctx.lineTo(canvasSize - 60 - arrowSize, center - arrowSize/2);
    ctx.lineTo(canvasSize - 60 - arrowSize, center + arrowSize/2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(center, 60);
    ctx.lineTo(center - arrowSize/2, 60 + arrowSize);
    ctx.lineTo(center + arrowSize/2, 60 + arrowSize);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawAreas(r) {
    if (!ctx || !r || r <= 0) return;

    const rPixels = r * baseScale;
    const halfRPixels = rPixels / 2;

    ctx.save();

    ctx.globalAlpha = 0.4;

    try {
        ctx.fillStyle = 'rgba(0, 123, 255, 0.8)';
        ctx.fillRect(
            center - halfRPixels,
            center - rPixels,
            halfRPixels,
            rPixels
        );

        ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(center, center, halfRPixels, Math.PI/2, Math.PI, false);
        ctx.lineTo(center, center);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(40, 167, 69, 0.8)'; // Bright green
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.lineTo(center + halfRPixels, center);
        ctx.lineTo(center, center + rPixels);
        ctx.closePath();
        ctx.fill();

    } catch (error) {
        console.error('Ошибка при отрисовке областей:', error);
    }

    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 3;

    ctx.strokeStyle = 'rgb(0, 123, 255)';
    ctx.strokeRect(center - halfRPixels, center - rPixels, halfRPixels, rPixels);

    ctx.strokeStyle = 'rgb(255, 165, 0)';
    ctx.beginPath();
    ctx.arc(center, center, halfRPixels, Math.PI/2, Math.PI, false);
    ctx.stroke();

    ctx.strokeStyle = 'rgb(40, 167, 69)';
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(center + halfRPixels, center);
    ctx.lineTo(center, center + rPixels);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
}

function drawCleanScale() {
    if (!ctx) return;

    const scale = getCurrentScale();

    ctx.save();
    ctx.fillStyle = 'rgba(75, 0, 130, 0.8)'; // Indigo
    ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const divisions = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];

    divisions.forEach(factor => {
        const pixels = factor * scale;

        const x = center + pixels;
        if (x >= 80 && x <= canvasSize - 80) {
            const label = factor === 1 ? 'R' : factor === -1 ? '-R' : `${factor}R`;
            ctx.fillText(label, x, center + 30);

            ctx.strokeStyle = 'rgba(106, 90, 205, 0.6)'; // Slate blue
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, center - 8);
            ctx.lineTo(x, center + 8);
            ctx.stroke();
        }

        const y = center - pixels;
        if (y >= 80 && y <= canvasSize - 80) {
            const label = factor === 1 ? 'R' : factor === -1 ? '-R' : `${factor}R`;
            ctx.fillText(label, center - 40, y);

            ctx.strokeStyle = 'rgba(106, 90, 205, 0.6)'; // Slate blue
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(center - 8, y);
            ctx.lineTo(center + 8, y);
            ctx.stroke();
        }
    });

    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(72, 61, 139, 0.9)'; // Dark slate blue
    ctx.fillText('X', canvasSize - 50, center - 20);
    ctx.fillText('Y', center + 20, 50);
    ctx.fillText('0', center - 25, center + 25);

    ctx.restore();
}

function handleCanvasClick(event) {
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const scale = getCurrentScale();
    const mathX = (x - center) / scale;
    const mathY = -(y - center) / scale;

    const roundedX = Math.round(mathX * 10) / 10;
    const roundedY = Math.round(mathY * 10) / 10;

    if (window.addPointFromCanvas) {
        window.addPointFromCanvas(roundedX, roundedY);
    }
}

function addPointToCanvas(x, y, hit, r) {
    if (typeof x !== 'number' || typeof y !== 'number') {
        console.error('Некорректные координаты точки');
        return;
    }
    points.push({ x, y, hit, r });
    setTimeout(() => drawCoordinatePlane(), 10);
}

function isPointInArea(x, y, r) {
    if (!r || r <= 0) return false;
    if (x >= -r/2 && x <= 0 && y >= 0 && y <= r) return true;
    if (x <= 0 && y <= 0 && (x*x + y*y) <= (r/2)*(r/2)) return true;
    if (x >= 0 && x <= r/2 && y <= 0 && y >= -r) {
        if (2*x + y + r >= 0) {
            return true;
        }
    }

    return false;
}

function removePointFromCanvas(x, y) {
    points = points.filter(point => !(Math.abs(point.x - x) < 0.001 && Math.abs(point.y - y) < 0.001));
    drawCoordinatePlane();
}

function clearAllPoints() {
    points = [];
    drawCoordinatePlane();
}

function getAllPoints() {
    return [...points];
}

function setScale(newScale) {
    if (newScale > 0) {
        baseScale = newScale;
        drawCoordinatePlane();
    }
}

function resizeCanvas(newSize) {
    if (newSize > 0) {
        canvasSize = newSize;
        center = newSize / 2;
        if (canvas) {
            canvas.width = newSize;
            canvas.height = newSize;
        }
        drawCoordinatePlane();
    }
}

window.drawCoordinatePlane = drawCoordinatePlane;
window.addPointToCanvas = addPointToCanvas;
window.clearCanvas = clearCanvas;
window.clearAllPoints = clearAllPoints;
window.removePointFromCanvas = removePointFromCanvas;
window.getAllPoints = getAllPoints;
window.isPointInArea = isPointInArea;
window.setScale = setScale;
window.resizeCanvas = resizeCanvas;