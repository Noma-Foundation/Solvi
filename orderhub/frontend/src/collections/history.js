
export class History {
    #events;
    #maxSize;
    /**
     * @type {Number} - Current length of the history.
     */
    length;

    /**
     * Initialize a new instance of `History`. `History` is a class that is used to 
     * store events in a queue. This class is used internally by the `EventBus`
     * 
     * @param {Number} maxSize - Set maximum number of events to store. 
     * @constructs
     */
    constructor(maxSize) {
        this.#events = [];
        this.#maxSize = Number.isInteger(maxSize) ? Math.abs(maxSize) : 20;
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
            this.#removeOldestEvent();
        }
        this.#events.push(event);
        this.length++;
        return event;
    }

    /**
     * Remove and return the first event pushed into the history.
     * Return null if the history is empty. This function works as FIFO (First-In, First-Out)
     * 
     * @returns {String | Event | null} - The event that was popped. 
     */
    shiftEvent() {
        if (!this.isEmpty()) {
            this.length--;
            return this.#events.shift();
        }
        return null;
    }

    /**
     * Clear history and all events.
     * 
     * @example
     * const myHistory = new History(5);
     * myHistory.pushEvent("Event 1");
     * myHistory.pushEvent("Event 2");
     * myHistory.clearHistory();
     * console.log(myHistory.getHistory()); // []
     * 
     * @returns {void}
     */
    clearHistory() {
        this.#events = [];
        this.length = 0;
    }

    /**
     * @returns {Boolean} - Return true value if the history is empty.
     */
    isEmpty() {
        return this.length <= 0;
    }

    /**
     * @returns {Boolean} - Return true value if the history is full.
     */
    isFull() {
        return this.length >= this.#maxSize;
    }

    /**
     * @returns {Array} - The list of events. 
     */
    getHistory() {
        return this.#events.slice();
    }

    /**
     * Returns the maximum number of events the history can store.
     * 
     * @returns {Number} - The maximum number of events the history can store. 
     */
    getMaxSize() {
        return this.#maxSize;
    }

    #removeOldestEvent() {
        this.#events.shift();
        this.length--;
    }
}
