
export class EventBus {
    #events;
    #history;

    constructor() {
        this.#events = new Map();
        this.#history = new Map();
    }

    subscribe(eventName, callback) {
        // If the event exists, add the callback function to the array of callbacks for that event
    }

    unsubscribe(eventName, callback) {
        // Remove the callback function from the event 
        // Check if the event name exists and callback function 
    }

    publishAsync(eventName, data) {
        // If the event exists, add the callback to a queue to be executed asynchronously
    }

    dispatch(eventName, data) {
        // If the event exists, iterate over the callbacks and execute them
    }

    clearAllEvents() {
        // Clear all events by removing all entries from the map.  
    }

    getHistory() {
        // Return the history of all events
        return this.#history;
    }

    getEvent(eventName) {
        // Check if the event already exists
        // Return the event
        return this.#events.get(eventName);
    }

    /**
     * @returns {Map<string, Array<Function>>} - Return the map of all events.
     */
    getAllEvents() {
        // Return all events
        return this.#events;
    }

}
