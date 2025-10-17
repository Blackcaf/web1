let canvas, ctx;
const CONFIG = {
    size: 600,
    center: 300,
    scale: 50
};
let points = [];

document.addEventListener('DOMContentLoaded', () => setTimeout(initializeCanvas, 200));

function initializeCanvas() {
    canvas = document.getElementById('coordinatePlane');
    if (!canvas || !(ctx = canvas.getContext('2d'))) {
        console.error('Canvas initialization failed');
        return;
    }
    canvas.addEventListener('click', handleCanvasClick);
    drawCoordinatePlane();
}

function drawCoordinatePlane() {
    if (!ctx) return;
    ctx.clearRect(0, 0, CONFIG.size, CONFIG.size);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, CONFIG.size, CONFIG.size);

    drawAxes();

    const r = window.currentR?.();
    if (r > 0) drawAreas(r);

    drawScale();
    drawAllPoints();
}

function drawAxes() {
    ctx.save();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(40, CONFIG.center);
    ctx.lineTo(CONFIG.size - 40, CONFIG.center);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(CONFIG.center, 40);
    ctx.lineTo(CONFIG.center, CONFIG.size - 40);
    ctx.stroke();

    ctx.fillStyle = '#333';

    ctx.beginPath();
    ctx.moveTo(CONFIG.size - 40, CONFIG.center);
    ctx.lineTo(CONFIG.size - 50, CONFIG.center - 5);
    ctx.lineTo(CONFIG.size - 50, CONFIG.center + 5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(CONFIG.center, 40);
    ctx.lineTo(CONFIG.center - 5, 50);
    ctx.lineTo(CONFIG.center + 5, 50);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawAreas(r) {
    const rPx = r * CONFIG.scale;
    const halfR = rPx / 2;

    ctx.save();
    ctx.globalAlpha = 0.5;

    ctx.fillStyle = '#2196F3';
    ctx.fillRect(CONFIG.center - halfR, CONFIG.center - rPx, halfR, rPx);

    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.arc(CONFIG.center, CONFIG.center, halfR, Math.PI / 2, Math.PI);
    ctx.lineTo(CONFIG.center, CONFIG.center);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.moveTo(CONFIG.center, CONFIG.center);
    ctx.lineTo(CONFIG.center + halfR, CONFIG.center);
    ctx.lineTo(CONFIG.center, CONFIG.center + rPx);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawScale() {
    ctx.save();
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].forEach(factor => {
        const px = factor * CONFIG.scale;
        const label = factor === 1 ? 'R' : factor === -1 ? '-R' : `${factor}R`;

        const x = CONFIG.center + px;
        if (x >= 80 && x <= CONFIG.size - 80) {
            ctx.fillText(label, x, CONFIG.center + 25);
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, CONFIG.center - 5);
            ctx.lineTo(x, CONFIG.center + 5);
            ctx.stroke();
        }

        const y = CONFIG.center - px;
        if (y >= 80 && y <= CONFIG.size - 80) {
            ctx.fillText(label, CONFIG.center - 35, y);
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(CONFIG.center - 5, y);
            ctx.lineTo(CONFIG.center + 5, y);
            ctx.stroke();
        }
    });

    ctx.font = 'bold 16px Arial';
    ctx.fillText('X', CONFIG.size - 30, CONFIG.center - 20);
    ctx.fillText('Y', CONFIG.center + 20, 30);
    ctx.fillText('0', CONFIG.center - 20, CONFIG.center + 20);

    ctx.restore();
}

function drawAllPoints() {
    points.forEach(({ x, y, hit }) => {
        if (typeof x === 'number' && typeof y === 'number') drawPoint(x, y, hit);
    });
}

function drawPoint(x, y, hit) {
    const pixelX = CONFIG.center + x * CONFIG.scale;
    const pixelY = CONFIG.center - y * CONFIG.scale;

    ctx.save();
    ctx.fillStyle = hit ? '#4CAF50' : '#f44336';
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
}

function handleCanvasClick(event) {
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;

    const mathX = (canvasX - CONFIG.center) / CONFIG.scale;
    const mathY = -(canvasY - CONFIG.center) / CONFIG.scale;

    if (mathX < -2 || mathX > 2) {
        window.showModal?.('Ошибка', 'X должен быть в диапазоне [-2; 2]');
        return;
    }

    if (mathY <= -3 || mathY >= 5) {
        window.showModal?.('Ошибка', 'Y должен быть в интервале (-3; 5)');
        return;
    }

    const preciseX = mathX.toString().substring(0, 100);
    const preciseY = mathY.toString().substring(0, 100);

    window.fillFormFromCanvas?.(preciseX, preciseY);
}

function addPointToCanvas(x, y, hit, r) {
    if (typeof x === 'number' && typeof y === 'number') {
        points.push({ x, y, hit, r });
        setTimeout(drawCoordinatePlane, 10);
    }
}

function removePointFromCanvas(x, y) {
    points = points.filter(p => !(Math.abs(p.x - x) < 0.001 && Math.abs(p.y - y) < 0.001));
    drawCoordinatePlane();
}

Object.assign(window, {
    drawCoordinatePlane,
    addPointToCanvas,
    clearCanvas: () => { points = []; drawCoordinatePlane(); },
    clearAllPoints: () => { points = []; drawCoordinatePlane(); },
    removePointFromCanvas,
    getAllPoints: () => [...points],
    currentR: window.currentR
});