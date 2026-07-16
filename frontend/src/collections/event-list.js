// import { LogError } from "../../wailsjs/runtime/runtime.js";


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
     * @param {String} eventName 
     * @param {Function | Event} callback 
     * 
     * @returns {any} Return the return value of the callback function if it exists, otherwise return null.
     */
    addEvent(eventName, callback) {
        const checker = this.#checkIfCallbackIsFunctionOrClass(callback);
        if (checker == null) {
            return null;
        }

        const existingCallbacks = this.#events.get(eventName) ?? [];
        const callbacks = Array.isArray(existingCallbacks) ? existingCallbacks : [existingCallbacks];
        callbacks.push(callback);
        this.#events.set(eventName, callbacks);

        let result = this.#executeCallback(callback);
        return result === undefined ? null : result;
    }

    /**
     * Removes an event from the event list based on the provided event name. If the event exists, it is removed from the map.
     * Otherwise, no action is taken and the system log will indicate that the event was not found.
     * 
     * @param {String} eventName 
     * 
     * @returns {Boolean} Return true if the event was deleted, otherwise return false.
     */
    removeEvent(eventName) {
        if (this.#events.has(eventName)) {
            return this.#events.delete(eventName); // Always return true
        }
        // LogError("The event name provided does not exist");
        return false;
    }

    /**
     * Get event by name
     * 
     * @param {String} eventName
     *  
     * @returns {Function[]} Returns the array of callback functions.
     */
    getEventByName(eventName) {
        const event = this.#events.get(eventName);
        return event !== undefined ? event : null;
    }

    /**
     * Clear all events stored in the EventList, restoring it to its initial empty state.
     */
    clearEvents() {
        this.#events.clear();
    }

    /**
     * @returns {Number} Return the size of the event list.
     */
    get length() {
        return this.#events.size;
    }

    #checkIfCallbackIsFunctionOrClass(callback) {
        if (typeof callback !== "function" && typeof callback !== "object") {
            // LogError(`Event callback must be a function, not a ${typeof callback}`);
            return null;
        }
        return callback;
    }

    #executeCallback(callback) {
        let result;
        if (typeof callback === "function") {
            result = callback();
        } else if (callback && typeof callback.execute === "function") {
            result = callback.execute();
        }
        return result;
    }

}
