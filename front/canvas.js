let canvas, ctx;
const CONFIG = {
    size: 600,
    center: 300,
    scale: 50,
    padding: { outer: 25, inner: 35 },
    radius: { border: 20, inner: 15 }
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
    drawPurpleBackground();
    drawFrame();
    drawAxes();

    const r = window.currentR?.();
    if (r > 0) drawAreas(r);

    drawScale();
    drawAllPoints();
}

function drawPurpleBackground() {
    const grad = ctx.createRadialGradient(180, 180, 0, 420, 420, 540);
    ['rgba(147,112,219,0.1)', 'rgba(138,43,226,0.1)', 'rgba(123,104,238,0.1)', 'rgba(106,90,205,0.1)']
        .forEach((color, i) => grad.addColorStop(i / 3, color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CONFIG.size, CONFIG.size);

    ctx.save();
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 8; i++) {
        const x = (CONFIG.size / 8) * i + Math.sin(i * 0.7) * 35;
        const y = CONFIG.size * 0.4 + Math.cos(i * 0.8) * 70;
        const waveGrad = ctx.createRadialGradient(x, y, 0, x + 40, y + 25, 90);
        ['rgba(186,85,211,0.1)', 'rgba(147,112,219,0.1)', 'rgba(138,43,226,0.1)']
            .forEach((color, j) => waveGrad.addColorStop(j / 2, color));
        ctx.fillStyle = waveGrad;
        ctx.beginPath();
        ctx.ellipse(x, y, 60 + Math.sin(i) * 12, 30 + Math.cos(i) * 8, i * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 0.04;
    for (let i = 0; i < 12; i++) {
        const [x, y, radius] = [Math.random() * CONFIG.size, Math.random() * CONFIG.size, 20 + Math.random() * 50];
        const dropGrad = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
        ['rgba(221,160,221,0.2)', 'rgba(186,85,211,0.1)', 'rgba(147,112,219,0.1)']
            .forEach((color, j) => dropGrad.addColorStop(j / 2, color));
        ctx.fillStyle = dropGrad;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawFrame() {
    const { outer, inner } = CONFIG.padding;
    const { border, inner: innerRad } = CONFIG.radius;

    ctx.save();
    ctx.shadowColor = 'rgba(75,0,130,0.1)';
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 8;

    ctx.beginPath();
    ctx.roundRect(outer, outer, CONFIG.size - 2 * outer, CONFIG.size - 2 * outer, border);
    const outerGrad = ctx.createLinearGradient(0, outer, 0, CONFIG.size - outer);
    ['rgba(186,85,211,0.25)', 'rgba(147,112,219,0.2)', 'rgba(138,43,226,0.15)']
        .forEach((color, i) => outerGrad.addColorStop(i / 2, color));
    ctx.fillStyle = outerGrad;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    const borderGrad = ctx.createLinearGradient(0, outer, 0, CONFIG.size - outer);
    ['rgba(221,160,221,0.6)', 'rgba(186,85,211,0.4)', 'rgba(147,112,219,0.5)']
        .forEach((color, i) => borderGrad.addColorStop(i / 2, color));
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(inner, inner, CONFIG.size - 2 * inner, CONFIG.size - 2 * inner, innerRad);
    const innerGrad = ctx.createLinearGradient(0, inner, 0, CONFIG.size - inner);
    ['rgba(147,112,219,0.08)', 'rgba(138,43,226,0.06)', 'rgba(123,104,238,0.04)']
        .forEach((color, i) => innerGrad.addColorStop(i / 2, color));
    ctx.fillStyle = innerGrad;
    ctx.fill();

    const innerBorderGrad = ctx.createLinearGradient(0, inner, 0, CONFIG.size - inner);
    ['rgba(221,160,221,0.4)', 'rgba(186,85,211,0.2)', 'rgba(147,112,219,0.3)']
        .forEach((color, i) => innerBorderGrad.addColorStop(i / 2, color));
    ctx.strokeStyle = innerBorderGrad;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
}

function drawAxes() {
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, CONFIG.size, CONFIG.size);
    ['rgba(75,0,130,0.7)', 'rgba(106,90,205,0.8)', 'rgba(72,61,139,0.7)']
        .forEach((color, i) => grad.addColorStop(i / 2, color));

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(60, CONFIG.center);
    ctx.lineTo(CONFIG.size - 60, CONFIG.center);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(CONFIG.center, 60);
    ctx.lineTo(CONFIG.center, CONFIG.size - 60);
    ctx.stroke();

    ctx.fillStyle = 'rgba(75,0,130,0.8)';
    const arrow = [[CONFIG.size - 60, CONFIG.center, CONFIG.size - 70, CONFIG.center - 5, CONFIG.size - 70, CONFIG.center + 5],
        [CONFIG.center, 60, CONFIG.center - 5, 70, CONFIG.center + 5, 70]];
    arrow.forEach(pts => {
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        ctx.lineTo(pts[2], pts[3]);
        ctx.lineTo(pts[4], pts[5]);
        ctx.closePath();
        ctx.fill();
    });

    ctx.restore();
}

function drawAreas(r) {
    const rPx = r * CONFIG.scale;
    const halfR = rPx / 2;

    ctx.save();
    ctx.globalAlpha = 0.4;

    ctx.fillStyle = 'rgba(0,123,255,0.8)';
    ctx.fillRect(CONFIG.center - halfR, CONFIG.center - rPx, halfR, rPx);

    ctx.fillStyle = 'rgba(255,165,0,0.8)';
    ctx.beginPath();
    ctx.arc(CONFIG.center, CONFIG.center, halfR, Math.PI / 2, Math.PI);
    ctx.lineTo(CONFIG.center, CONFIG.center);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(40,167,69,0.8)';
    ctx.beginPath();
    ctx.moveTo(CONFIG.center, CONFIG.center);
    ctx.lineTo(CONFIG.center + halfR, CONFIG.center);
    ctx.lineTo(CONFIG.center, CONFIG.center + rPx);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    ctx.save();
    ctx.lineWidth = 3;

    ctx.strokeStyle = 'rgb(0,123,255)';
    ctx.strokeRect(CONFIG.center - halfR, CONFIG.center - rPx, halfR, rPx);

    ctx.strokeStyle = 'rgb(255,165,0)';
    ctx.beginPath();
    ctx.arc(CONFIG.center, CONFIG.center, halfR, Math.PI / 2, Math.PI);
    ctx.stroke();

    ctx.strokeStyle = 'rgb(40,167,69)';
    ctx.beginPath();
    ctx.moveTo(CONFIG.center, CONFIG.center);
    ctx.lineTo(CONFIG.center + halfR, CONFIG.center);
    ctx.lineTo(CONFIG.center, CONFIG.center + rPx);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
}

function drawScale() {
    ctx.save();
    ctx.fillStyle = 'rgba(75,0,130,0.8)';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].forEach(factor => {
        const px = factor * CONFIG.scale;
        const label = factor === 1 ? 'R' : factor === -1 ? '-R' : `${factor}R`;

        const x = CONFIG.center + px;
        if (x >= 80 && x <= CONFIG.size - 80) {
            ctx.fillText(label, x, CONFIG.center + 30);
            ctx.strokeStyle = 'rgba(106,90,205,0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, CONFIG.center - 8);
            ctx.lineTo(x, CONFIG.center + 8);
            ctx.stroke();
        }

        const y = CONFIG.center - px;
        if (y >= 80 && y <= CONFIG.size - 80) {
            ctx.fillText(label, CONFIG.center - 40, y);
            ctx.strokeStyle = 'rgba(106,90,205,0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(CONFIG.center - 8, y);
            ctx.lineTo(CONFIG.center + 8, y);
            ctx.stroke();
        }
    });

    ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(72,61,139,0.9)';
    ctx.fillText('X', CONFIG.size - 50, CONFIG.center - 20);
    ctx.fillText('Y', CONFIG.center + 20, 50);
    ctx.fillText('0', CONFIG.center - 25, CONFIG.center + 25);

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
    ctx.shadowColor = hit ? 'rgba(34,139,34,0.4)' : 'rgba(220,20,60,0.4)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 3;

    const grad = ctx.createRadialGradient(pixelX - 3, pixelY - 3, 0, pixelX, pixelY, 12);
    const colors = hit
        ? ['rgba(255,255,255,0.9)', 'rgba(50,205,50,0.9)', 'rgba(34,139,34,0.95)', 'rgba(0,100,0,0.8)']
        : ['rgba(255,255,255,0.9)', 'rgba(255,69,0,0.9)', 'rgba(220,20,60,0.95)', 'rgba(139,0,0,0.8)'];
    colors.forEach((color, i) => grad.addColorStop([0, 0.3, 0.7, 1][i], color));

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, 11, 0, 2 * Math.PI);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.arc(pixelX - 3, pixelY - 3, 3, 0, 2 * Math.PI);
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

    const preciseX = mathX.toString().substring(0, 100);
    const preciseY = mathY.toString().substring(0, 100);

    console.log('Click:', { canvasX, canvasY, mathX, mathY });

    window.addPointFromCanvas?.(preciseX, preciseY);
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
    setScale: newScale => { if (newScale > 0) { CONFIG.scale = newScale; drawCoordinatePlane(); } },
    resizeCanvas: newSize => {
        if (newSize > 0) {
            CONFIG.size = newSize;
            CONFIG.center = newSize / 2;
            if (canvas) { canvas.width = newSize; canvas.height = newSize; }
            drawCoordinatePlane();
        }
    },
    currentR: window.currentR
});