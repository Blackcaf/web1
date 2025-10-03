export class TableManager {
    #tableBody;
    #emptyState;

    constructor(tableBodyId, emptyStateId) {
        this.#tableBody = document.getElementById(tableBodyId);
        this.#emptyState = document.getElementById(emptyStateId);
    }

    addResult(data) {
        if (!this.#tableBody) return;
        const row = document.createElement('tr');
        row.className = data.hit ? 'hit' : 'miss';
        const resultText = data.hit ? 'Попадание' : 'Промах';
        const resultClass = data.hit ? 'result-hit' : 'result-miss';
        row.innerHTML = `
            <td>${data.x}</td>
            <td>${data.y}</td>
            <td>${data.r}</td>
            <td class="${resultClass}">${resultText}</td>
            <td>${this.#formatTime(data.currentTime)}</td>
            <td>${data.scriptTimeMs} мс</td>
        `;
        this.#tableBody.insertBefore(row, this.#tableBody.firstChild);
        this.#hideEmptyState();
    }

    clearResults() {
        if (this.#tableBody) this.#tableBody.innerHTML = '';
        this.#showEmptyState();
    }

    #formatTime(timeString) {
        try {
            const date = new Date(timeString);
            return date.toLocaleString('ru-RU');
        } catch (e) {
            return timeString;
        }
    }

    #showEmptyState() {
        if (this.#emptyState) this.#emptyState.style.display = 'block';
    }

    #hideEmptyState() {
        if (this.#emptyState) this.#emptyState.style.display = 'none';
    }
}