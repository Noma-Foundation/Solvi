import { EventList } from "../collections/event-list.js";
import { History } from "../collections/history.js";

/**
 * EventBus handles decoupled communication between components via the Publish-Subscribe pattern.
 * It manages event registration, synchronous and asynchronous dispatching, and maintains subscription history.
 */
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
     * Register a callback for a specific event. The listener is registered immediately
     * and an unsubscribe function is returned.
     * 
     * @param {String} eventName 
     * @param {Function|Object} callback 
     * @returns {Function} unsubscribe - call to remove this listener
     */
    subscribe(eventName, callback) {
        if (typeof eventName !== "string") {
            throw new Error("Event name must be a string");
        }

        if (typeof callback !== "function" && typeof callback !== "object") {
            throw new Error("Callback must be a function or an object with an execute method");
        }

        if (callback && typeof callback.execute === "function") {
            if (callback.execute.length > 0) {
                throw new Error("Event.execute must not receive arguments");
            }
        }

        this.#eventList.addEvent(eventName, callback);
        this.#history.pushEvent(eventName);

        return () => this.unsubscribe(eventName, callback);
    }

    /**
     * Unsubscribe a callback from a specific event.
     * If no callback is provided, all listeners for the event are removed.
     * 
     * @param {String} eventName - The name of the event
     * @param {Function|Object|null} [callback=null] - The specific callback to remove
     * @returns {Boolean} True if successfully unsubscribed, false otherwise
     */
    unsubscribe(eventName, callback = null) {
        if (callback === null) {
            return this.#eventList.removeEvent(eventName);
        }

        const callbacks = this.#eventList.getEventByName(eventName);
        if (!callbacks) return false;

        const filtered = callbacks.filter(cb => cb !== callback);
        if (filtered.length === 0) {
            return this.#eventList.removeEvent(eventName);
        }

        // Re-set the event with filtered callbacks (use internal API addEvent to overwrite)
        // First clear the event, then re-add each callback
        this.#eventList.removeEvent(eventName);
        filtered.forEach(cb => this.#eventList.addEvent(eventName, cb));
        return true;
    }

    /**
     * Publish an event asynchronously. Callbacks will be executed in the next tick.
     * Errors thrown by individual callbacks will be caught and ignored.
     * 
     * @param {String} eventName - The name of the event to publish
     * @param {any} data - The data payload to pass to the callbacks
     * @returns {Boolean|null} True if callbacks were found and executed, null if event list is empty
     */
    publishAsync(eventName, data) {
        // Execute callbacks asynchronously
        const callbacks = this.#eventList.getEventByName(eventName);
        if (!callbacks) return null;

        callbacks.forEach(cb => {
            setTimeout(() => {
                if (typeof cb === "function") {
                    try { cb(data); } catch (e) { /* swallow errors */ }
                } else if (cb && typeof cb.execute === "function") {
                    try { cb.execute(data); } catch (e) { /* swallow errors */ }
                }
            }, 0);
        });

        return true;
    }

    /**
     * Clear all registered events and reset the subscription history.
     */
    clearEventBus() {
        if (typeof this.#eventList.clearEvents === "function") {
            this.#eventList.clearEvents();
        } else if (typeof this.#eventList.clearAllEvents === "function") {
            this.#eventList.clearAllEvents();
        }
        this.#history.clearHistory();
    }

    /**
     * Dispatch an event synchronously and collect return values of all callbacks.
     * Errors thrown by individual callbacks will result in a null value in the return array.
     * 
     * @param {String} eventName - The name of the event to dispatch
     * @param {any} data - The data payload to pass to the callbacks
     * @returns {Array|null} Array of return values from callbacks, null if event list is empty
     */
    dispatch(eventName, data) {
        const callbacks = this.#eventList.getEventByName(eventName);
        if (!callbacks) return null;

        const results = [];
        callbacks.forEach(cb => {
            try {
                if (typeof cb === "function") {
                    results.push(cb(data));
                } else if (cb && typeof cb.execute === "function") {
                    results.push(cb.execute(data));
                }
            } catch (e) {
                results.push(null);
            }
        });

        return results;
    }

    /**
     * Get the subscription event history list.
     * 
     * @returns {Array} List of registered event names in subscription history
     */
    getHistory() {
        return this.#history.getHistory();
    }

    /**
     * Get callbacks registered to a specific event.
     * 
     * @param {String} eventName - The name of the event
     * @returns {Array|undefined} List of callbacks for the event
     */
    getEvent(eventName) {
        return this.#eventList.getEventByName(eventName);
    }

}
