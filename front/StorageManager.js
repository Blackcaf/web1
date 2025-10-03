export class StorageManager {
    #key = 'web1_results';

    saveResult(data) {
        try {
            let results = JSON.parse(localStorage.getItem(this.#key) || '[]');
            results.unshift(data);
            if (results.length > 50) results = results.slice(0, 50);
            localStorage.setItem(this.#key, JSON.stringify(results));
        } catch (e) {
            console.error('Error saving to storage:', e);
        }
    }

    loadResults() {
        try {
            return JSON.parse(localStorage.getItem(this.#key) || '[]');
        } catch (e) {
            console.error('Error loading from storage:', e);
            return [];
        }
    }

    clearStorage() {
        localStorage.removeItem(this.#key);
    }
}