export class CanvasManager {
    #canvas;
    #ctx;
    #canvasSize = 600;
    #center = 300;
    #baseScale = 50;
    #points = [];

    constructor(canvasId) {
        this.#canvas = document.getElementById(canvasId);
        if (!this.#canvas) throw new Error('Canvas element not found');
        this.#ctx = this.#canvas.getContext('2d');
        if (!this.#ctx) throw new Error('Could not get canvas context');
    }

    getContext() {
        return this.#ctx;
    }

    getCanvasSize() {
        return this.#canvasSize;
    }

    getCenter() {
        return this.#center;
    }

    getScale() {
        return this.#baseScale;
    }

    getPoints() {
        return [...this.#points];
    }

    addPoint(x, y, hit, r) {
        if (typeof x !== 'number' || typeof y !== 'number') {
            console.error('Invalid point coordinates');
            return;
        }
        this.#points.push({ x, y, hit, r });
    }

    removePoint(x, y) {
        this.#points = this.#points.filter(point => !(Math.abs(point.x - x) < 0.001 && Math.abs(point.y - y) < 0.001));
    }

    clearPoints() {
        this.#points = [];
    }

    setScale(newScale) {
        if (newScale > 0) {
            this.#baseScale = newScale;
        }
    }

    resizeCanvas(newSize) {
        if (newSize > 0) {
            this.#canvasSize = newSize;
            this.#center = newSize / 2;
            this.#canvas.width = newSize;
            this.#canvas.height = newSize;
        }
    }
}