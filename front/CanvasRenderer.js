export class CanvasRenderer {
    #manager;

    constructor(canvasManager) {
        this.#manager = canvasManager;
    }

    drawCoordinatePlane(r) {
        const ctx = this.#manager.getContext();
        if (!ctx) {
            console.error('Canvas context not available');
            return;
        }

        ctx.clearRect(0, 0, this.#manager.getCanvasSize(), this.#manager.getCanvasSize());
        this.#drawPurpleBackground();
        this.#drawBeautifulFrame();
        this.#drawAxes();
        if (r && r > 0) this.#drawAreas(r);
        this.#drawCleanScale();
        this.#drawAllPoints();
    }

    #drawPurpleBackground() {
        const ctx = this.#manager.getContext();
        const canvasSize = this.#manager.getCanvasSize();
        if (!ctx) return;

        const purpleGradient = ctx.createRadialGradient(
            canvasSize * 0.3, canvasSize * 0.3, 0,
            canvasSize * 0.7, canvasSize * 0.7, canvasSize * 0.9
        );
        purpleGradient.addColorStop(0, 'rgba(147,112,219,0.1)');
        purpleGradient.addColorStop(0.4, 'rgba(138,43,226,0.1)');
        purpleGradient.addColorStop(0.7, 'rgba(123,104,238,0.1)');
        purpleGradient.addColorStop(1, 'rgba(106,90,205,0.1)');

        ctx.fillStyle = purpleGradient;
        ctx.fillRect(0, 0, canvasSize, canvasSize);

        ctx.save();
        ctx.globalAlpha = 0.06;
        for (let i = 0; i < 8; i++) {
            const x = (canvasSize / 8) * i + Math.sin(i * 0.7) * 35;
            const y = canvasSize * 0.4 + Math.cos(i * 0.8) * 70;
            const waveGradient = ctx.createRadialGradient(x, y, 0, x + 40, y + 25, 90);
            waveGradient.addColorStop(0, 'rgba(186,85,211,0.1)');
            waveGradient.addColorStop(0.5, 'rgba(147,112,219,0.1)');
            waveGradient.addColorStop(1, 'rgba(138,43,226,0.1)');

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
            const dropGradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
            dropGradient.addColorStop(0, 'rgba(221,160,221,0.2)');
            dropGradient.addColorStop(0.5, 'rgba(186,85,211,0.1)');
            dropGradient.addColorStop(1, 'rgba(147, 112, 219, 0.1)');

            ctx.fillStyle = dropGradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    #drawBeautifulFrame() {
        const ctx = this.#manager.getContext();
        const canvasSize = this.#manager.getCanvasSize();
        if (!ctx) return;

        const outerPadding = 25;
        const innerPadding = 35;
        const borderRadius = 20;

        ctx.save();
        ctx.shadowColor = 'rgba(75,0,130,0.1)';
        ctx.shadowBlur = 25;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 8;

        ctx.beginPath();
        ctx.roundRect(outerPadding, outerPadding, canvasSize - 2 * outerPadding, canvasSize - 2 * outerPadding, borderRadius);
        const outerGradient = ctx.createLinearGradient(0, outerPadding, 0, canvasSize - outerPadding);
        outerGradient.addColorStop(0, 'rgba(186, 85, 211, 0.25)');
        outerGradient.addColorStop(0.5, 'rgba(147, 112, 219, 0.2)');
        outerGradient.addColorStop(1, 'rgba(138, 43, 226, 0.15)');

        ctx.fillStyle = outerGradient;
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        const borderGradient = ctx.createLinearGradient(0, outerPadding, 0, canvasSize - outerPadding);
        borderGradient.addColorStop(0, 'rgba(221, 160, 221, 0.6)');
        borderGradient.addColorStop(0.5, 'rgba(186, 85, 211, 0.4)');
        borderGradient.addColorStop(1, 'rgba(147, 112, 219, 0.5)');

        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.roundRect(innerPadding, innerPadding, canvasSize - 2 * innerPadding, canvasSize - 2 * innerPadding, borderRadius - 5);
        const innerGradient = ctx.createLinearGradient(0, innerPadding, 0, canvasSize - innerPadding);
        innerGradient.addColorStop(0, 'rgba(147, 112, 219, 0.08)');
        innerGradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.06)');
        innerGradient.addColorStop(1, 'rgba(123, 104, 238, 0.04)');

        ctx.fillStyle = innerGradient;
        ctx.fill();

        const innerBorderGradient = ctx.createLinearGradient(0, innerPadding, 0, canvasSize - innerPadding);
        innerBorderGradient.addColorStop(0, 'rgba(221, 160, 221, 0.4)');
        innerBorderGradient.addColorStop(0.5, 'rgba(186, 85, 211, 0.2)');
        innerBorderGradient.addColorStop(1, 'rgba(147, 112, 219, 0.3)');

        ctx.strokeStyle = innerBorderGradient;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }

    #drawAxes() {
        const ctx = this.#manager.getContext();
        const canvasSize = this.#manager.getCanvasSize();
        const center = this.#manager.getCenter();
        if (!ctx) return;

        ctx.save();
        const axisGradient = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
        axisGradient.addColorStop(0, 'rgba(75, 0, 130, 0.7)');
        axisGradient.addColorStop(0.5, 'rgba(106, 90, 205, 0.8)');
        axisGradient.addColorStop(1, 'rgba(72, 61, 139, 0.7)');

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

        ctx.fillStyle = 'rgba(75, 0, 130, 0.8)';
        const arrowSize = 10;

        ctx.beginPath();
        ctx.moveTo(canvasSize - 60, center);
        ctx.lineTo(canvasSize - 60 - arrowSize, center - arrowSize / 2);
        ctx.lineTo(canvasSize - 60 - arrowSize, center + arrowSize / 2);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(center, 60);
        ctx.lineTo(center - arrowSize / 2, 60 + arrowSize);
        ctx.lineTo(center + arrowSize / 2, 60 + arrowSize);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    #drawAreas(r) {
        const ctx = this.#manager.getContext();
        const center = this.#manager.getCenter();
        const baseScale = this.#manager.getScale();
        if (!ctx || !r || r <= 0) return;

        const rPixels = r * baseScale;
        const halfRPixels = rPixels / 2;

        ctx.save();
        ctx.globalAlpha = 0.4;

        ctx.fillStyle = 'rgba(0, 123, 255, 0.8)';
        ctx.fillRect(center - halfRPixels, center - rPixels, halfRPixels, rPixels);

        ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(center, center, halfRPixels, Math.PI / 2, Math.PI, false);
        ctx.lineTo(center, center);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'rgba(40, 167, 69, 0.8)';
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.lineTo(center + halfRPixels, center);
        ctx.lineTo(center, center + rPixels);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 3;

        ctx.strokeStyle = 'rgb(0, 123, 255)';
        ctx.strokeRect(center - halfRPixels, center - rPixels, halfRPixels, rPixels);

        ctx.strokeStyle = 'rgb(255, 165, 0)';
        ctx.beginPath();
        ctx.arc(center, center, halfRPixels, Math.PI / 2, Math.PI, false);
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

    #drawCleanScale() {
        const ctx = this.#manager.getContext();
        const canvasSize = this.#manager.getCanvasSize();
        const center = this.#manager.getCenter();
        const scale = this.#manager.getScale();
        if (!ctx) return;

        ctx.save();
        ctx.fillStyle = 'rgba(75, 0, 130, 0.8)';
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
                ctx.strokeStyle = 'rgba(106, 90, 205, 0.6)';
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
                ctx.strokeStyle = 'rgba(106, 90, 205, 0.6)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(center - 8, y);
                ctx.lineTo(center + 8, y);
                ctx.stroke();
            }
        });

        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = 'rgba(72, 61, 139, 0.9)';
        ctx.fillText('X', canvasSize - 50, center - 20);
        ctx.fillText('Y', center + 20, 50);
        ctx.fillText('0', center - 25, center + 25);
        ctx.restore();
    }

    #drawAllPoints() {
        const ctx = this.#manager.getContext();
        const points = this.#manager.getPoints();
        if (!ctx || !points.length) return;

        points.forEach(point => {
            if (typeof point.x === 'number' && typeof point.y === 'number') {
                this.#drawSinglePoint(point.x, point.y, point.hit);
            }
        });
    }

    #drawSinglePoint(x, y, hit) {
        const ctx = this.#manager.getContext();
        const center = this.#manager.getCenter();
        const scale = this.#manager.getScale();
        if (!ctx) return;

        const pixelX = center + x * scale;
        const pixelY = center - y * scale;

        ctx.save();
        ctx.shadowColor = hit ? 'rgba(34, 139, 34, 0.4)' : 'rgba(220, 20, 60, 0.4)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;

        const gradient = ctx.createRadialGradient(pixelX - 3, pixelY - 3, 0, pixelX, pixelY, 12);
        if (hit) {
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(0.3, 'rgba(50, 205, 50, 0.9)');
            gradient.addColorStop(0.7, 'rgba(34, 139, 34, 0.95)');
            gradient.addColorStop(1, 'rgba(0, 100, 0, 0.8)');
        } else {
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(0.3, 'rgba(255, 69, 0, 0.9)');
            gradient.addColorStop(0.7, 'rgba(220, 20, 60, 0.95)');
            gradient.addColorStop(1, 'rgba(139, 0, 0, 0.8)');
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
}