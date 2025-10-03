import { CanvasManager } from './CanvasManager.js';
import { CanvasRenderer } from './CanvasRenderer.js';
import { FormManager } from './FormManager.js';
import { ServerCommunicator } from './ServerCommunicator.js';
import { TableManager } from './TableManager.js';
import { ModalManager } from './ModalManager.js';
import { StorageManager } from './StorageManager.js';

class App {
    #canvasManager;
    #canvasRenderer;
    #formManager;
    #serverCommunicator;
    #tableManager;
    #modalManager;
    #storageManager;

    constructor() {
        this.#canvasManager = new CanvasManager('coordinatePlane');
        this.#canvasRenderer = new CanvasRenderer(this.#canvasManager);
        this.#serverCommunicator = new ServerCommunicator();
        this.#tableManager = new TableManager('results-body', 'empty-state');
        this.#modalManager = new ModalManager('error-modal', 'confirm-modal');
        this.#storageManager = new StorageManager();
        this.#formManager = new FormManager(
            'coordinateForm',
            '.x-btn',
            'y-input',
            'input[name="r"]',
            data => this.#handleSubmit(data),
            () => this.#modalManager.showConfirmModal('Очистить все результаты?', 'Это действие нельзя отменить', () => this.#clearResults())
        );

        this.#initialize();
    }

    #initialize() {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                this.#canvasRenderer.drawCoordinatePlane(this.#formManager.getSelectedR());
                this.#canvasManager.getContext().canvas.addEventListener('click', e => this.#handleCanvasClick(e));
                this.#loadStoredResults();
            }, 200);
        });

        // Expose global functions for compatibility
        window.currentR = () => this.#formManager.getSelectedR();
        window.addPointFromCanvas = (x, y) => this.#addPointFromCanvas(x, y);
        window.drawCoordinatePlane = () => this.#canvasRenderer.drawCoordinatePlane(this.#formManager.getSelectedR());
        window.addPointToCanvas = (x, y, hit, r) => this.#canvasManager.addPoint(x, y, hit, r);
        window.clearCanvas = () => this.#canvasManager.clearPoints();
        window.clearAllPoints = () => this.#canvasManager.clearPoints();
        window.removePointFromCanvas = (x, y) => this.#canvasManager.removePoint(x, y);
        window.getAllPoints = () => this.#canvasManager.getPoints();
        window.setScale = scale => this.#canvasManager.setScale(scale);
        window.resizeCanvas = size => this.#canvasManager.resizeCanvas(size);
    }

    #handleCanvasClick(event) {
        const rect = this.#canvasManager.getContext().canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const scale = this.#canvasManager.getScale();
        const mathX = (x - this.#canvasManager.getCenter()) / scale;
        const mathY = -(y - this.#canvasManager.getCenter()) / scale;
        let preciseX = mathX.toString();
        let preciseY = mathY.toString();
        if (preciseX.length > 30) preciseX = preciseX.substring(0, 30);
        if (preciseY.length > 30) preciseY = preciseY.substring(0, 30);
        this.#addPointFromCanvas(preciseX, preciseY);
    }

    #addPointFromCanvas(x, y) {
        const r = this.#formManager.getSelectedR();
        if (!r) {
            this.#modalManager.showErrorModal('Выберите значение R');
            return;
        }
        if (!/^-?\d+\.?\d*$/.test(x) || !/^-?\d+\.?\d*$/.test(y)) {
            this.#modalManager.showErrorModal('X и Y должны быть числами');
            return;
        }
        this.#serverCommunicator.sendData(
            x, y, r, true,
            data => {
                if (data.error) {
                    this.#modalManager.showErrorModal('Ошибка сервера: ' + data.error);
                    return;
                }
                this.#tableManager.addResult(data);
                this.#storageManager.saveResult(data);
                this.#canvasManager.addPoint(parseFloat(data.x), parseFloat(data.y), data.hit, parseFloat(data.r));
                this.#canvasRenderer.drawCoordinatePlane(r);
            },
            error => this.#modalManager.showErrorModal(error),
            () => {}
        );
    }

    #handleSubmit(data) {
        if (!data) {
            this.#modalManager.showErrorModal('Пожалуйста, исправьте ошибки в форме');
            return;
        }
        this.#serverCommunicator.sendData(
            data.x, data.y, data.r, false,
            response => {
                if (response.error) {
                    this.#modalManager.showErrorModal('Ошибка сервера: ' + response.error);
                    return;
                }
                this.#tableManager.addResult(response);
                this.#storageManager.saveResult(response);
                this.#canvasManager.addPoint(parseFloat(response.x), parseFloat(response.y), response.hit, parseFloat(response.r));
                this.#canvasRenderer.drawCoordinatePlane(data.r);
                this.#formManager.clearForm();
            },
            error => this.#modalManager.showErrorModal(error),
            () => this.#modalManager.hideErrorModal()
        );
    }

    #loadStoredResults() {
        const results = this.#storageManager.loadResults();
        if (results.length === 0) {
            this.#tableManager.clearResults();
            return;
        }
        results.forEach(data => {
            this.#tableManager.addResult(data);
            this.#canvasManager.addPoint(parseFloat(data.x), parseFloat(data.y), data.hit, parseFloat(data.r));
        });
        this.#canvasRenderer.drawCoordinatePlane(this.#formManager.getSelectedR());
    }

    #clearResults() {
        this.#tableManager.clearResults();
        this.#storageManager.clearStorage();
        this.#canvasManager.clearPoints();
        this.#canvasRenderer.drawCoordinatePlane(this.#formManager.getSelectedR());
    }
}

new App();