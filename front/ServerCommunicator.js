export class ServerCommunicator {
    #baseUrl;

    constructor(baseUrl = '/calculate') {
        this.#baseUrl = baseUrl;
    }

    async sendData(x, y, r, fromCanvas = false, onSuccess, onError, onFinally) {
        const data = { x, y: String(y), r };
        try {
            const response = await fetch(this.#baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            onSuccess(result);
        } catch (error) {
            let errorMessage = 'Ошибка при отправке запроса на сервер';
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Не удается подключиться к серверу. Проверьте, что FastCGI сервер запущен';
            } else if (error.message.includes('500')) {
                errorMessage = 'Внутренняя ошибка сервера';
            } else if (error.message.includes('400')) {
                errorMessage = 'Некорректные данные';
            } else if (error.message.includes('405')) {
                errorMessage = 'Недопустимый метод запроса';
            }
            onError(errorMessage);
        } finally {
            if (!fromCanvas) onFinally();
        }
    }
}