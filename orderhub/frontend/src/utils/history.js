
export class History {
    #events;
    #maxSize;
    length;

    /**
     * Initialize a new instance of `History`.
     * 
     * @param {Number} maxSize - Set maximum number of events to store. 
     */
    constructor(maxSize) {
        this.#events = [];
        this.#maxSize = Math.abs(maxSize);
        this.length = 0;
    }

    /**
     * Push events into the history. If the queue is full, the oldest event is removed to
     * make room for the new one. Push always happens.
     * 
     * @param {String | Event} event - Can be a String or Event object of the event to be pushed. 
     * @returns {String | Event} - The event that was pushed. 
     */
    pushEvent(event) {
        if (this.isFull()) {
            return null;
        }
        this.#events.push(event);
        this.length++;
        return event;
    }

    /**
     * Remove and return the last event pushed into the history.
     * Return null if the history is empty.
     * 
     * @returns {String | Event | null} - The event that was popped. 
     */
    popEvent() {
        if (!this.isEmpty()) {
            this.length--;
            return this.#events.shift();
        }
        return null;
    }

    /**
     * Clear history and all events.
     */
    clearHistory() {
        this.#events = [];
        this.length = 0;
    }

    isEmpty() {
        return this.length === 0;
    }

    isFull() {
        return this.length === this.#maxSize;
    }

    /**
     * @returns {Array} - The list of events. 
     */
    getHistory() {
        return this.#events;
    }

    /**
     * Returns the maximum number of events the history can store.
     * @returns {Number} - The maximum number of events the history can store. 
     */
    getMaxSize() {
        return this.#maxSize;
    }

}
