import { History } from "./collections/history.js"
import { EventList } from "./event-list.js";

export class EventBus {
    #eventList;
    #history;

    constructor() {
        const maxHistorySize = 20;

        this.#eventList = new EventList();
        this.#history = new History(maxHistorySize);
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

    /**
     * Clear all events and history from the EventBus
     */
    clearEventBus() {
        this.#eventList.clearAllEvents();
        this.#history.clearHistory();
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
