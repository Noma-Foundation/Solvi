
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

<<<<<<< HEAD
    pushEvent(eventName) {
        if (this.isFull()) return null;
=======
    pushEvent(event) {
        if (this.isFull()) {
            return null;
        }
        this.#events.push(event);
>>>>>>> 606d258699167ce31d1381b61925e03e4fb9b637
        this.length++;
        return event;
    }

    popEvent() {
<<<<<<< HEAD
        if (this.isEmpty()) return null;
        this.length--;
=======
        if (!this.isEmpty()) {
            this.length--;
            return this.#events.pop();
        }
        return null;
>>>>>>> 606d258699167ce31d1381b61925e03e4fb9b637
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
