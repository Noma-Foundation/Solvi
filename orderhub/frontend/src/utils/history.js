
export class History {
    #events;
    #maxSize;
    length;

    /**
     * @param {Number} maxSize - Set maximum number of events to store. 
     */
    constructor(maxSize) {
        this.#events = [];
        this.#maxSize = Math.abs(maxSize);
        this.length = 0;
    }

    pushEvent(eventName) {
        this.length++;
    }

    popEvent() {
    }

    clearHistory() {
    }

    isEmpty() {
        return this.length === 0;
    }

    isFull() {
        return this.length === this.#maxSize;
    }

    /**
     * Returns a shallow copy of the events list to prevent external modification.
     * @returns {Array} - The list of events. 
     */
    getHistory() {
        return [...this.#events];
    }

    /**
     * Returns the maximum number of events the history can store.
     * @returns {Number} - The maximum number of events the history can store. 
     */
    getMaxSize() {
        return this.#maxSize;
    }

}
