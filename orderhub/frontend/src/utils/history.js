
export class History {
    #events;
    #maxSize;

    /**
     * @param {Number} maxSize - Set maximum number of events to store. 
     */
    constructor(maxSize) {
        this.#events = [];
        this.#maxSize = Math.abs(maxSize);
    }

    pushEvent(eventName) {
    }

    popEvent() {
    }

    clearHistory() {
    }

    isEmpty() {
    }

    isFull() {
    }

    getHistory() {
        return this.#events;
    }

    getMaxSize() {
        return this.#maxSize;
    }

}
