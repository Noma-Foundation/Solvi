
export class EventList {
    #events;

    constructor() {
        this.#events = new Map();
    }

    addEvent(eventName, callback) {
    }

    removeEvent(eventName) {
    }

    getAllEvents() {
        return this.#events;
    }

    clearAllEvents() {
        // Clear all events by removing all entries from the map.
        // Reset the EventList to its initial empty state
    }

}