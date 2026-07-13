
export class EventList {
    #events;

    /**
     * Initialize the EventList, creating an empty map to store events.
     */
    constructor() {
        this.#events = new Map();
    }

    /**
     * 
     * @param {*} eventName 
     * @param {*} callback 
     */
    addEvent(eventName, callback) {
    }

    /**
     * 
     * @param {*} eventName 
     */
    removeEvent(eventName) {
    }

    /**
     * Get all events stored in the EventList.
     * @returns {Map<String, Function>} Returns a copy of the events map.
     */
    getAllEvents() {
        return new Map(this.#events);
    }

    /**
     * Clear all events stored in the EventList, restoring it to its initial empty state.
     */
    clearAllEvents() {
        this.#events.clear();
    }

}