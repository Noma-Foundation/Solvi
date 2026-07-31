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

        // If the callback is an object with an execute method, ensure the execute signature accepts no arguments
        // Keep this validation for backward compatibility with existing tests; you can remove it if you want
        if (callback && typeof callback.execute === "function") {
            if (callback.execute.length > 0) {
                throw new Error("Event.execute must not receive arguments");
            }
        }

        // Register listener immediately and push to history
        this.#eventList.addEvent(eventName, callback);
        this.#history.pushEvent(eventName);

        // Return unsubscribe function
        return () => this.unsubscribe(eventName, callback);
    }

    unsubscribe(eventName, callback = null) {
        // If no callback is provided, remove the whole event
        if (callback === null) {
            return this.#eventList.removeEvent(eventName);
        }

        // If a callback is provided, remove only that callback from the event's callback array
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

    clearEventBus() {
        if (typeof this.#eventList.clearEvents === "function") {
            this.#eventList.clearEvents();
        } else if (typeof this.#eventList.clearAllEvents === "function") {
            this.#eventList.clearAllEvents();
        }
        this.#history.clearHistory();
    }

    dispatch(eventName, data) {
        const callbacks = this.#eventList.getEventByName(eventName);
        if (!callbacks) return null;

        const results = [];
        callbacks.forEach(cb => {
            try {
                if (typeof cb === "function") {
                    results.push(cb(data));
                } else if (cb && typeof cb.execute === "function") {
                    // Pass data to object-based callbacks as well for consistency
                    results.push(cb.execute(data));
                }
            } catch (e) {
                results.push(null);
            }
        });

        return results;
    }

    getHistory() {
        return this.#history.getHistory();
    }

    getEvent(eventName) {
        return this.#eventList.getEventByName(eventName);
    }

    getAllEvents() {
        if (typeof this.#eventList.getAllEvents === "function") {
            return this.#eventList.getAllEvents();
        }
        return null;
    }

}
