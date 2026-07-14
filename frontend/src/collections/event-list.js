
export class EventList {
    #events;

    /**
     * Initialize the EventList, creating an empty map to store events. 
     * Each event map stores the event name as the key and a list of callback functions as the value.
     */
    constructor() {
        this.#events = new Map();
    }

    /**
     * Adds event to the event list. Each event is stored in a map, where the key is the event name and
     * the value is a list of callback functions associated with that event.
     * 
     * @example
     * let eventList = new EventList();
     * eventList.addEvent("login", () => { console.log("User logged in"); }); // Addition of a callback function to the "login" event
     * 
     * @param {*} eventName 
     * @param {*} callback 
     */
    addEvent(eventName, callback) {
    }

    /**
     * Removes an event from the event list based on the provided event name. If the event exists, it is removed from the map.
     * Otherwise, no action is taken and the system log will indicate that the event was not found.
     * 
     * @param {*} eventName 
     */
    removeEvent(eventName) {
    }

    /**
     * Get all events stored in the EventList.
     * 
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