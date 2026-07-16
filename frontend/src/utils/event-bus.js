import { EventList } from "../collections/event-list.js";
import { History } from "../collections/history.js";

export class EventBus {
    #maxHistorySize = 50;
    #eventList;
    #history;

    /**
     * @param {Number} maxHistorySize 
     */
    constructor(maxHistorySize = 20) {
        this.#maxHistorySize = maxHistorySize;
        this.#eventList = new EventList();
        this.#history = new History(this.#maxHistorySize);
    }

    /**
     * This function is responsible for registering a callback for a specific event. It performs
     * a verification to ensure the event is valid, then registers the event in the events history.
     * 
     * @param {String} eventName 
     * @param {Function} callback 
     */
    subscribe(eventName, callback) {
        return callbackArgs;
    }

    unsubscribe(eventName, callback) {
        // Remove the callback function from the event 
        // Check if the event name exists and callback function 
    }

    publishAsync(eventName, data) {
        // If the event exists, add the callback to a queue to be executed asynchronously
    }

    /**
     * Clear all events and history from the EventBus
     */
    clearEventBus() {
        this.#eventList.clearAllEvents();
        this.#history.clearHistory();
    }

    #dispatch(eventName, data) {
        // If the event exists, iterate over the callbacks and execute them
    }

    getHistory() {
        // Return the history of all events
        return this.#history.getHistory();
    }

    getEvent(eventName) {
        // Check if the event already exists
        // Return the event
    }

    /**
     * @returns {Map<string, Array<Function>>} - Return the map of all events.
     */
    getAllEvents() {
        // Return all events
        return this.#eventList.getAllEvents();
    }

}
